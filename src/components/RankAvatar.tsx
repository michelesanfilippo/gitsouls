"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import type { Rank } from "@/lib/scoring/types";
import { MEDALLION_SIZE, RANK_RING, type MedallionVariant } from "@/lib/rank-ring";

/** Colour a defeated fighter is drained to, matching the duel's HP bar. */
const ASH = "#4b5563";
const ASH_TEXT = "#9ca3af";

interface RankAvatarProps {
  avatarUrl: string;
  login: string;
  level: number;
  rank: Rank;
  /** Which size set to use — the duel gives its portraits more room. */
  variant?: MedallionVariant;
  /** Duel loser: drained of colour, no glow. */
  defeated?: boolean;
}

/**
 * The portrait medallion: avatar, rank regalia, level.
 *
 * Two shapes in one. Ranks with ring art get a fixed-size box with the portrait
 * sized to the ring's hole and the art layered over it, so ornaments overlap the
 * face and the thing reads as a frame rather than a sticker. Hollow has no art,
 * so it keeps the plain coloured border — a husk earns no regalia.
 *
 * The level badge sits above both, centred on the bottom edge, because the ring
 * art puts its heaviest ornament at six o'clock and would otherwise bury it.
 */
export default function RankAvatar({
  avatarUrl,
  login,
  level,
  rank,
  variant = "profile",
  defeated = false,
}: RankAvatarProps) {
  const ring = RANK_RING[rank.name];
  const size = MEDALLION_SIZE[variant][ring ? "ring" : "portrait"];

  // Both sizes go out as custom properties; globals.css picks between them at
  // the sm breakpoint. Tailwind can't compile a class name built from data.
  const box = {
    "--m-base": `${size.base}px`,
    "--m-sm": `${size.sm}px`,
  } as CSSProperties;

  const accent = defeated ? ASH : rank.color;

  const badge = (
    <span
      className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 translate-y-1/2 rounded-full border-2 bg-void/95 px-4 py-1 font-display text-base font-bold tracking-wider sm:text-lg"
      style={{
        borderColor: accent,
        color: defeated ? ASH_TEXT : rank.color,
        ...(defeated
          ? {}
          : {
              boxShadow: `0 0 14px ${rank.color}, 0 0 34px ${rank.glow}`,
              textShadow: `0 0 10px ${rank.glow}`,
            }),
      }}
    >
      LV {level}
    </span>
  );

  const portrait = (
    <>
      <Image
        src={avatarUrl}
        alt={`${login} avatar`}
        width={320}
        height={320}
        priority
        className="h-full w-full object-cover"
      />
      {/* Fog over the portrait. No mix-blend-mode and no animated transform:
          blending forces the portrait beneath to be re-composited every frame.
          Opacity alone is free. */}
      <div
        className="animate-fog pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 70%, rgba(216,216,236,0.30), transparent 55%), radial-gradient(circle at 70% 40%, rgba(196,196,220,0.22), transparent 50%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_-30px_50px_rgba(0,0,0,0.75)]" />
    </>
  );

  const portraitGlow = defeated
    ? "inset 0 0 25px rgba(0,0,0,0.8)"
    : `0 0 80px ${rank.glow}, inset 0 0 25px rgba(0,0,0,0.7)`;

  if (!ring) {
    return (
      <div className="medallion relative" style={box}>
        <div
          className="relative h-full w-full overflow-hidden rounded-full"
          style={{
            border: `6px solid ${accent}`,
            boxShadow: defeated
              ? portraitGlow
              : `0 0 80px ${rank.glow}, 0 0 30px ${rank.color}, inset 0 0 25px rgba(0,0,0,0.7)`,
          }}
        >
          {portrait}
        </div>
        {badge}
      </div>
    );
  }

  return (
    <div className="medallion relative" style={box}>
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
        style={{
          width: `calc(var(--medallion) * ${ring.innerRatio})`,
          height: `calc(var(--medallion) * ${ring.innerRatio})`,
          boxShadow: portraitGlow,
        }}
      >
        {portrait}
      </div>
      <Image
        src={ring.src}
        alt=""
        aria-hidden
        width={512}
        height={512}
        priority
        className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none"
      />
      {badge}
    </div>
  );
}
