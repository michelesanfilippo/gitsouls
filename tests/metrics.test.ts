import { describe, expect, it } from "vitest";
import { buildRawMetrics } from "@/lib/github/metrics";
import type { GitHubRepo, GitHubUser } from "@/lib/github/types";

const NOW = new Date("2024-01-01T00:00:00Z");

const user: GitHubUser = {
  login: "artorias",
  name: "Knight Artorias",
  avatar_url: "https://avatars.githubusercontent.com/u/1",
  html_url: "https://github.com/artorias",
  bio: null,
  company: null,
  location: null,
  followers: 300,
  following: 5,
  public_repos: 40,
  public_gists: 0,
  created_at: "2018-01-01T00:00:00Z", // 6 years before NOW
};

function repo(over: Partial<GitHubRepo>): GitHubRepo {
  return {
    name: "repo",
    fork: false,
    language: "TypeScript",
    stargazers_count: 0,
    forks_count: 0,
    watchers_count: 0,
    created_at: "2020-01-01T00:00:00Z",
    pushed_at: "2023-01-01T00:00:00Z",
    ...over,
  };
}

describe("buildRawMetrics", () => {
  it("aggregates owned repos and excludes forks", () => {
    const repos = [
      repo({ name: "a", language: "TypeScript", stargazers_count: 100, forks_count: 10, watchers_count: 100 }),
      repo({ name: "b", language: "Go", stargazers_count: 50, forks_count: 5, watchers_count: 50 }),
      repo({ name: "forked", fork: true, language: "Rust", stargazers_count: 999 }),
    ];
    const m = buildRawMetrics(user, repos, null, NOW);

    expect(m.ownedNonForkRepos).toBe(2);
    expect(m.totalStars).toBe(150);
    expect(m.totalForks).toBe(15);
    expect(m.distinctLanguages).toBe(2); // Rust excluded (fork)
    expect(m.hasContributionData).toBe(false);
  });

  it("computes account age and repos-per-year", () => {
    const m = buildRawMetrics(user, [], null, NOW);
    expect(Math.round(m.accountAgeYears)).toBe(6);
    expect(Math.round(m.reposPerYear)).toBe(7); // 40 / ~6
  });

  it("merges contribution data when present", () => {
    const m = buildRawMetrics(
      user,
      [],
      {
        totalContributions: 1200,
        totalCommits: 900,
        pullRequestContributions: 30,
        longestStreak: 45,
        activeMonths: 11,
      },
      NOW,
    );
    expect(m.totalContributions).toBe(1200);
    expect(m.longestStreak).toBe(45);
    expect(m.hasContributionData).toBe(true);
  });
});
