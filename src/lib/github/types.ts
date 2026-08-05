/** Minimal shapes of the GitHub API responses we consume. */

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
  created_at: string;
}

export interface GitHubRepo {
  name: string;
  fork: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  created_at: string;
  pushed_at: string;
  topics?: string[];
}

/** Flattened result of the GraphQL contributionsCollection query. */
export interface ContributionData {
  totalContributions: number;
  totalCommits: number;
  pullRequestContributions: number;
  longestStreak: number;
  activeMonths: number;
  /** The user's self-declared pronouns from their GitHub profile, or null. */
  pronouns: string | null;
}
