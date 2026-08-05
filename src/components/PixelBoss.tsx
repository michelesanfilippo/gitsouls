"use client";

import { useEffect, useRef, useState } from "react";
import type { ClassName, RankName } from "@/lib/scoring/types";
import {
  DISPLAY_FRAME, STORY_SEQUENCE,
  spritesheetPath, detectGender,
  RANK_TINT_RGB, RANK_GLOW_COLOR, applyArmourTint,
} from "@/lib/sprite";

interface PixelBossProps {
  bio: string | null;
  name?: string | null;
  pronouns?: string | null;
  className: ClassName;
  rankName: RankName;
  displaySize?: number;
}

export default function PixelBoss({
  bio, name, pronouns, className, rankName, displaySize = 118,
}: PixelBossProps) {
  // offRef holds an offscreen canvas with the full spritesheet already tinted.
  // It is created inside img.onload where naturalWidth is guaranteed non-zero.
  const offRef    = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const stateRef  = useRef({ phaseIdx: 0, frame: 0, repeat: 0, lastTs: 0 });

  const gender = detectGender(bio, name, pronouns);
  const src    = spritesheetPath(className, gender);
  const tint   = RANK_TINT_RGB[rankName];
  const glow   = RANK_GLOW_COLOR[rankName];

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    offRef.current = null;

    const img = new window.Image();
    img.onload = () => {
      if (cancelled) return;
      // naturalWidth is guaranteed valid here — this is the only safe place.
      const off = document.createElement("canvas");
      off.width  = img.naturalWidth;
      off.height = img.naturalHeight;
      const ctx  = off.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      // applyArmourTint: colours only low-saturation (metal/grey) pixels.
      const id = ctx.getImageData(0, 0, off.width, off.height);
      applyArmourTint(id.data, tint);
      ctx.putImageData(id, 0, 0);
      offRef.current = off;
      setReady(true);
    };
    img.onerror = () => {};
    img.src = src;
    return () => { cancelled = true; setReady(false); };
  }, [src, tint]);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const off    = offRef.current;
    if (!canvas || !off) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;
    s.phaseIdx = 0; s.frame = 0; s.repeat = 0; s.lastTs = 0;

    const tick = (ts: number) => {
      const phase = STORY_SEQUENCE[s.phaseIdx];
      if (ts - s.lastTs >= 1000 / phase.fps) {
        s.lastTs = ts;
        s.frame++;
        if (s.frame >= phase.frameCount) {
          s.frame = 0;
          s.repeat++;
          if (s.repeat >= phase.repeats) {
            s.repeat   = 0;
            s.phaseIdx = (s.phaseIdx + 1) % STORY_SEQUENCE.length;
          }
        }
      }

      const ph    = STORY_SEQUENCE[s.phaseIdx];
      const fi    = ph.backward ? ph.frameCount - 1 - s.frame : s.frame;
      const sx    = ph.sx0 + fi * ph.frameW;
      const destX = (DISPLAY_FRAME - ph.frameW) / 2;

      ctx.clearRect(0, 0, DISPLAY_FRAME, DISPLAY_FRAME);
      ctx.drawImage(off, sx, ph.sy0, ph.frameW, ph.frameH, destX, ph.destY, ph.frameW, ph.frameH);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready]);

  const scale = displaySize / DISPLAY_FRAME;

  return (
    <div className="relative" style={{ width: displaySize, height: displaySize }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full blur-xl opacity-40"
        style={{ background: `radial-gradient(circle, ${glow}, transparent 70%)` }}
      />
      <canvas
        ref={canvasRef}
        width={DISPLAY_FRAME}
        height={DISPLAY_FRAME}
        data-pixel-boss="true"
        style={{
          imageRendering: "pixelated",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center font-display text-[9px] uppercase tracking-widest text-muted">
          Summoning…
        </div>
      )}
    </div>
  );
}
