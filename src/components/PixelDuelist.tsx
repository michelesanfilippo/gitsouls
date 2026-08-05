"use client";

import { useEffect, useRef, useState } from "react";
import type { ClassName, RankName } from "@/lib/scoring/types";
import {
  DISPLAY_FRAME, DUEL_IDLE_SEQUENCE, DUEL_DEATH_SEQUENCE,
  spritesheetPath, detectGender,
  RANK_TINT_RGB, RANK_GLOW_COLOR,
  applyArmourTint,
  type AnimPhase,
} from "@/lib/sprite";

interface PixelDuelistProps {
  bio: string | null;
  className: ClassName;
  rankName: RankName;
  /** "idle" plays the standing-with-weapon loop; "death" plays the death animation then freezes */
  mode: "idle" | "death";
  displaySize?: number;
}

function runSequence(
  sequence: AnimPhase[],
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  tint: [number, number, number],
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
          // Final phase exhausted — freeze on last frame.
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

    // Selective armour tint — only low-saturation (metal) pixels.
    const id = ctx.getImageData(0, 0, DISPLAY_FRAME, DISPLAY_FRAME);
    applyArmourTint(id.data, tint);
    ctx.putImageData(id, 0, 0);

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

  const gender  = detectGender(bio);
  const src     = spritesheetPath(className, gender);
  const tint = RANK_TINT_RGB[rankName];
  const glow = RANK_GLOW_COLOR[rankName];

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
    const seq = mode === "death" ? DUEL_DEATH_SEQUENCE : DUEL_IDLE_SEQUENCE;
    runSequence(seq, ctx, img, tint, rafRef);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loaded, mode, tint]);

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
