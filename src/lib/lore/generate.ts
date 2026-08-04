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

/**
 * Openings keyed by rank, so a Hollow is introduced with pity and a Soul of
 * Cinder with dread. Six per tier.
 */
const OPENINGS_BY_RANK: Record<RankName, readonly string[]> = {
  Hollow: [
    "In an age swallowed by unmerged branches,",
    "Where the last bonfire had long gone cold,",
    "Among the shuffling husks of abandoned drafts,",
    "In a wasteland of empty README files,",
    "Beneath a sky the colour of a dead terminal,",
    "At the bottom of the world, where nothing compiles,",
  ],
  Undead: [
    "Long after the last CI pipeline went dark,",
    "Cursed to rise with every failed build,",
    "In the grey hours between one revert and the next,",
    "Bound to the wheel of commit and rollback,",
    "Where the dead branches whisper their old names,",
    "Risen once more from a graveyard of stale forks,",
  ],
  Knight: [
    "Beyond the ashen forks of forgotten repos,",
    "Sworn at an altar of well-kept documentation,",
    "In the hall where disciplined blades are hung,",
    "Through gates held by those who review with care,",
    "Where the tests are green and the vows older still,",
    "Clad in armour beaten from a thousand small fixes,",
  ],
  "Abyss Walker": [
    "When the commit-fires had all but guttered,",
    "Down where the dependency graph loses its light,",
    "In the deep places no linter dares to follow,",
    "Past the last merge that anyone remembers,",
    "Where the stack trace descends beyond reading,",
    "In the dark beneath the deprecated layers,",
  ],
  Lord: [
    "In the hollow silence between two releases,",
    "From a throne assembled out of shipped features,",
    "When the realm still bent its knee to one maintainer,",
    "Atop a keep whose walls are versioned and signed,",
    "In the age when a single tag moved the world,",
    "Crowned by the consensus of a thousand pull requests,",
  ],
  "Soul of Cinder": [
    "At the end of every changelog ever written,",
    "When all the fires had been gathered into one,",
    "In the last commit before the age of dark,",
    "Where every branch in history finally converges,",
    "Forged from the amalgam of all who shipped before,",
    "As the final build began, and the sky caught flame,",
  ],
};

/** Four epithets per class, so the class shapes the voice, not just a label. */
const CLASS_EPITHETS: Record<ClassName, readonly string[]> = {
  Sorcerer: [
    "weaver of a dozen tongues",
    "cold arcanist of the stack",
    "reader of runes no compiler admits",
    "summoner of abstractions best left sealed",
  ],
  "Blade Dancer": [
    "blur of relentless commits",
    "duelist of the pull request",
    "blade that lands before the diff is read",
    "storm of small, perfect changes",
  ],
  Saint: [
    "giver of freely-licensed grace",
    "shepherd of the open commons",
    "mender of another's broken build",
    "keeper of the door left unlocked",
  ],
  Juggernaut: [
    "tide of ceaseless output",
    "engine that would not stall",
    "weight no backlog could hold",
    "avalanche wearing a maintainer's name",
  ],
  Vanguard: [
    "keeper of the unbroken streak",
    "watcher through every long night",
    "first light on the on-call horizon",
    "wall that stood while the pagers rang",
  ],
  Soulkeeper: [
    "hoarder of a thousand stars",
    "sovereign of a silent following",
    "gravity well of the timeline",
    "name spoken in every other issue",
  ],
};

/** Closings escalate with rank: pity at the bottom, dread at the top. */
const CLOSINGS_BY_RANK: Record<RankName, readonly string[]> = {
  Hollow: [
    "You could likely walk past without drawing your blade.",
    "There is little glory here, and less loot.",
    "Even the bonfire seems embarrassed for them.",
    "Strike once. It will probably be enough.",
  ],
  Undead: [
    "Only cinders remember those who tried before.",
    "They will rise again after you leave. They always do.",
    "A slow fight, and a slower resurrection.",
    "Persistence, at least, is a kind of strength.",
  ],
  Knight: [
    "Approach the arena, and mind your estus.",
    "A fair fight, fought by the old rules.",
    "They will salute you before they cut you down.",
    "Come with your guard up and your commits clean.",
  ],
  "Abyss Walker": [
    "Few challengers rise from that fight unhollowed.",
    "Bring a light. It will not be enough.",
    "The floor gives way somewhere in the second phase.",
    "What answers there does not merge back.",
  ],
  Lord: [
    "The fog gate has already closed behind you.",
    "Kneel, or be catalogued among the attempts.",
    "Their release notes read like a war record.",
    "Draw your blade — the boss music has begun.",
  ],
  "Soul of Cinder": [
    "Every soul you have ever farmed answers to them.",
    "There is no second phase. There is only the fire.",
    "You have already lost this fight once, in another age.",
    "Link the flame, or be forgotten with the rest.",
  ],
};

/**
 * Compose a short Souls-like lore paragraph for a profile. Deterministic: the
 * same input always yields the same text. The seed folds in class and rank
 * alongside the login, so the prose shifts when a boss actually grows in power
 * instead of being frozen to the username forever.
 */
export function generateLore(input: LoreInput): string {
  const rng = mulberry32(
    hashString(
      `${input.login.toLowerCase()}|${input.className}|${input.rankName}`,
    ),
  );
  const hero = input.name?.trim() || input.login;

  const opening = pick(rng, OPENINGS_BY_RANK[input.rankName]);
  const epithet = pick(rng, CLASS_EPITHETS[input.className]);
  const closing = pick(rng, CLOSINGS_BY_RANK[input.rankName]);

  const tongue = input.topLanguage
    ? `forged in the discipline of ${input.topLanguage}`
    : "forged in languages long since lost";

  // A 0-star relic is no relic at all — say so rather than boasting of nothing.
  const relic = !input.topRepoName
    ? "Their works lie scattered, unstarred and unseen."
    : input.totalStars > 0
      ? `Their relic, "${input.topRepoName}," still hums with ${input.totalStars} gathered souls.`
      : `Their relic, "${input.topRepoName}," waits unstarred and unseen.`;

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
