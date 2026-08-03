import { describe, expect, it } from "vitest";
import {
  computeOverall,
  computeStats,
  saturate,
} from "@/lib/scoring/stats";
import type { RawMetrics } from "@/lib/scoring/types";

const zero: RawMetrics = {
  followers: 0,
  publicRepos: 0,
  accountAgeYears: 0.1,
  totalStars: 0,
  totalForks: 0,
  totalWatchers: 0,
  distinctLanguages: 0,
  ownedNonForkRepos: 0,
  reposPerYear: 0,
  totalContributions: 0,
  totalCommits: 0,
  pullRequestContributions: 0,
  longestStreak: 0,
  activeMonths: 0,
  hasContributionData: false,
};

describe("saturate", () => {
  it("returns 0 for non-positive input", () => {
    expect(saturate(0, 100)).toBe(0);
    expect(saturate(-5, 100)).toBe(0);
  });

  it("returns ~63 at the midpoint", () => {
    expect(Math.round(saturate(100, 100))).toBe(63);
  });

  it("is monotonically increasing and bounded below 99", () => {
    expect(saturate(50, 100)).toBeLessThan(saturate(200, 100));
    expect(saturate(1e9, 100)).toBeLessThanOrEqual(99);
  });
});

describe("computeStats", () => {
  it("maps an empty profile to all-zero stats", () => {
    expect(computeStats(zero)).toEqual({
      VIT: 0,
      END: 0,
      INT: 0,
      DEX: 0,
      FAI: 0,
      SOP: 0,
    });
  });

  it("keeps every stat within 0–99", () => {
    const huge: RawMetrics = {
      ...zero,
      followers: 1e6,
      publicRepos: 5000,
      totalStars: 1e6,
      totalForks: 1e5,
      totalWatchers: 1e6,
      distinctLanguages: 40,
      ownedNonForkRepos: 4000,
      reposPerYear: 500,
      totalContributions: 1e5,
      totalCommits: 1e5,
      pullRequestContributions: 1e4,
      longestStreak: 365,
      activeMonths: 12,
    };
    const stats = computeStats(huge);
    for (const v of Object.values(stats)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(99);
    }
  });

  it("raises SOP for a highly-followed profile", () => {
    const social = { ...zero, followers: 5000, totalStars: 5000 };
    expect(computeStats(social).SOP).toBeGreaterThan(50);
  });

  it("raises INT with language breadth", () => {
    const polyglot = { ...zero, distinctLanguages: 12, ownedNonForkRepos: 10 };
    expect(computeStats(polyglot).INT).toBeGreaterThan(30);
  });
});

describe("computeOverall", () => {
  it("averages the six stats", () => {
    expect(
      computeOverall({ VIT: 60, END: 60, INT: 60, DEX: 60, FAI: 60, SOP: 60 }),
    ).toBe(60);
  });
});
