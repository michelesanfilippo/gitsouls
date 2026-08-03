/**
 * Core scoring types. These are decoupled from the GitHub API shape: the
 * data layer is responsible for producing a `RawMetrics` object, which the
 * pure scoring functions turn into stats, a rank and a class.
 */

export type StatKey = "VIT" | "END" | "INT" | "DEX" | "FAI" | "SOP";

export const STAT_KEYS: StatKey[] = ["VIT", "END", "INT", "DEX", "FAI", "SOP"];

export const STAT_LABELS: Record<StatKey, string> = {
  VIT: "Vitality",
  END: "Endurance",
  INT: "Intelligence",
  DEX: "Dexterity",
  FAI: "Faith",
  SOP: "Soul Power",
};

export type Stats = Record<StatKey, number>;

/**
 * Normalized, source-agnostic metrics extracted from a GitHub profile.
 * Every field is a raw count/measure; the scoring functions apply the
 * saturating curves that map these onto the 0–99 stat range.
 */
export interface RawMetrics {
  followers: number;
  /** user.public_repos — owned public repos, forks included */
  publicRepos: number;
  accountAgeYears: number;
  /** sum of stargazers across sampled repos */
  totalStars: number;
  /** sum of forks received across sampled repos */
  totalForks: number;
  totalWatchers: number;
  distinctLanguages: number;
  /** sampled owned repos that are not forks */
  ownedNonForkRepos: number;
  /** repos created per year over the account lifetime */
  reposPerYear: number;
  /** total contributions in the last year (0 when unavailable) */
  totalContributions: number;
  totalCommits: number;
  pullRequestContributions: number;
  /** longest streak of consecutive active days */
  longestStreak: number;
  /** months with at least one contribution in the last year (0–12) */
  activeMonths: number;
  /** false when contribution data could not be fetched (no token) */
  hasContributionData: boolean;
}

export type RankName =
  | "Hollow"
  | "Undead"
  | "Knight"
  | "Abyss Walker"
  | "Lord"
  | "Soul of Cinder";

export interface Rank {
  name: RankName;
  /** inclusive upper bound of the tier (top tier uses Infinity) */
  max: number;
  /** hex used for the boss avatar border */
  color: string;
  /** rgba glow used behind the avatar */
  glow: string;
  tagline: string;
}

export type ClassName =
  | "Sorcerer"
  | "Blade Dancer"
  | "Saint"
  | "Juggernaut"
  | "Vanguard"
  | "Soulkeeper";

export interface BossClass {
  name: ClassName;
  stat: StatKey;
  color: string;
  blurb: string;
}
