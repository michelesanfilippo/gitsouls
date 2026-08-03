import { fetchContributions, fetchRepos, fetchUser } from "./github/client";
import type { GitHubRepo } from "./github/types";
import { buildRawMetrics } from "./github/metrics";
import {
  computeOverall,
  computeStats,
  getClass,
  getRank,
  generateSkills,
  getRankInfo,
} from "./scoring";
import type {
  BossClass,
  Rank,
  Stats,
  Skill,
  RankInfo,
} from "./scoring";
import { generateLore } from "./lore/generate";

export interface BossProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  htmlUrl: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  followers: number;
  publicRepos: number;
  totalStars: number;
  years: number;
  stats: Stats;
  overall: number;
  /** boss level, 1–99, derived from the overall power */
  level: number;
  rank: Rank;
  bossClass: BossClass;
  topLanguage: string | null;
  topRepoName: string | null;
  lore: string;
  skills: Skill[];
  rankInfo: RankInfo;
  hasContributionData: boolean;
}

/** Most frequently used language among owned (non-fork) repos. */
function topLanguage(repos: GitHubRepo[]): string | null {
  const counts = new Map<string, number>();
  for (const r of repos) {
    if (r.fork || !r.language) continue;
    counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [lang, count] of counts) {
    if (count > bestCount) {
      best = lang;
      bestCount = count;
    }
  }
  return best;
}

/** Owned repo with the most stars. */
function topRepo(repos: GitHubRepo[]): GitHubRepo | null {
  return repos
    .filter((r) => !r.fork)
    .reduce<GitHubRepo | null>((best, r) => {
      if (!best || r.stargazers_count > best.stargazers_count) return r;
      return best;
    }, null);
}

/**
 * Build the full boss profile for a username. Throws `GitHubError` when the
 * user cannot be fetched (not found / rate limited); repository and
 * contribution failures degrade gracefully.
 */
export async function getBossProfile(username: string): Promise<BossProfile> {
  const [user, repos, contrib] = await Promise.all([
    fetchUser(username),
    fetchRepos(username),
    fetchContributions(username),
  ]);

  const metrics = buildRawMetrics(user, repos, contrib);
  const stats = computeStats(metrics);
  const overall = computeOverall(stats);
  const rank = getRank(overall);
  const bossClass = getClass(stats);

  const lang = topLanguage(repos);
  const relic = topRepo(repos);

  const lore = generateLore({
    login: user.login,
    name: user.name,
    className: bossClass.name,
    rankName: rank.name,
    topLanguage: lang,
    topRepoName: relic?.name ?? null,
    years: metrics.accountAgeYears,
    overall,
    totalStars: metrics.totalStars,
  });

  return {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
    htmlUrl: user.html_url,
    bio: user.bio,
    location: user.location,
    company: user.company,
    followers: user.followers,
    publicRepos: user.public_repos,
    totalStars: metrics.totalStars,
    years: metrics.accountAgeYears,
    stats,
    overall,
    level: Math.max(1, overall),
    rank,
    bossClass,
    topLanguage: lang,
    topRepoName: relic?.name ?? null,
    lore,
    skills: generateSkills(metrics, overall, lang),
    rankInfo: getRankInfo(overall),
    hasContributionData: metrics.hasContributionData,
  };
}
