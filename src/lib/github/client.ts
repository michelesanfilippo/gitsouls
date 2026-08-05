import type { ContributionData, GitHubRepo, GitHubUser } from "./types";
import {
  activeMonths,
  longestStreak,
  type ContributionWeek,
} from "./contributions";

/** How long to cache GitHub responses (seconds). */
const REVALIDATE = 60 * 30;

export type GitHubErrorKind = "not_found" | "rate_limited" | "error";

export class GitHubError extends Error {
  kind: GitHubErrorKind;
  constructor(kind: GitHubErrorKind, message: string) {
    super(message);
    this.name = "GitHubError";
    this.kind = kind;
  }
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "gitsouls",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function throwForStatus(status: number, context: string): never {
  if (status === 404) {
    throw new GitHubError("not_found", `${context}: not found`);
  }
  if (status === 403 || status === 429) {
    throw new GitHubError("rate_limited", `${context}: rate limited`);
  }
  throw new GitHubError("error", `${context}: HTTP ${status}`);
}

/** Fetch the public user record. Throws GitHubError on failure. */
export async function fetchUser(username: string): Promise<GitHubUser> {
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}`,
    { headers: authHeaders(), next: { revalidate: REVALIDATE } },
  );
  if (!res.ok) throwForStatus(res.status, "user");
  return (await res.json()) as GitHubUser;
}

const PER_PAGE = 100;
/**
 * Cap on repositories sampled. Stars, forks, watchers and language breadth are
 * all summed from this sample, so a single page under-counted anyone prolific —
 * three pages covers the vast majority of accounts. The cap exists because each
 * page is a rate-limited request and the tail adds almost nothing to the totals.
 */
const MAX_REPO_PAGES = 3;

/**
 * Fetch the user's most recently pushed repositories, following pagination up to
 * MAX_REPO_PAGES. Stops early on a short page (the last one) and degrades to
 * whatever was collected if a later page fails, since repos are non-essential.
 */
export async function fetchRepos(username: string): Promise<GitHubRepo[]> {
  const user = encodeURIComponent(username);
  const repos: GitHubRepo[] = [];

  for (let page = 1; page <= MAX_REPO_PAGES; page++) {
    let res: Response;
    try {
      res = await fetch(
        `https://api.github.com/users/${user}/repos?per_page=${PER_PAGE}&sort=pushed&page=${page}`,
        { headers: authHeaders(), next: { revalidate: REVALIDATE } },
      );
    } catch {
      break;
    }

    if (!res.ok) break;

    const batch = (await res.json()) as GitHubRepo[];
    if (!Array.isArray(batch) || batch.length === 0) break;

    repos.push(...batch);

    // A page shorter than the limit is the last one.
    if (batch.length < PER_PAGE) break;
  }

  return repos;
}

const CONTRIBUTIONS_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      pronouns
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetch contribution data via the GraphQL API. Requires a GITHUB_TOKEN;
 * returns null when no token is configured or the request fails, so the
 * caller can degrade gracefully to REST-only stats.
 */
export async function fetchContributions(
  username: string,
): Promise<ContributionData | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  let res: Response;
  try {
    res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "gitsouls",
      },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: { login: username },
      }),
      next: { revalidate: REVALIDATE },
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  const json = (await res.json()) as {
    data?: {
      user?: {
        pronouns?: string | null;
        contributionsCollection?: {
          totalCommitContributions: number;
          totalPullRequestContributions: number;
          contributionCalendar: {
            totalContributions: number;
            weeks: ContributionWeek[];
          };
        };
      };
    };
  };

  const cc = json.data?.user?.contributionsCollection;
  if (!cc) return null;

  const weeks = cc.contributionCalendar.weeks;
  return {
    totalContributions: cc.contributionCalendar.totalContributions,
    totalCommits: cc.totalCommitContributions,
    pullRequestContributions: cc.totalPullRequestContributions,
    longestStreak: longestStreak(weeks),
    activeMonths: activeMonths(weeks),
    pronouns: json.data?.user?.pronouns ?? null,
  };
}
