import type { RawMetrics } from "./types";
import type { IconName } from "../icons";

export interface Skill {
  name: string;
  note: string;
  icon: IconName;
  /** the condition that unlocked it, surfaced in the UI tooltip */
  how: string;
  /**
   * Weight this skill carries in a duel, roughly 1–5. Rarer conditions hit
   * harder. Used by the duel resolver to swing the fight beyond raw power.
   */
  power: number;
  /** how the skill reads mid-fight, e.g. "channels {name}" */
  verb: string;
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
      icon: "flame",
      how: "Granted to every boss that walks these lands.",
      power: 1,
      verb: "fans the last embers",
      unlocked: true,
    },
    {
      name: topLanguage ? `${topLanguage} Adept` : "Runesmith",
      note: topLanguage
        ? `Wields ${topLanguage} as a primary weapon.`
        : "Speaks in forgotten machine tongues.",
      icon: "scroll",
      how: "Unlocked by having a most-used language across your owned repos.",
      power: 2,
      verb: topLanguage
        ? `brings ${topLanguage} to bear`
        : "speaks a forgotten tongue",
      unlocked: topLanguage !== null,
    },
    {
      name: "Polyglot Ascendant",
      note: "Fluent across many programming tongues.",
      icon: "languages",
      how: "Unlocked at 6+ distinct languages across your owned repos.",
      power: 3,
      verb: "switches tongues mid-swing",
      unlocked: metrics.distinctLanguages >= 6,
    },
    {
      name: "Relentless Onslaught",
      note: "A vast arsenal of repositories.",
      icon: "swords",
      how: "Unlocked at 20+ public repos (forks included).",
      power: 3,
      verb: "opens with an unbroken onslaught",
      unlocked: metrics.publicRepos >= 20,
    },
    {
      name: "Undying Vigor",
      note: "Contributes without pause or mercy.",
      icon: "pulse",
      how: "Unlocked at 500+ contributions in the last year.",
      power: 4,
      verb: "refuses to tire",
      unlocked: metrics.totalContributions >= 500,
    },
    {
      name: "Eternal Watch",
      note: "Held a streak through the long night.",
      icon: "moon",
      how: "Unlocked at a 30+ day streak of consecutive active days.",
      power: 3,
      verb: "holds the line through the long night",
      unlocked: metrics.longestStreak >= 30,
    },
    {
      name: "Beacon of the Commons",
      note: "Gives freely to the open-source realm.",
      icon: "candle",
      how: "Unlocked at 15+ owned non-fork repos, or 10+ forks received.",
      power: 3,
      verb: "calls on debts long owed",
      unlocked: metrics.ownedNonForkRepos >= 15 || metrics.totalForks >= 10,
    },
    {
      name: "Starforged",
      note: "Their works have gathered many souls.",
      icon: "star",
      how: "Unlocked at 100+ total stars across your owned repos.",
      power: 4,
      verb: "draws on a hoard of gathered souls",
      unlocked: metrics.totalStars >= 100,
    },
    {
      name: "Gravity of Legend",
      note: "A following orbits their every commit.",
      icon: "orbit",
      how: "Unlocked at 100+ followers.",
      power: 4,
      verb: "bends the arena's gravity",
      unlocked: metrics.followers >= 100,
    },
    {
      name: "Ancient One",
      note: "Has walked these lands for many years.",
      icon: "hourglass",
      how: "Unlocked at 8+ years since the account was created.",
      power: 3,
      verb: "fights with the patience of ages",
      unlocked: metrics.accountAgeYears >= 8,
    },
    {
      name: "Legion Commander",
      note: "Commands a host thousands strong.",
      icon: "crown",
      how: "Unlocked at 1,000+ followers.",
      power: 5,
      verb: "commands a host thousands strong",
      unlocked: metrics.followers >= 1000,
    },
    {
      name: "Ember of Cinder",
      note: "Power that eclipses nearly all who came before.",
      icon: "sun",
      how: "Unlocked at an overall power of 85 or more.",
      power: 5,
      verb: "unleashes the fire of the first flame",
      unlocked: overall >= 85,
    },
  ];

  return candidates
    .filter((c) => c.unlocked)
    .map((c) => ({
      name: c.name,
      note: c.note,
      icon: c.icon,
      how: c.how,
      power: c.power,
      verb: c.verb,
    }));
}
