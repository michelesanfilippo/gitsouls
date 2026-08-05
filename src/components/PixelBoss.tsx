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
  name?: string | null;
  pronouns?: string | null;
  className: ClassName;
  rankName: RankName;
  displaySize?: number;
}

/**
 * Rank colour as an rgba string for the multiply-blend overlay.
 * multiply blend mode: result = base * overlay / 255.
 * Dark metal pixels (low value) get fully tinted; bright skin pixels
 * (high value, near white) are multiplied by near-white → stay bright.
 * This preserves skin tones while colouring armour/weapons.
 */
const RANK_TINT_COLOR: Record<RankName, string> = {
  "Hollow":         "rgba(80, 80, 100, 0.85)",
  "Undead":         "rgba(60, 90, 60,  0.85)",
  "Knight":         "rgba(40, 80, 220, 0.80)",
  "Abyss Walker":   "rgba(110, 30, 210, 0.80)",
  "Lord":           "rgba(200, 160, 20, 0.80)",
  "Soul of Cinder": "rgba(210, 50, 10,  0.85)",
};

export default function PixelBoss({
  bio, name, pronouns, className, rankName, displaySize = 118,
}: PixelBossProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const rafRef    = useRef<number>(0);
  const stateRef  = useRef({ phaseIdx: 0, frame: 0, repeat: 0, lastTs: 0 });

  const gender = detectGender(bio, name, pronouns);
  const src    = spritesheetPath(className, gender);
  const glow   = RANK_GLOW_COLOR[rankName];
  const tintColor = RANK_TINT_COLOR[rankName];

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

      // Multiply tint: affects only pixels already drawn (opaque sprite pixels).
      // Canvas multiply compositing darkens dark pixels (metal) while light
      // pixels (skin near 255) multiply by ~1 and remain nearly unchanged.
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = tintColor;
      ctx.fillRect(destX, ph.destY, ph.frameW, ph.frameH);
      ctx.globalCompositeOperation = "source-over";

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
