"use client";

import type { ClassName, RankName } from "@/lib/scoring/types";
import PixelBoss from "./PixelBoss";
import PixelDuelist from "./PixelDuelist";

interface PixelBossBoxProps {
  bio: string | null;
  className: ClassName;
  rankName: RankName;
  /** "profile" = full sequence; "duel-idle" = walk loop; "duel-death" = death; "duel-victory" = sit+freeze */
  mode?: "profile" | "duel-idle" | "duel-death" | "duel-victory";
  displaySize?: number;
  /** box minimum height in px (default 170) */
  minHeight?: number;
  /** horizontal position of the sprite anchor, default "right-10" */
  spriteRight?: string;
}

export default function PixelBossBox({
  bio, className, rankName,
  mode = "profile",
  displaySize,
  minHeight = 170,
  spriteRight = "right-10",
}: PixelBossBoxProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-gold/15"
      style={{ minHeight: `${minHeight}px` }}
    >
      {/* Pixel-paper background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/img/pixel-paper.png')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
        }}
      />
      {/* Vignettes */}
      <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-void/60 via-transparent to-void/20" />

      {/* Sprite anchor */}
      <div className={`absolute bottom-0 pb-1 ${spriteRight}`}>
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
            mode={mode === "duel-death" ? "death" : mode === "duel-victory" ? "victory" : "idle"}
            displaySize={displaySize ?? 118}
          />
        )}
      </div>
    </div>
  );
}
