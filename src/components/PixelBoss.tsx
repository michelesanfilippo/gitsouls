"use client";

import { useEffect, useRef, useState } from "react";
import type { ClassName, RankName } from "@/lib/scoring/types";
import {
  DISPLAY_FRAME, STORY_SEQUENCE,
  spritesheetPath, detectGender,
  RANK_FILTER, RANK_GLOW_COLOR,
} from "@/lib/sprite";

interface PixelBossProps {
  bio: string | null;
  className: ClassName;
  rankName: RankName;
  /**
   * CSS display size in pixels. The canvas is always 96×96 internally;
   * this scales it up via CSS transform so pixel art stays crisp.
   */
  displaySize?: number;
}

export default function PixelBoss({
  bio, className, rankName, displaySize = 90,
}: PixelBossProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const rafRef    = useRef<number>(0);
  const stateRef  = useRef({ phaseIdx: 0, frame: 0, repeat: 0, lastTs: 0 });

  const gender = detectGender(bio);
  const src    = spritesheetPath(className, gender);
  const filter = RANK_FILTER[rankName];
  const glow   = RANK_GLOW_COLOR[rankName];

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    imgRef.current = null;
    const img = new window.Image();
    img.onload  = () => { if (!cancelled) { imgRef.current = img; setLoaded(true); } };
    img.onerror = () => {};
    img.src = src;
    return () => { cancelled = true; setLoaded(false); };
  }, [src]);

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

      const ph = STORY_SEQUENCE[s.phaseIdx];
      const fi = ph.backward ? ph.frameCount - 1 - s.frame : s.frame;
      const sx = ph.sx0 + fi * ph.frameW;
      const sy = ph.sy0;

      ctx.clearRect(0, 0, DISPLAY_FRAME, DISPLAY_FRAME);

      // Centre the 64px frames inside the 96px canvas so the character
      // doesn't jump position between 64px and 96px animations.
      const offset = (DISPLAY_FRAME - ph.frameW) / 2;
      ctx.drawImage(img, sx, sy, ph.frameW, ph.frameH, offset, offset, ph.frameW, ph.frameH);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loaded]);

  const scale = displaySize / DISPLAY_FRAME;

  return (
    <div
      className="relative"
      style={{ width: displaySize, height: displaySize }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full blur-xl opacity-40"
        style={{ background: `radial-gradient(circle, ${glow}, transparent 70%)` }}
      />
      <canvas
        ref={canvasRef}
        width={DISPLAY_FRAME}
        height={DISPLAY_FRAME}
        style={{
          imageRendering: "pixelated",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          filter,
        }}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center font-display text-[9px] uppercase tracking-widest text-muted">
          Summoning…
        </div>
      )}
    </div>
  );
}
