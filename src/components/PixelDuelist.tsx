"use client";

import { useEffect, useRef, useState } from "react";
import type { ClassName, RankName } from "@/lib/scoring/types";
import {
  DISPLAY_FRAME, DUEL_IDLE_SEQUENCE, DUEL_DEATH_SEQUENCE, DUEL_VICTORY_SEQUENCE,
  spritesheetPath, detectGender,
  RANK_TINT_RGB, RANK_GLOW_COLOR,
  applyArmourTint,
  type AnimPhase,
} from "@/lib/sprite";

interface PixelDuelistProps {
  bio: string | null;
  className: ClassName;
  rankName: RankName;
  mode: "idle" | "death" | "victory";
  displaySize?: number;
}

function runSequence(
  sequence: AnimPhase[],
  ctx: CanvasRenderingContext2D,
  off: HTMLCanvasElement,
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
    ctx.drawImage(off, sx, ph.sy0, ph.frameW, ph.frameH, destX, ph.destY, ph.frameW, ph.frameH);

    rafRef.current = requestAnimationFrame(tick);
  };

  rafRef.current = requestAnimationFrame(tick);
}

export default function PixelDuelist({
  bio, className, rankName, mode, displaySize = 96,
}: PixelDuelistProps) {
  const tintedRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  const gender  = detectGender(bio);
  const src     = spritesheetPath(className, gender);
  const tint    = RANK_TINT_RGB[rankName];
  const glow    = RANK_GLOW_COLOR[rankName];

  const [ready, setReady] = useState(false);

  // Build pre-tinted offscreen canvas once.
  // setReady(false) only in cleanup — see PixelBoss.tsx for the rationale.
  useEffect(() => {
    let cancelled = false;
    tintedRef.current = null;

    const img = new window.Image();
    img.onload = () => {
      if (cancelled) return;
      const off = document.createElement("canvas");
      off.width  = img.naturalWidth;
      off.height = img.naturalHeight;
      const ctx = off.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const id = ctx.getImageData(0, 0, off.width, off.height);
      applyArmourTint(id.data, tint);
      ctx.putImageData(id, 0, 0);
      tintedRef.current = off;
      setReady(true);
    };
    img.onerror = () => {};
    img.src = src;
    return () => { cancelled = true; setReady(false); };
  }, [src, tint]);

  // Animation loop reads from the pre-tinted offscreen canvas.
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const off    = tintedRef.current;
    if (!canvas || !off) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    cancelAnimationFrame(rafRef.current);
    const seq = mode === "death" ? DUEL_DEATH_SEQUENCE
              : mode === "victory" ? DUEL_VICTORY_SEQUENCE
              : DUEL_IDLE_SEQUENCE;
    runSequence(seq, ctx, off, rafRef);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, mode]);

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
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center font-display text-[9px] uppercase tracking-widest text-muted">
          …
        </div>
      )}
    </div>
  );
}
