/**
 * Pure helpers that derive streak and active-month figures from the GitHub
 * contribution calendar. Kept separate from the network client so they can
 * be unit-tested against fixtures.
 */

export interface ContributionDay {
  date: string;
  contributionCount: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

/** Flatten the weeks matrix into a single date-ordered list of days. */
export function flattenDays(weeks: ContributionWeek[]): ContributionDay[] {
  return weeks
    .flatMap((w) => w.contributionDays)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Longest run of consecutive days with at least one contribution. */
export function longestStreak(weeks: ContributionWeek[]): number {
  let best = 0;
  let current = 0;
  for (const day of flattenDays(weeks)) {
    if (day.contributionCount > 0) {
      current += 1;
      if (current > best) best = current;
    } else {
      current = 0;
    }
  }
  return best;
}

/** Number of distinct calendar months (YYYY-MM) with any contribution. */
export function activeMonths(weeks: ContributionWeek[]): number {
  const months = new Set<string>();
  for (const day of flattenDays(weeks)) {
    if (day.contributionCount > 0) months.add(day.date.slice(0, 7));
  }
  return months.size;
}
