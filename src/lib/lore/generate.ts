import type { ClassName, RankName } from "../scoring/types";

export interface LoreInput {
  login: string;
  name: string | null;
  className: ClassName;
  rankName: RankName;
  topLanguage: string | null;
  topRepoName: string | null;
  years: number;
  overall: number;
  totalStars: number;
}

/** Deterministic 32-bit string hash (FNV-1a). */
function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Small seeded PRNG (mulberry32) for repeatable variety per profile. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

const OPENINGS = [
  "In an age swallowed by unmerged branches,",
  "Long after the last CI pipeline went dark,",
  "Beyond the ashen forks of forgotten repos,",
  "When the commit-fires had all but guttered,",
  "In the hollow silence between two releases,",
] as const;

const CLASS_EPITHETS: Record<ClassName, readonly string[]> = {
  Sorcerer: ["weaver of a dozen tongues", "cold arcanist of the stack"],
  "Blade Dancer": ["blur of relentless commits", "duelist of the pull request"],
  Saint: ["giver of freely-licensed grace", "shepherd of the open commons"],
  Juggernaut: ["tide of ceaseless output", "engine that would not stall"],
  Vanguard: ["keeper of the unbroken streak", "watcher through every long night"],
  Soulkeeper: ["hoarder of a thousand stars", "sovereign of a silent following"],
};

const CLOSINGS = [
  "Approach the arena, and mind your estus.",
  "Few challengers rise from that fight unhollowed.",
  "The fog gate has already closed behind you.",
  "Draw your blade — the boss music has begun.",
  "Only cinders remember those who tried before.",
] as const;

/**
 * Compose a short Souls-like lore paragraph for a profile. Deterministic:
 * the same input always yields the same text, seeded by the username.
 */
export function generateLore(input: LoreInput): string {
  const rng = mulberry32(hashString(input.login.toLowerCase()));
  const hero = input.name?.trim() || input.login;

  const opening = pick(rng, OPENINGS);
  const epithet = pick(rng, CLASS_EPITHETS[input.className]);
  const closing = pick(rng, CLOSINGS);

  const tongue = input.topLanguage
    ? `forged in the discipline of ${input.topLanguage}`
    : "forged in languages long since lost";

  const relic = input.topRepoName
    ? `Their relic, "${input.topRepoName}," still hums with ${input.totalStars} gathered souls.`
    : `Their works lie scattered, unstarred and unseen.`;

  const era =
    input.years >= 1
      ? `${Math.floor(input.years)} winters`
      : "a single restless season";

  return [
    `${opening} rose ${hero} — the ${input.rankName}, a ${epithet}, ${tongue}.`,
    `For ${era} they toiled, until the realm named them a true ${input.className}.`,
    relic,
    closing,
  ].join(" ");
}
