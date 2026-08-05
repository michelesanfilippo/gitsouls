"use client";

import { useEffect, useRef, useState } from "react";
import type { ClassName, RankName } from "@/lib/scoring/types";
import {
  DISPLAY_FRAME, DUEL_IDLE_SEQUENCE, DUEL_DEATH_SEQUENCE, DUEL_VICTORY_SEQUENCE,
  spritesheetPath, detectGender,
  RANK_GLOW_COLOR,
  type AnimPhase,
} from "@/lib/sprite";

interface PixelDuelistProps {
  bio: string | null;
  className: ClassName;
  rankName: RankName;
  mode: "idle" | "death" | "victory";
  displaySize?: number;
}

const RANK_CSS_FILTER: Record<RankName, string> = {
  "Hollow":         "grayscale(0.85) brightness(0.70)",
  "Undead":         "sepia(0.5) hue-rotate(80deg) brightness(0.75)",
  "Knight":         "sepia(0.4) hue-rotate(180deg) saturate(3) brightness(0.92)",
  "Abyss Walker":   "sepia(0.4) hue-rotate(250deg) saturate(4) brightness(0.88)",
  "Lord":           "sepia(0.6) saturate(4) brightness(1.05)",
  "Soul of Cinder": "sepia(0.5) hue-rotate(320deg) saturate(6) brightness(1.10)",
};

function runSequence(
  sequence: AnimPhase[],
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  rafRef: React.MutableRefObject<number>,
) {
  const s = { phaseIdx: 0, frame: 0, repeat: 0, lastTs: 0 };

  const tick = (ts: number) => {
    const phase = sequence[s.phaseIdx];
    if (ts - s.lastTs >= 1000 / phase.fps) {
      s.lastTs = ts;
      s.frame++;
      if (s.frame >= phase.frameCount) {
        s.frame = 0;
        s.repeat++;
        const nextPhase = s.phaseIdx + 1;
        if (s.repeat >= phase.repeats && nextPhase < sequence.length) {
          s.repeat   = 0;
          s.phaseIdx = nextPhase;
        } else if (s.repeat >= phase.repeats) {
          s.frame = phase.frameCount - 1;
        }
      }
    }

    const ph = sequence[s.phaseIdx];
    const fi = ph.backward ? ph.frameCount - 1 - s.frame : s.frame;
    const sx = ph.sx0 + fi * ph.frameW;

    ctx.clearRect(0, 0, DISPLAY_FRAME, DISPLAY_FRAME);
    const destX = (DISPLAY_FRAME - ph.frameW) / 2;
    ctx.drawImage(img, sx, ph.sy0, ph.frameW, ph.frameH, destX, ph.destY, ph.frameW, ph.frameH);

    rafRef.current = requestAnimationFrame(tick);
  };

  rafRef.current = requestAnimationFrame(tick);
}

export default function PixelDuelist({
  bio, className, rankName, mode, displaySize = 96,
}: PixelDuelistProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const rafRef    = useRef<number>(0);

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

    cancelAnimationFrame(rafRef.current);
    const seq = mode === "death" ? DUEL_DEATH_SEQUENCE
              : mode === "victory" ? DUEL_VICTORY_SEQUENCE
              : DUEL_IDLE_SEQUENCE;
    runSequence(seq, ctx, img, rafRef);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loaded, mode]);

  const scale = displaySize / DISPLAY_FRAME;

  return (
    <div className="relative" style={{ width: displaySize, height: displaySize }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full blur-xl opacity-35"
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
          …
        </div>
      )}
    </div>
  );
}
