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

/** Fetch up to 100 of the user's most recently pushed repositories. */
export async function fetchRepos(username: string): Promise<GitHubRepo[]> {
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(
      username,
    )}/repos?per_page=100&sort=pushed`,
    { headers: authHeaders(), next: { revalidate: REVALIDATE } },
  );
  if (!res.ok) {
    // Repos are non-essential: degrade to an empty list rather than failing.
    return [];
  }
  return (await res.json()) as GitHubRepo[];
}

const CONTRIBUTIONS_QUERY = `
  query ($login: String!) {
    user(login: $login) {
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
  };
}
