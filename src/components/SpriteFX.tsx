"use client";

import type { RankName } from "@/lib/scoring/types";
import type { Skill } from "@/lib/scoring/skills";

interface SpriteFXProps {
  rankName: RankName;
  skills: Skill[];
  children: React.ReactNode;
  /** size of the sprite display in px */
  size: number;
}

/** Total skill weight — high totals unlock denser effects. */
const totalSkillPower = (skills: Skill[]) =>
  skills.reduce((s, k) => s + k.power, 0);

/**
 * Wraps a sprite with CSS-only particle effects that scale with boss rank.
 * All motion is `transform` + `opacity` only — no blur/filter on animated
 * elements, which caused the flicker.
 */
export default function SpriteFX({ rankName, skills, children, size }: SpriteFXProps) {
  const power = totalSkillPower(skills);
  const dense = power >= 12; // extra particles for strong profiles

  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
      {children}
      <Particles rankName={rankName} dense={dense} size={size} />
    </div>
  );
}

// ── Per-rank particle configs ─────────────────────────────────────────────────

interface PConfig {
  color: string;
  count: number;
  /** animation class prefix defined in globals.css */
  anim: string;
  /** optional ring glow class */
  ring?: string;
}

const CONFIGS: Partial<Record<RankName, PConfig>> = {
  "Undead": {
    color: "rgba(90,140,80,0.85)",
    count: 3,
    anim: "fx-rise",
  },
  "Knight": {
    color: "rgba(80,140,255,0.90)",
    count: 5,
    anim: "fx-spark",
    ring: "fx-ring-knight",
  },
  "Abyss Walker": {
    color: "rgba(190,60,255,0.90)",
    count: 7,
    anim: "fx-orbit",
    ring: "fx-ring-abyss",
  },
  "Lord": {
    color: "rgba(220,180,20,0.95)",
    count: 9,
    anim: "fx-float",
    ring: "fx-ring-lord",
  },
  "Soul of Cinder": {
    color: "rgba(255,80,10,0.95)",
    count: 12,
    anim: "fx-ember",
    ring: "fx-ring-cinder",
  },
};

// Pre-computed deterministic positions / delays so it doesn't change each render.
const SLOTS = Array.from({ length: 16 }, (_, i) => ({
  angle: (i * 360) / 16,
  delay: `${(i * 0.37) % 2.4}s`,
  scale: 0.7 + (i % 3) * 0.2,
  r: 44 + (i % 4) * 10,
}));

function Particles({ rankName, dense, size }: { rankName: RankName; dense: boolean; size: number }) {
  const cfg = CONFIGS[rankName];
  if (!cfg) return null;

  const count = dense ? Math.min(cfg.count + 4, 16) : cfg.count;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <>
      {/* Ring glow */}
      {cfg.ring && (
        <div
          aria-hidden
          className={cfg.ring}
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Particles */}
      {SLOTS.slice(0, count).map((s, i) => {
        const rad = (s.angle * Math.PI) / 180;
        const x = cx + Math.cos(rad) * s.r - 4;
        const y = cy + Math.sin(rad) * s.r - 4;
        return (
          <div
            key={i}
            aria-hidden
            className={cfg.anim}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 6 * s.scale,
              height: 6 * s.scale,
              borderRadius: "50%",
              backgroundColor: cfg.color,
              animationDelay: s.delay,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}
