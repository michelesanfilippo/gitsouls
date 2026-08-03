import type { BossClass, StatKey, Stats } from "./types";

/**
 * Class is decided by the boss's highest stat. Ties are broken by the fixed
 * priority order below so the result is always deterministic.
 */
const CLASS_PRIORITY: StatKey[] = ["INT", "DEX", "FAI", "VIT", "END", "SOP"];

export const CLASS_BY_STAT: Record<StatKey, BossClass> = {
  INT: {
    name: "Sorcerer",
    stat: "INT",
    color: "#3b82f6",
    blurb: "Bends many languages to a single, cold will.",
  },
  DEX: {
    name: "Blade Dancer",
    stat: "DEX",
    color: "#ef4444",
    blurb: "Ships in a blur of commits no eye can follow.",
  },
  FAI: {
    name: "Saint",
    stat: "FAI",
    color: "#22c55e",
    blurb: "Gives their work freely to the open commons.",
  },
  VIT: {
    name: "Juggernaut",
    stat: "VIT",
    color: "#cbd5e1",
    blurb: "Endless output that simply will not stop.",
  },
  END: {
    name: "Vanguard",
    stat: "END",
    color: "#a855f7",
    blurb: "Holds the streak through every long night.",
  },
  SOP: {
    name: "Soulkeeper",
    stat: "SOP",
    color: "#d4af37",
    blurb: "Commands a following that hoards their stars.",
  },
};

/** Return the highest stat key, breaking ties by CLASS_PRIORITY. */
export function getTopStat(stats: Stats): StatKey {
  let top: StatKey = CLASS_PRIORITY[0];
  for (const key of CLASS_PRIORITY) {
    if (stats[key] > stats[top]) top = key;
  }
  return top;
}

/** Resolve the boss class from the full stat block. */
export function getClass(stats: Stats): BossClass {
  return CLASS_BY_STAT[getTopStat(stats)];
}
