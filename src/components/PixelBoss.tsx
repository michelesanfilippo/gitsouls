"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ClassName, RankName } from "@/lib/scoring/types";
import {
  FRAME_SIZE, STORY_SEQUENCE, DIR_CYCLE,
  spritesheetPath, detectGender,
  RANK_FILTER, RANK_GLOW_COLOR,
  type Dir,
} from "@/lib/sprite";

interface PixelBossProps {
  bio: string | null;
  className: ClassName;
  rankName: RankName;
  /** CSS display size; sprite upscaled from 64×64 */
  displaySize?: number;
}

// ── Direction store (shared, persisted in sessionStorage) ────────────────────
const DIR_KEY = "gitsouls:sprite-dir";
const dirListeners = new Set<() => void>();

function readDir(): Dir {
  try { return (parseInt(sessionStorage.getItem(DIR_KEY) ?? "2", 10) as Dir) ?? 2; }
  catch { return 2; }
}
function subDir(cb: () => void) { dirListeners.add(cb); return () => dirListeners.delete(cb); }
function setDir(d: Dir) {
  try { sessionStorage.setItem(DIR_KEY, String(d)); } catch { /* ignore */ }
  for (const l of dirListeners) l();
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PixelBoss({
  bio, className, rankName, displaySize = 128,
}: PixelBossProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const imgRef     = useRef<HTMLImageElement | null>(null);
  const rafRef     = useRef<number>(0);
  const stateRef   = useRef({
    phaseIdx: 0,    // index into STORY_SEQUENCE
    frame:    0,    // current frame within the phase
    repeat:   0,    // completed repeats of the current phase
    lastTs:   0,
  });

  const dir    = useSyncExternalStore(subDir, readDir, () => 2 as Dir);
  const gender = detectGender(bio);
  const src    = spritesheetPath(className, gender);
  const filter = RANK_FILTER[rankName];
  const glow   = RANK_GLOW_COLOR[rankName];

  const [loaded, setLoaded] = useState(false);

  // Load spritesheet.
  useEffect(() => {
    let cancelled = false;
    imgRef.current = null;
    const img = new window.Image();
    img.onload  = () => { if (!cancelled) { imgRef.current = img; setLoaded(true); } };
    img.onerror = () => { /* stay unloaded */ };
    img.src = src;
    return () => { cancelled = true; setLoaded(false); };
  }, [src]);

  // Animation loop.
  useEffect(() => {
    if (!loaded) return;
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;
    s.phaseIdx = 0; s.frame = 0; s.repeat = 0; s.lastTs = 0;

    const tick = (ts: number) => {
      const phase = STORY_SEQUENCE[s.phaseIdx];
      const mspf  = 1000 / phase.fps;

      if (ts - s.lastTs >= mspf) {
        s.lastTs = ts;
        s.frame++;
        if (s.frame >= phase.frameCount) {
          s.frame = 0;
          s.repeat++;
          if (s.repeat >= phase.repeats) {
            s.repeat = 0;
            s.phaseIdx = (s.phaseIdx + 1) % STORY_SEQUENCE.length;
          }
        }
      }

      const ph        = STORY_SEQUENCE[s.phaseIdx];
      const row       = ph.rowGroup + dir;
      const frameIdx  = ph.backward
        ? ph.frameCount - 1 - s.frame
        : s.frame;
      const sx = frameIdx * FRAME_SIZE;
      const sy = row      * FRAME_SIZE;

      ctx.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE);
      ctx.drawImage(img, sx, sy, FRAME_SIZE, FRAME_SIZE, 0, 0, FRAME_SIZE, FRAME_SIZE);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loaded, dir]);

  // Click cycles the direction.
  const cycleDir = useCallback(() => {
    const idx  = DIR_CYCLE.indexOf(dir);
    const next = DIR_CYCLE[(idx + 1) % DIR_CYCLE.length];
    setDir(next);
  }, [dir]);

  const scale = displaySize / FRAME_SIZE;

  return (
    <div
      className="relative cursor-pointer"
      style={{ width: displaySize, height: displaySize }}
      onClick={cycleDir}
      title="Click to rotate"
    >
      {/* Rank glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full blur-xl opacity-50"
        style={{ background: `radial-gradient(circle, ${glow}, transparent 70%)` }}
      />

      <canvas
        ref={canvasRef}
        width={FRAME_SIZE}
        height={FRAME_SIZE}
        style={{
          imageRendering: "pixelated",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          filter,
        }}
      />

      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center font-display text-[9px] uppercase tracking-widest text-muted"
          style={{ width: displaySize, height: displaySize }}
        >
          Summoning…
        </div>
      )}
    </div>
  );
}
