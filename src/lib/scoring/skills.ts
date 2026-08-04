import type { RawMetrics } from "./types";

export interface Skill {
  name: string;
  note: string;
  icon: string;
  /** the condition that unlocked it, surfaced in the UI tooltip */
  how: string;
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
      how: "Granted to every boss that walks these lands.",
      unlocked: true,
    },
    {
      name: topLanguage ? `${topLanguage} Adept` : "Runesmith",
      note: topLanguage
        ? `Wields ${topLanguage} as a primary weapon.`
        : "Speaks in forgotten machine tongues.",
      icon: "📜",
      how: "Unlocked by having a most-used language across your owned repos.",
      unlocked: topLanguage !== null,
    },
    {
      name: "Polyglot Ascendant",
      note: "Fluent across many programming tongues.",
      icon: "🗣️",
      how: "Unlocked at 6+ distinct languages across your owned repos.",
      unlocked: metrics.distinctLanguages >= 6,
    },
    {
      name: "Relentless Onslaught",
      note: "A vast arsenal of repositories.",
      icon: "⚔️",
      how: "Unlocked at 20+ public repos (forks included).",
      unlocked: metrics.publicRepos >= 20,
    },
    {
      name: "Undying Vigor",
      note: "Contributes without pause or mercy.",
      icon: "💚",
      how: "Unlocked at 500+ contributions in the last year.",
      unlocked: metrics.totalContributions >= 500,
    },
    {
      name: "Eternal Watch",
      note: "Held a streak through the long night.",
      icon: "🌙",
      how: "Unlocked at a 30+ day streak of consecutive active days.",
      unlocked: metrics.longestStreak >= 30,
    },
    {
      name: "Beacon of the Commons",
      note: "Gives freely to the open-source realm.",
      icon: "🕯️",
      how: "Unlocked at 15+ owned non-fork repos, or 10+ forks received.",
      unlocked: metrics.ownedNonForkRepos >= 15 || metrics.totalForks >= 10,
    },
    {
      name: "Starforged",
      note: "Their works have gathered many souls.",
      icon: "⭐",
      how: "Unlocked at 100+ total stars across your owned repos.",
      unlocked: metrics.totalStars >= 100,
    },
    {
      name: "Gravity of Legend",
      note: "A following orbits their every commit.",
      icon: "🪐",
      how: "Unlocked at 100+ followers.",
      unlocked: metrics.followers >= 100,
    },
    {
      name: "Ancient One",
      note: "Has walked these lands for many years.",
      icon: "⏳",
      how: "Unlocked at 8+ years since the account was created.",
      unlocked: metrics.accountAgeYears >= 8,
    },
    {
      name: "Legion Commander",
      note: "Commands a host thousands strong.",
      icon: "👑",
      how: "Unlocked at 1,000+ followers.",
      unlocked: metrics.followers >= 1000,
    },
    {
      name: "Ember of Cinder",
      note: "Power that eclipses nearly all who came before.",
      icon: "☀️",
      how: "Unlocked at an overall power of 85 or more.",
      unlocked: overall >= 85,
    },
  ];

  return candidates
    .filter((c) => c.unlocked)
    .map((c) => ({ name: c.name, note: c.note, icon: c.icon, how: c.how }));
}
