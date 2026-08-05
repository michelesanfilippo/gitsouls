"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ClassName, RankName } from "@/lib/scoring/types";
import {
  FRAME_SIZE, FRAME_COUNT, ANIM_FPS, animRowY, spritesheetPath, loginGender,
  RANK_FILTER, RANK_GLOW_COLOR, DEFAULT_ANIM,
  type AnimName,
} from "@/lib/sprite";

interface PixelBossProps {
  login: string;
  className: ClassName;
  rankName: RankName;
  /** display size in CSS pixels; sprite is scaled up from 64×64 */
  displaySize?: number;
}

const ANIMS_CYCLE: AnimName[] = ["idle", "walk", "slash", "spellcast", "thrust", "hurt"];

/**
 * Animated pixel art boss. Renders the LPC spritesheet on a canvas element,
 * playing the class default animation on load. Click cycles through animations.
 * The canvas filter property recolours the silver sprite to match the boss rank.
 *
 * All animation is handled with requestAnimationFrame and a frame timer so it
 * degrades gracefully: if the image hasn't loaded, nothing is drawn.
 */
export default function PixelBoss({
  login,
  className,
  rankName,
  displaySize = 192,
}: PixelBossProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const rafRef    = useRef<number>(0);
  const frameRef  = useRef(0);
  const lastRef   = useRef(0);

  const gender   = loginGender(login);
  const src      = spritesheetPath(className, gender);
  const filter   = RANK_FILTER[rankName];
  const glowColor = RANK_GLOW_COLOR[rankName];

  const [anim, setAnim]       = useState<AnimName>(DEFAULT_ANIM[className]);
  const [loaded, setLoaded]   = useState(false);
  const [animLabel, setAnimLabel] = useState<string>(DEFAULT_ANIM[className]);

  // Load the spritesheet once per src change. `loaded` is driven by the
  // callback, never set synchronously inside the effect body.
  useEffect(() => {
    let cancelled = false;
    imgRef.current = null;
    const img = new window.Image();
    img.onload = () => {
      if (cancelled) return;
      imgRef.current = img;
      setLoaded(true);
    };
    img.onerror = () => { /* leave loaded=false */ };
    img.src = src;
    // Reset to loading state via the cleanup of the *previous* run so React
    // never sees setState() called synchronously in the effect body.
    return () => {
      cancelled = true;
      setLoaded(false);
    };
  }, [src]);

  // Animation loop.
  useEffect(() => {
    if (!loaded) return;
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;

    const ctx    = canvas.getContext("2d");
    if (!ctx)   return;

    const fps    = ANIM_FPS[anim];
    const count  = FRAME_COUNT[anim];
    const rowY   = animRowY(anim);
    frameRef.current = 0;

    const tick = (ts: number) => {
      const elapsed = ts - lastRef.current;
      if (elapsed >= 1000 / fps) {
        lastRef.current = ts;
        frameRef.current = (frameRef.current + 1) % count;
      }

      ctx.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE);
      ctx.drawImage(
        img,
        frameRef.current * FRAME_SIZE, rowY, FRAME_SIZE, FRAME_SIZE,
        0, 0, FRAME_SIZE, FRAME_SIZE,
      );

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loaded, anim]);

  // Cycle animation on click.
  const cycleAnim = useCallback(() => {
    setAnim((prev) => {
      const next = ANIMS_CYCLE[(ANIMS_CYCLE.indexOf(prev) + 1) % ANIMS_CYCLE.length];
      setAnimLabel(next);
      return next;
    });
  }, []);

  const scale = displaySize / FRAME_SIZE;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative cursor-pointer"
        style={{
          width:  displaySize,
          height: displaySize,
        }}
        onClick={cycleAnim}
        title="Click to change animation"
      >
        {/* Rank glow behind the sprite */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full opacity-60 blur-xl"
          style={{ background: `radial-gradient(circle, ${glowColor}, transparent 70%)` }}
        />

        {/* Pixel art canvas — scaled up via CSS transform, not canvas size,
            so `imageRendering: pixelated` stays effective */}
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
            className="absolute inset-0 flex items-center justify-center text-muted text-xs font-display uppercase tracking-widest"
            style={{ width: displaySize, height: displaySize }}
          >
            Summoning…
          </div>
        )}
      </div>

      {/* Animation label — visually hidden but available to screen readers */}
      <span className="sr-only">{animLabel}</span>
    </div>
  );
}
