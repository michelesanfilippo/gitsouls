/**
 * Where a boss sits among all of GitHub. GitHub power is heavily
 * bottom-weighted (most profiles are low level), so we model the population
 * with an exponential decay and express a player's standing as a "top X%".
 */

export interface RankBucket {
  /** inclusive lower bound of the overall range, e.g. 0, 10, 20 … */
  from: number;
  to: number;
  /** relative population height (0–100) for the chart */
  weight: number;
}

export interface RankInfo {
  /** e.g. 2.4 → "Top 2.4% of GitHub" */
  topPercent: number;
  buckets: RankBucket[];
  /** index of the bucket the player falls into */
  userBucket: number;
}

/** Modelled population weight for a given overall level (higher = rarer). */
function population(level: number): number {
  return Math.exp(-level / 24);
}

/** Percentage of the population at or above `overall` (the "top X%"). */
export function topPercent(overall: number): number {
  // Integrate the decay from `overall` upward vs. the whole 0–99 range.
  let above = 0;
  let total = 0;
  for (let l = 0; l <= 99; l++) {
    const w = population(l);
    total += w;
    if (l >= overall) above += w;
  }
  const pct = (above / total) * 100;
  return Math.max(0.3, Math.round(pct * 10) / 10);
}

/** Build the full rank breakdown for the chart popup. */
export function getRankInfo(overall: number): RankInfo {
  const buckets: RankBucket[] = [];
  for (let from = 0; from < 100; from += 10) {
    const mid = from + 5;
    buckets.push({
      from,
      to: from + 9,
      weight: population(mid),
    });
  }
  const maxWeight = Math.max(...buckets.map((b) => b.weight));
  for (const b of buckets) {
    b.weight = Math.round((b.weight / maxWeight) * 100);
  }
  const userBucket = Math.min(9, Math.floor(overall / 10));
  return { topPercent: topPercent(overall), buckets, userBucket };
}
