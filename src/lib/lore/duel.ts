import type { ClassName, RankName } from "../scoring/types";
import type { Skill } from "../scoring/skills";

export interface DuelSide {
  login: string;
  name: string | null;
  className: ClassName;
  rankName: RankName;
  overall: number;
  skills: Skill[];
}

export interface DuelResult {
  /** the side with the higher battle score; null on an exact tie */
  winner: DuelSide | null;
  loser: DuelSide | null;
  /** difference in battle score */
  margin: number;
  /**
   * Health the victor walks away with, 1–100: the share of their own battle
   * score the loser could not answer. 0 when both fall.
   */
  winnerHp: number;
  /** battle scores, keyed by login — stat power plus skill weight */
  scores: Record<string, number>;
  lore: string;
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

/** Small seeded PRNG (mulberry32) for repeatable variety per matchup. */
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
 * Total weight a boss's skills bring to a fight. Deliberately a sum, not an
 * average: unlocking more skills should help, and the per-skill weights are
 * small enough that a deep roster tilts a close fight without overturning a
 * large gap in raw stats.
 */
export function skillPower(skills: Skill[]): number {
  return skills.reduce((sum, s) => sum + s.power, 0);
}

/** Stat power plus skill weight — what actually decides the duel. */
export function battleScore(side: DuelSide): number {
  return side.overall + skillPower(side.skills);
}

/** Broad tiers used to pick prose that matches a fighter's standing. */
const RANK_TIER: Record<RankName, "low" | "mid" | "high"> = {
  Hollow: "low",
  Undead: "low",
  Knight: "mid",
  "Abyss Walker": "mid",
  Lord: "high",
  "Soul of Cinder": "high",
};

const OPENINGS = [
  "The fog gate sealed behind them.",
  "Two summons, one arena, no estus between them.",
  "The bells rang once, for both of them.",
  "They met where the ash lies deepest.",
  "No covenant, no mercy, no witnesses but the dead.",
  "The arena had been waiting for this pairing.",
  "The braziers guttered as the second summon landed.",
  "Somewhere below, a bell-keeper marked the hour and looked away.",
  "The ground here remembers every duel it has swallowed.",
  "They arrived from opposite ends of the same long night.",
] as const;

/** Openings that acknowledge a lopsided pairing before a blow is struck. */
const OPENINGS_MISMATCH = [
  "It was over before the fog gate finished closing.",
  "One of them had no business being summoned here.",
  "The arena had seen this shape of fight before, and knew how it ended.",
  "There are duels, and there are executions dressed as duels.",
] as const;

/** Openings for a fight between two titans. */
const OPENINGS_TITANS = [
  "Two of the realm's heaviest names, and only one exit.",
  "The arena had waited an age for a pairing this cruel.",
  "Every hollow within a league turned to watch this one.",
] as const;

const CLASH = [
  "{W}, a {WC} of {WR} standing, against {L}, a {LC} of {LR} standing.",
  "A {WC} answering a {LC} — {WR} against {LR}.",
  "{WC} versus {LC}: the old argument, put to the blade once more.",
  "{WR} met {LR}, and neither offered a covenant.",
  "{W} the {WR} took the measure of {L} the {LR}, and did not like the arithmetic.",
] as const;

/** Openings of the exchange, keyed by how the two classes tend to fight. */
const EXCHANGES = [
  "The first exchange cost them both blood.",
  "They circled once, then stopped pretending to be careful.",
  "Neither gave ground in the opening minute.",
  "The first parry rang loud enough to wake the crypt.",
  "Steel found steel four times before either drew breath.",
  "The opening was patient, and then it was not.",
  "They traded the first wounds like currency neither valued.",
] as const;

/** How the killing blow lands, by how lopsided the fight was. */
const FINISHERS = {
  // margin >= 20 — a rout
  crushing: [
    "{W} did not slow down. {L} was unmade before the second phase began.",
    "{W} ended {L} with a single, contemptuous stroke.",
    "It was not a duel. {W} simply walked through {L} and kept going.",
    "{L} fell to {W} without ever landing a blow worth remembering.",
    "{W} killed {L} the way one closes a door — without looking back.",
    "{L} was still raising a guard when {W} finished it.",
  ],
  // margin >= 8 — decisive but earned
  clear: [
    "{W} broke {L}'s guard, and then broke {L}.",
    "{L} fought well. {W} fought better, and {L} did not rise.",
    "{W} outlasted {L} and delivered the last blow without ceremony.",
    "{L} was driven back to the fog gate, and {W} closed it.",
    "{W} found the opening on the fourth attempt and buried {L} in it.",
    "{L} gave ground, then gave more, then gave everything.",
  ],
  // margin >= 1 — razor thin
  narrow: [
    "Both blades found their mark. Only {W} was still standing when the ash settled.",
    "{W} won by a hair's breadth, and will feel {L}'s last strike for years.",
    "It came down to one final exchange. {W} survived it. {L} did not.",
    "{W} stood over {L}, bleeding almost as badly as the fallen.",
    "A single misstep decided it. {L} made it, and {W} did not.",
    "They killed each other; {W} simply took longer about dying, and stopped.",
  ],
  // margin === 0 — no winner
  tie: [
    "They ran each other through at the same instant. Neither rose.",
    "Two equals, two mortal wounds. The bonfire claimed them both.",
    "Blade met blade until both were spent. Nothing was decided.",
    "Perfectly matched, perfectly ruined. The arena keeps them both.",
    "Every blow answered. Every wound mirrored. Both fell where they stood.",
  ],
} as const;

/** Closing beat, chosen by how much health the victor kept. */
const AFTERMATH = {
  untouched: [
    "{W} walked out barely marked.",
    "{W} left the arena without troubling to wipe the blade.",
    "{W} was already leaving as {L} finished falling.",
  ],
  bloodied: [
    "{W} left bloodied, but upright.",
    "{W} limped out, and that was enough.",
    "{W} kept the win and little else.",
  ],
  pyrrhic: [
    "{W} survived by a margin too thin to celebrate.",
    "{W} won, and will spend a long while regretting how.",
    "{W} lived. Calling it a victory is generous.",
  ],
} as const;

function displayName(side: DuelSide): string {
  return side.name?.trim() || side.login;
}

/** The heaviest skills a side brings, strongest first. */
function topSkills(side: DuelSide, count: number): Skill[] {
  return [...side.skills].sort((a, b) => b.power - a.power).slice(0, count);
}

/**
 * Narrate the skills each side leans on. Written as one sentence per combatant
 * so the tale explains *why* the numbers came out as they did. The victor gets
 * an extra beat when their roster is genuinely deeper, since that is often what
 * decided the fight.
 */
function skillBeats(rng: () => number, w: DuelSide, l: DuelSide): string[] {
  const beats: string[] = [];
  const wPower = skillPower(w.skills);
  const lPower = skillPower(l.skills);

  const wSkills = topSkills(w, wPower > lPower + 4 ? 3 : 2);
  const lSkills = topSkills(l, 2);

  if (wSkills.length > 0) {
    const lead = pick(rng, ["opens with", "begins by", "leads with"]);
    const verbs = wSkills.map((s) => s.verb);
    const list =
      verbs.length > 2
        ? `${verbs[0]}, then ${verbs[1]}, then ${verbs[2]}`
        : verbs.length > 1
          ? `${verbs[0]}, then ${verbs[1]}`
          : verbs[0];
    beats.push(`${displayName(w)} ${lead} — ${list}.`);
  }

  if (lSkills.length > 0) {
    const answer = pick(rng, [
      "answers as",
      "counters, and",
      "will not be outdone —",
      "replies in kind:",
    ]);
    const verbs = lSkills.map((s) => s.verb);
    const list = verbs.length > 1 ? `${verbs[0]} and ${verbs[1]}` : verbs[0];
    beats.push(`${displayName(l)} ${answer} ${list}.`);
  }

  // Name the deciding advantage outright when the rosters are far apart.
  if (wPower > lPower + 6) {
    beats.push(
      pick(rng, [
        `{L} had no answer for that depth.`,
        `Every trick {L} knew, {W} had already outgrown.`,
        `{L}'s arsenal simply ran out first.`,
      ]),
    );
  } else if (lPower > wPower) {
    beats.push(
      pick(rng, [
        `{L} held the deeper arsenal, and it still was not enough.`,
        `{L} fought with more tricks and fewer of them landing.`,
      ]),
    );
  }

  return beats;
}

/**
 * Resolve a duel and narrate it.
 *
 * The winner is decided by battle score — overall stat power plus the summed
 * weight of unlocked skills — so a boss with a deeper roster can take a fight
 * they would lose on raw stats alone. Equal scores are a mutual kill.
 *
 * Deterministic by design, NOT random per view: a shared duel link has to show
 * the same fight to whoever opens it. Variety comes from the seed, which folds
 * in both ranks, classes, skill rosters and scores — so different pairings tell
 * different tales, and a given pairing's tale changes as either profile grows.
 */
export function resolveDuel(a: DuelSide, b: DuelSide): DuelResult {
  const scoreA = battleScore(a);
  const scoreB = battleScore(b);

  const margin = Math.abs(scoreA - scoreB);
  const tie = scoreA === scoreB;

  const winner = tie ? null : scoreA > scoreB ? a : b;
  const loser = tie ? null : scoreA > scoreB ? b : a;

  const rng = mulberry32(hashString(seedKey(a, b)));

  const bucket = tie
    ? FINISHERS.tie
    : margin >= 20
      ? FINISHERS.crushing
      : margin >= 8
        ? FINISHERS.clear
        : FINISHERS.narrow;

  // On a tie there is no winner, so narrate the two sides in argument order.
  const w = winner ?? a;
  const l = loser ?? b;
  const hp = healthLeft(winner, loser, scoreA, scoreB);

  const fill = (s: string) =>
    s
      .replaceAll("{W}", displayName(w))
      .replaceAll("{L}", displayName(l))
      .replaceAll("{WC}", w.className)
      .replaceAll("{LC}", l.className)
      .replaceAll("{WR}", w.rankName)
      .replaceAll("{LR}", l.rankName);

  // Both titans, or a total mismatch, earns a tailored opening.
  const bothHigh =
    RANK_TIER[a.rankName] === "high" && RANK_TIER[b.rankName] === "high";
  const opening =
    margin >= 30
      ? pick(rng, OPENINGS_MISMATCH)
      : bothHigh
        ? pick(rng, OPENINGS_TITANS)
        : pick(rng, OPENINGS);

  const parts = [
    opening,
    fill(pick(rng, CLASH)),
    pick(rng, EXCHANGES),
    ...skillBeats(rng, w, l).map(fill),
    fill(pick(rng, bucket)),
  ];

  // Only a survivor gets an aftermath line.
  if (winner) {
    const closing =
      hp >= 60
        ? AFTERMATH.untouched
        : hp >= 25
          ? AFTERMATH.bloodied
          : AFTERMATH.pyrrhic;
    parts.push(fill(pick(rng, closing)));
  }

  return {
    winner,
    loser,
    margin,
    winnerHp: hp,
    scores: { [a.login]: scoreA, [b.login]: scoreB },
    lore: parts.join(" "),
  };
}

/**
 * Order-independent seed material: /a/vs/b and /b/vs/a must tell the identical
 * story. Each side contributes its rank, class, score and skill roster, so the
 * prose shifts when a profile actually changes rather than being frozen to the
 * usernames forever.
 */
function seedKey(a: DuelSide, b: DuelSide): string {
  const describe = (s: DuelSide) =>
    [
      s.login.toLowerCase(),
      s.rankName,
      s.className,
      battleScore(s),
      s.skills
        .map((k) => k.name)
        .sort()
        .join("+"),
    ].join(":");
  return [describe(a), describe(b)].sort().join("|");
}

/**
 * Remaining health for the victor as a percentage. The loser's battle score is
 * read as damage dealt, so the closer the two were, the less the winner has
 * left. Floored at 1 so a survivor never reads as dead, 0 when nobody survived.
 */
function healthLeft(
  winner: DuelSide | null,
  loser: DuelSide | null,
  scoreA: number,
  scoreB: number,
): number {
  if (!winner || !loser) return 0;
  const winnerScore = Math.max(scoreA, scoreB);
  const loserScore = Math.min(scoreA, scoreB);
  // Guard against a 0-score winner, which would divide by zero.
  if (winnerScore <= 0) return 1;
  const survived = 1 - loserScore / winnerScore;
  return Math.max(1, Math.min(100, Math.round(survived * 100)));
}
