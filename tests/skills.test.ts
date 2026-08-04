import { describe, expect, it } from "vitest";
import { generateSkills } from "@/lib/scoring/skills";
import type { RawMetrics } from "@/lib/scoring/types";

const base: RawMetrics = {
  followers: 0,
  publicRepos: 0,
  accountAgeYears: 0,
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

describe("generateSkills", () => {
  it("always grants the baseline skill", () => {
    const skills = generateSkills(base, 0, null);
    expect(skills.length).toBeGreaterThanOrEqual(1);
    expect(skills.some((s) => s.name === "Kindling Spark")).toBe(true);
  });

  it("gives a language skill when a top language exists", () => {
    const skills = generateSkills(base, 10, "TypeScript");
    expect(skills.some((s) => s.name.includes("TypeScript"))).toBe(true);
  });

  it("stronger profiles unlock strictly more skills", () => {
    const weak = generateSkills(base, 5, null);
    const strong = generateSkills(
      {
        ...base,
        followers: 2000,
        publicRepos: 40,
        totalStars: 500,
        totalForks: 40,
        distinctLanguages: 8,
        ownedNonForkRepos: 20,
        totalContributions: 1500,
        longestStreak: 90,
        accountAgeYears: 12,
      },
      90,
      "Rust",
    );
    expect(strong.length).toBeGreaterThan(weak.length);
  });

  it("returns objects without the internal unlocked flag", () => {
    const skills = generateSkills(base, 0, "Go");
    for (const s of skills) {
      expect(Object.keys(s).sort()).toEqual(["how", "icon", "name", "note"]);
    }
  });

  it("explains how each unlocked skill was earned", () => {
    const skills = generateSkills({ ...base, followers: 1500 }, 0, "Go");
    for (const s of skills) {
      expect(s.how.length).toBeGreaterThan(0);
    }
  });
});
