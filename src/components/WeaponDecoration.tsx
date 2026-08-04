"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { type Weapon, subscribe, getActive, equip, unequip } from "@/lib/cursor";

interface WeaponProps {
  weapon: Weapon;
  src: string;
  intrinsic: number;
  sizeClass: string;
  animClass: string;
  /** base aura color (rgba, kept dim at rest, full on hover) */
  auraColor: string;
  /** same color but more opaque, for hover accent */
  auraHover: string;
  label: string;
  hoverTitle: string;
  hoverSub: string;
  wieldedMsg: string;
}

const ssrSnapshot = (): Weapon | null => null;

export default function WeaponDecoration({
  weapon,
  src,
  intrinsic,
  sizeClass,
  animClass,
  auraColor,
  auraHover,
  label,
  hoverTitle,
  hoverSub,
  wieldedMsg,
}: WeaponProps) {
  const active  = useSyncExternalStore(subscribe, getActive, ssrSnapshot);
  const wielded = active === weapon;

  const [hovered, setHovered] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const take = useCallback(() => equip(weapon), [weapon]);

  // Right-click unequips globally (only when this weapon is active).
  useEffect(() => {
    if (!wielded) return;
    const handler = (e: MouseEvent) => { e.preventDefault(); unequip(); };
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, [wielded]);

  // Trigger a single 360° spin on hover-enter; do nothing while already spinning.
  const handleMouseEnter = useCallback(() => {
    setHovered(true);
    if (!spinning) {
      setSpinning(true);
    }
  }, [spinning]);

  const handleMouseLeave = useCallback(() => setHovered(false), []);

  const handleAnimationEnd = useCallback(() => setSpinning(false), []);

  return (
    <div className="relative flex flex-col items-center">
      {/* ---- weapon image + aura (hidden when wielded) ---- */}
      <div
        className={`relative transition-all duration-500 ${
          wielded ? "pointer-events-none scale-90 opacity-0" : "opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={take}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label={label}
          aria-pressed={wielded}
          className="group relative cursor-pointer select-none bg-transparent"
        >
          {/*
            Aura: always present at low opacity, brightens on hover.
            radial-gradient(closest-side) so no hard edge anywhere.
            No blur/filter — would re-rasterise on every frame.
          */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -m-6 rounded-full transition-all duration-400"
            style={{
              background: `radial-gradient(closest-side, ${hovered ? auraHover : auraColor}, transparent)`,
            }}
          />

          {/* Image wrapper for the float + spin animations */}
          <div
            ref={imgRef}
            className={`${animClass} ${spinning ? "weapon-spin" : ""}`}
            onAnimationEnd={spinning ? handleAnimationEnd : undefined}
          >
            <Image
              src={src}
              alt={label}
              width={intrinsic}
              height={intrinsic}
              className={`relative h-auto ${sizeClass}`}
              priority
            />
          </div>

          {/* Hover text */}
          <span className="pointer-events-none absolute left-1/2 top-full w-56 -translate-x-1/2 pt-3 text-center font-display text-xs uppercase tracking-[0.2em] text-gold/0 transition-colors duration-300 group-hover:text-gold/90">
            {hoverTitle}
            <span className="mt-1 block font-serif text-[11px] normal-case italic tracking-normal text-parchment/0 transition-colors duration-300 group-hover:text-parchment/60">
              {hoverSub}
            </span>
          </span>
        </button>
      </div>

      {/* ---- "wielded" message, shown once the image is gone ---- */}
      {wielded && (
        <p className="animate-fade-up w-60 text-center font-serif text-sm italic text-parchment/55">
          {wieldedMsg}
          <span className="mt-1 block font-display text-[10px] uppercase not-italic tracking-[0.2em] text-gold/50">
            Right-click to sheathe
          </span>
        </p>
      )}
    </div>
  );
}
