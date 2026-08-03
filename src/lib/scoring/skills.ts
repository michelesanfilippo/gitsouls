import type { RawMetrics } from "./types";

export interface Skill {
  name: string;
  note: string;
  icon: string;
}

interface Candidate extends Skill {
  unlocked: boolean;
}

/**
 * Derive a set of themed "skills" from a profile. Stronger profiles satisfy
 * more conditions and therefore unlock more skills. Pure and deterministic.
 */
export function generateSkills(
  metrics: RawMetrics,
  overall: number,
  topLanguage: string | null,
): Skill[] {
  const candidates: Candidate[] = [
    {
      name: "Kindling Spark",
      note: "Has lit at least one bonfire in the dark.",
      icon: "🔥",
      unlocked: true,
    },
    {
      name: topLanguage ? `${topLanguage} Adept` : "Runesmith",
      note: topLanguage
        ? `Wields ${topLanguage} as a primary weapon.`
        : "Speaks in forgotten machine tongues.",
      icon: "📜",
      unlocked: topLanguage !== null,
    },
    {
      name: "Polyglot Ascendant",
      note: "Fluent across many programming tongues.",
      icon: "🗣️",
      unlocked: metrics.distinctLanguages >= 6,
    },
    {
      name: "Relentless Onslaught",
      note: "A vast arsenal of repositories.",
      icon: "⚔️",
      unlocked: metrics.publicRepos >= 20,
    },
    {
      name: "Undying Vigor",
      note: "Contributes without pause or mercy.",
      icon: "💚",
      unlocked: metrics.totalContributions >= 500,
    },
    {
      name: "Eternal Watch",
      note: "Held a streak through the long night.",
      icon: "🌙",
      unlocked: metrics.longestStreak >= 30,
    },
    {
      name: "Beacon of the Commons",
      note: "Gives freely to the open-source realm.",
      icon: "🕯️",
      unlocked: metrics.ownedNonForkRepos >= 15 || metrics.totalForks >= 10,
    },
    {
      name: "Starforged",
      note: "Their works have gathered many souls.",
      icon: "⭐",
      unlocked: metrics.totalStars >= 100,
    },
    {
      name: "Gravity of Legend",
      note: "A following orbits their every commit.",
      icon: "🪐",
      unlocked: metrics.followers >= 100,
    },
    {
      name: "Ancient One",
      note: "Has walked these lands for many years.",
      icon: "⏳",
      unlocked: metrics.accountAgeYears >= 8,
    },
    {
      name: "Legion Commander",
      note: "Commands a host thousands strong.",
      icon: "👑",
      unlocked: metrics.followers >= 1000,
    },
    {
      name: "Ember of Cinder",
      note: "Power that eclipses nearly all who came before.",
      icon: "☀️",
      unlocked: overall >= 85,
    },
  ];

  return candidates
    .filter((c) => c.unlocked)
    .map((c) => ({ name: c.name, note: c.note, icon: c.icon }));
}
