import type { RawMetrics, Stats } from "./types";

/**
 * Saturating curve: maps an unbounded, non-negative metric onto 0–99.
 * At `value === midpoint` the output is ~63 (1 − 1/e), so `midpoint`
 * is the "solidly above average" reference point for each metric.
 */
export function saturate(value: number, midpoint: number): number {
  if (value <= 0 || midpoint <= 0) return 0;
  return 99 * (1 - Math.exp(-value / midpoint));
}

const clamp99 = (n: number): number => Math.max(0, Math.min(99, Math.round(n)));

/**
 * Turn raw profile metrics into the six Souls stats (each 0–99).
 * Pure and deterministic — the single source of truth exercised by tests.
 */
export function computeStats(m: RawMetrics): Stats {
  // VIT — vitality: raw activity volume
  const vit =
    0.6 * saturate(m.totalContributions, 1500) +
    0.4 * saturate(m.totalCommits, 800);

  // END — endurance: consistency and longevity
  const end =
    0.45 * saturate(m.longestStreak, 60) +
    0.35 * ((Math.min(m.activeMonths, 12) / 12) * 99) +
    0.2 * saturate(m.accountAgeYears, 6);

  // INT — intelligence: breadth of stack and repo quality
  const avgStars =
    m.ownedNonForkRepos > 0 ? m.totalStars / m.ownedNonForkRepos : 0;
  const int =
    0.55 * saturate(m.distinctLanguages, 8) + 0.45 * saturate(avgStars, 20);

  // DEX — dexterity: output volume and cadence
  const dex =
    0.5 * saturate(m.publicRepos, 30) +
    0.3 * saturate(m.reposPerYear, 8) +
    0.2 * saturate(m.totalCommits, 800);

  // FAI — faith: open-source giving
  const fai =
    0.4 * saturate(m.ownedNonForkRepos, 25) +
    0.3 * saturate(m.totalForks, 20) +
    0.3 * saturate(m.pullRequestContributions, 40);

  // SOP — soul power: reputation and reach
  const sop =
    0.5 * saturate(m.followers, 150) +
    0.4 * saturate(m.totalStars, 200) +
    0.1 * saturate(m.totalWatchers, 200);

  return {
    VIT: clamp99(vit),
    END: clamp99(end),
    INT: clamp99(int),
    DEX: clamp99(dex),
    FAI: clamp99(fai),
    SOP: clamp99(sop),
  };
}

/** Overall power = mean of the six stats (0–99), used for level and rank. */
export function computeOverall(stats: Stats): number {
  const sum =
    stats.VIT + stats.END + stats.INT + stats.DEX + stats.FAI + stats.SOP;
  return Math.round(sum / 6);
}
