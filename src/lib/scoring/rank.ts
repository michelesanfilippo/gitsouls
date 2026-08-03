import type { Rank } from "./types";

/**
 * Boss ranking tiers, ordered by ascending overall score. Thresholds and
 * colors follow the README badge table:
 *   Hollow ≤20 · Undead ≤40 · Knight ≤60 · Abyss Walker ≤75 · Lord ≤90 · Soul of Cinder >90
 */
export const RANKS: Rank[] = [
  {
    name: "Hollow",
    max: 20,
    color: "#6b7280",
    glow: "rgba(107, 114, 128, 0.45)",
    tagline: "A husk that still clutches the keyboard.",
  },
  {
    name: "Undead",
    max: 40,
    color: "#166534",
    glow: "rgba(22, 101, 52, 0.5)",
    tagline: "Cursed to commit, again and again.",
  },
  {
    name: "Knight",
    max: 60,
    color: "#4682b4",
    glow: "rgba(70, 130, 180, 0.55)",
    tagline: "Sworn to the craft, blade well kept.",
  },
  {
    name: "Abyss Walker",
    max: 75,
    color: "#7c3aed",
    glow: "rgba(124, 58, 237, 0.55)",
    tagline: "Wanders where lesser branches fear to merge.",
  },
  {
    name: "Lord",
    max: 90,
    color: "#d4af37",
    glow: "rgba(212, 175, 55, 0.6)",
    tagline: "A sovereign whose repos bend the realm.",
  },
  {
    name: "Soul of Cinder",
    max: Infinity,
    color: "#dc2626",
    glow: "rgba(220, 38, 38, 0.65)",
    tagline: "The amalgam of every Lord who ever shipped.",
  },
];

/** Resolve the rank tier for an overall score (0–99). */
export function getRank(overall: number): Rank {
  return RANKS.find((r) => overall <= r.max) ?? RANKS[RANKS.length - 1];
}
