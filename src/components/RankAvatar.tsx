"use client";

import Image from "next/image";
import type { Rank } from "@/lib/scoring/types";
import { RANK_RING } from "@/lib/rank-ring";

interface RankAvatarProps {
  avatarUrl: string;
  login: string;
  level: number;
  rank: Rank;
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
}: RankAvatarProps) {
  const ring = RANK_RING[rank.name];

  const badge = (
    <span
      className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 translate-y-1/2 rounded-full border-2 bg-void/95 px-4 py-1 font-display text-base font-bold tracking-wider sm:text-lg"
      style={{
        borderColor: rank.color,
        color: rank.color,
        boxShadow: `0 0 14px ${rank.color}, 0 0 34px ${rank.glow}`,
        textShadow: `0 0 10px ${rank.glow}`,
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

  if (!ring) {
    return (
      <div className="relative">
        <div
          className="relative h-40 w-40 overflow-hidden rounded-full sm:h-44 sm:w-44"
          style={{
            border: `6px solid ${rank.color}`,
            boxShadow: `0 0 80px ${rank.glow}, 0 0 30px ${rank.color}, inset 0 0 25px rgba(0,0,0,0.7)`,
          }}
        >
          {portrait}
        </div>
        {badge}
      </div>
    );
  }

  // --medallion is the outer box, identical for every ranked ring so the column does
  // not reflow between a thin band and a fat one; the portrait is what varies.
  return (
    <div
      className="relative [--medallion:260px] sm:[--medallion:300px]"
      style={{ width: "var(--medallion)", height: "var(--medallion)" }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
        style={{
          width: `calc(var(--medallion) * ${ring.innerRatio})`,
          height: `calc(var(--medallion) * ${ring.innerRatio})`,
          boxShadow: `0 0 80px ${rank.glow}, inset 0 0 25px rgba(0,0,0,0.7)`,
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
