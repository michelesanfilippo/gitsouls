"use client";

import Image from "next/image";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { type Weapon, subscribe, getActive, equip, unequip } from "@/lib/cursor";

interface WeaponProps {
  weapon: Weapon;
  /** path inside /public */
  src: string;
  /** image intrinsic width & height */
  intrinsic: number;
  /** tailwind size classes, e.g. "w-24 sm:w-32" */
  sizeClass: string;
  /** animation class, e.g. "animate-sword" */
  animClass: string;
  /** aura colour as a CSS color string */
  auraColor: string;
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
  label,
  hoverTitle,
  hoverSub,
  wieldedMsg,
}: WeaponProps) {
  const active = useSyncExternalStore(subscribe, getActive, ssrSnapshot);
  const wielded = active === weapon;
  // Another weapon is equipped — this one fades but stays visible.
  const displaced = active !== null && !wielded;

  const take = useCallback(() => {
    if (wielded) return; // already ours
    equip(weapon);
  }, [weapon, wielded]);

  // Right-click anywhere unequips whichever weapon is active.
  useEffect(() => {
    if (!wielded) return;
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      unequip();
    };
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, [wielded]);

  return (
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={take}
        aria-label={label}
        aria-pressed={wielded}
        className={`${animClass} group relative cursor-pointer select-none bg-transparent transition-all duration-500 hover:scale-110 ${
          wielded ? "pointer-events-none scale-90 opacity-0" : ""
        } ${displaced ? "opacity-40" : "opacity-100"}`}
      >
        {/* Aura — radial gradient, no blur/filter so it never re-rasterises */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -m-6 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(closest-side, ${auraColor}, transparent)`,
          }}
        />

        <Image
          src={src}
          alt={label}
          width={intrinsic}
          height={intrinsic}
          className={`relative h-auto ${sizeClass}`}
          priority
        />

        {/* Hover text */}
        <span className="pointer-events-none absolute left-1/2 top-full w-56 -translate-x-1/2 pt-3 text-center font-display text-xs uppercase tracking-[0.2em] text-gold/0 transition-colors duration-300 group-hover:text-gold/90">
          {hoverTitle}
          <span className="mt-1 block font-serif text-[11px] normal-case italic tracking-normal text-parchment/0 transition-colors duration-300 group-hover:text-parchment/60">
            {hoverSub}
          </span>
        </span>
      </button>

      {wielded && (
        <p className="animate-fade-up absolute top-1/2 w-60 -translate-y-1/2 text-center font-serif text-sm italic text-parchment/45">
          {wieldedMsg}
          <span className="mt-1 block font-display text-[10px] uppercase not-italic tracking-[0.2em] text-gold/50">
            Right-click to sheathe
          </span>
        </p>
      )}
    </div>
  );
}
