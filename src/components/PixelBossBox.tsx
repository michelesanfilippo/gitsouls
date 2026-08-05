"use client";

import type { ClassName, RankName } from "@/lib/scoring/types";
import PixelBoss from "./PixelBoss";
import PixelDuelist from "./PixelDuelist";

interface PixelBossBoxProps {
  bio: string | null;
  className: ClassName;
  rankName: RankName;
  /** "profile" = full sequence; "duel-idle" = walk loop; "duel-death" = death anim */
  mode?: "profile" | "duel-idle" | "duel-death";
  displaySize?: number;
  /** override the box minimum height (default 170px) */
  minHeight?: number;
}

/**
 * The pixel art box shown on both the profile page and the duel page.
 * Identical styling: pixel-paper background with dark vignette overlays,
 * sprite anchored bottom-right so it aligns with the bonfire in the scene.
 */
export default function PixelBossBox({
  bio, className, rankName,
  mode = "profile",
  displaySize,
  minHeight = 170,
}: PixelBossBoxProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-gold/15"
      style={{ minHeight: `${minHeight}px` }}
    >
      {/* Pixel-paper background scene */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/img/pixel-paper.png')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
        }}
      />
      {/* Top/bottom dark vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/30 to-transparent" />
      {/* Left-side fade */}
      <div className="absolute inset-0 bg-gradient-to-r from-void/60 via-transparent to-void/20" />

      {/* Sprite — bottom-right, aligned with the bonfire */}
      <div className="absolute bottom-0 right-10 pb-1">
        {mode === "profile" ? (
          <PixelBoss
            bio={bio}
            className={className}
            rankName={rankName}
            displaySize={displaySize ?? 118}
          />
        ) : (
          <PixelDuelist
            bio={bio}
            className={className}
            rankName={rankName}
            mode={mode === "duel-death" ? "death" : "idle"}
            displaySize={displaySize ?? 118}
          />
        )}
      </div>
    </div>
  );
}
