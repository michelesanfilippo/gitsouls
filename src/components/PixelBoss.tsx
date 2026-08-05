"use client";

import { useEffect, useRef, useState } from "react";
import type { ClassName, RankName } from "@/lib/scoring/types";
import {
  DISPLAY_FRAME, STORY_SEQUENCE,
  spritesheetPath, detectGender,
  RANK_GLOW_COLOR,
} from "@/lib/sprite";

interface PixelBossProps {
  bio: string | null;
  className: ClassName;
  rankName: RankName;
  displaySize?: number;
}

/**
 * CSS filters that tint armour/metal without touching skin tones too much.
 * Using sepia+hue-rotate rather than per-pixel getImageData avoids all
 * canvas readback issues (willReadFrequently, naturalWidth timing, etc.)
 * The sepia base desaturates first, then hue-rotate pushes to the rank colour,
 * and saturate amplifies it. Skin tones shift slightly but remain recognisable.
 */
const RANK_CSS_FILTER: Record<RankName, string> = {
  "Hollow":         "grayscale(0.85) brightness(0.70)",
  "Undead":         "sepia(0.5) hue-rotate(80deg) brightness(0.75)",
  "Knight":         "sepia(0.4) hue-rotate(180deg) saturate(3) brightness(0.92)",
  "Abyss Walker":   "sepia(0.4) hue-rotate(250deg) saturate(4) brightness(0.88)",
  "Lord":           "sepia(0.6) saturate(4) brightness(1.05)",
  "Soul of Cinder": "sepia(0.5) hue-rotate(320deg) saturate(6) brightness(1.10)",
};

export default function PixelBoss({
  bio, className, rankName, displaySize = 118,
}: PixelBossProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const rafRef    = useRef<number>(0);
  const stateRef  = useRef({ phaseIdx: 0, frame: 0, repeat: 0, lastTs: 0 });

  const gender = detectGender(bio);
  const src    = spritesheetPath(className, gender);
  const glow   = RANK_GLOW_COLOR[rankName];
  const filter = RANK_CSS_FILTER[rankName];

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

      ctx.clearRect(0, 0, DISPLAY_FRAME, DISPLAY_FRAME);
      const destX = (DISPLAY_FRAME - ph.frameW) / 2;
      ctx.drawImage(img, sx, ph.sy0, ph.frameW, ph.frameH, destX, ph.destY, ph.frameW, ph.frameH);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loaded]);

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
