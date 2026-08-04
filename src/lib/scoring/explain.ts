import type { StatKey } from "./types";

/**
 * Human explanations of how each stat is derived — the single source of truth
 * for the stat tooltips and the "How it works" modal, so the two can't drift.
 *
 * Every stat is a weighted sum of `saturate(value, midpoint)` terms from
 * `stats.ts`, where a metric sitting exactly at its midpoint scores ~63/99.
 */
export interface StatExplainer {
  /** one-line summary, used in the How it works list */
  summary: string;
  /** weighted inputs, shown in the tooltip */
  parts: string[];
  /** the reference point the curve is tuned around */
  note: string;
}

export const STAT_EXPLAINERS: Record<StatKey, StatExplainer> = {
  VIT: {
    summary: "Total contributions & commits",
    parts: [
      "60% — contributions in the last year",
      "40% — commit contributions",
    ],
    note: "Needs a GITHUB_TOKEN; without one both inputs read 0.",
  },
  END: {
    summary: "Streak, active months, account age",
    parts: [
      "45% — longest streak of consecutive active days",
      "35% — months active out of the last 12",
      "20% — account age",
    ],
    note: "Only account age survives without a GITHUB_TOKEN.",
  },
  INT: {
    summary: "Language breadth & repo quality",
    parts: [
      "55% — distinct languages across your owned repos",
      "45% — average stars per owned repo",
    ],
    note: "Rewards breadth and quality, not raw repo count.",
  },
  DEX: {
    summary: "Repo count, creation cadence, commits",
    parts: [
      "50% — public repos (forks included)",
      "30% — repos created per year",
      "20% — commit contributions",
    ],
    note: "Output volume and how steadily you ship it.",
  },
  FAI: {
    summary: "Owned repos, forks received, public PRs",
    parts: [
      "40% — owned repos that aren't forks",
      "30% — forks other people made of your work",
      "30% — pull requests opened in the last year",
    ],
    note: "What you give back to the commons.",
  },
  SOP: {
    summary: "Followers, stars, watchers",
    parts: [
      "50% — followers",
      "40% — total stars across owned repos",
      "10% — total watchers",
    ],
    note: "Reach and reputation.",
  },
};

/** Shared caveat: repo-derived metrics only sample the newest 100 repos. */
export const SAMPLING_NOTE =
  "Repo figures come from your 100 most recently pushed repositories.";
