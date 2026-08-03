import type { ContributionData, GitHubRepo, GitHubUser } from "./types";
import type { RawMetrics } from "../scoring/types";

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;

/**
 * Combine the user record, a sample of repositories and (optional)
 * contribution data into the source-agnostic `RawMetrics` consumed by the
 * scoring engine. Pure: `now` is injected so results are deterministic.
 */
export function buildRawMetrics(
  user: GitHubUser,
  repos: GitHubRepo[],
  contrib: ContributionData | null,
  now: Date = new Date(),
): RawMetrics {
  const owned = repos.filter((r) => !r.fork);

  const totalStars = owned.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = owned.reduce((s, r) => s + r.forks_count, 0);
  const totalWatchers = owned.reduce((s, r) => s + r.watchers_count, 0);

  const languages = new Set<string>();
  for (const r of owned) {
    if (r.language) languages.add(r.language);
  }

  const accountAgeYears = Math.max(
    0.1,
    (now.getTime() - new Date(user.created_at).getTime()) / MS_PER_YEAR,
  );

  return {
    followers: user.followers,
    publicRepos: user.public_repos,
    accountAgeYears,
    totalStars,
    totalForks,
    totalWatchers,
    distinctLanguages: languages.size,
    ownedNonForkRepos: owned.length,
    reposPerYear: user.public_repos / accountAgeYears,
    totalContributions: contrib?.totalContributions ?? 0,
    totalCommits: contrib?.totalCommits ?? 0,
    pullRequestContributions: contrib?.pullRequestContributions ?? 0,
    longestStreak: contrib?.longestStreak ?? 0,
    activeMonths: contrib?.activeMonths ?? 0,
    hasContributionData: contrib !== null,
  };
}
