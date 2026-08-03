import { describe, expect, it } from "vitest";
import {
  activeMonths,
  flattenDays,
  longestStreak,
  type ContributionWeek,
} from "@/lib/github/contributions";

/** Build weeks from a flat [date, count] list for readable fixtures. */
function weeks(days: [string, number][]): ContributionWeek[] {
  return [
    {
      contributionDays: days.map(([date, contributionCount]) => ({
        date,
        contributionCount,
      })),
    },
  ];
}

describe("flattenDays", () => {
  it("sorts days by date ascending", () => {
    const w = weeks([
      ["2024-01-03", 1],
      ["2024-01-01", 2],
      ["2024-01-02", 0],
    ]);
    expect(flattenDays(w).map((d) => d.date)).toEqual([
      "2024-01-01",
      "2024-01-02",
      "2024-01-03",
    ]);
  });
});

describe("longestStreak", () => {
  it("counts the longest consecutive run of active days", () => {
    const w = weeks([
      ["2024-01-01", 1],
      ["2024-01-02", 3],
      ["2024-01-03", 0],
      ["2024-01-04", 2],
      ["2024-01-05", 2],
      ["2024-01-06", 5],
    ]);
    expect(longestStreak(w)).toBe(3);
  });

  it("is 0 when there is no activity", () => {
    expect(longestStreak(weeks([["2024-01-01", 0]]))).toBe(0);
  });
});

describe("activeMonths", () => {
  it("counts distinct months with any contribution", () => {
    const w = weeks([
      ["2024-01-31", 1],
      ["2024-02-01", 2],
      ["2024-02-15", 0],
      ["2024-03-10", 4],
    ]);
    expect(activeMonths(w)).toBe(3);
  });
});
