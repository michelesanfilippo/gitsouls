import type { ClassName, RankName } from "../scoring/types";

export interface DuelSide {
  login: string;
  name: string | null;
  className: ClassName;
  rankName: RankName;
  overall: number;
}

export interface DuelResult {
  /** the side with the higher overall; null on an exact tie */
  winner: DuelSide | null;
  loser: DuelSide | null;
  /** absolute difference in overall power */
  margin: number;
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

/** How the killing blow lands, by how lopsided the fight was. */
const FINISHERS = {
  // margin >= 20 — a rout
  crushing: [
    "{W} did not slow down. {L} was unmade before the second phase began.",
    "{W} ended {L} with a single, contemptuous stroke.",
    "It was not a duel. {W} simply walked through {L} and kept going.",
    "{L} fell to {W} without ever landing a blow worth remembering.",
  ],
  // margin >= 8 — decisive but earned
  clear: [
    "{W} broke {L}'s guard, and then broke {L}.",
    "{L} fought well. {W} fought better, and {L} did not rise.",
    "{W} outlasted {L} and delivered the last blow without ceremony.",
    "{L} was driven back to the fog gate, and {W} closed it.",
  ],
  // margin >= 1 — razor thin
  narrow: [
    "Both blades found their mark. Only {W} was still standing when the ash settled.",
    "{W} won by a hair's breadth, and will feel {L}'s last strike for years.",
    "It came down to one final exchange. {W} survived it. {L} did not.",
    "{W} stood over {L}, bleeding almost as badly as the fallen.",
  ],
  // margin === 0 — no winner
  tie: [
    "They ran each other through at the same instant. Neither rose.",
    "Two equals, two mortal wounds. The bonfire claimed them both.",
    "Blade met blade until both were spent. Nothing was decided.",
    "Perfectly matched, perfectly ruined. The arena keeps them both.",
  ],
} as const;

const OPENINGS = [
  "The fog gate sealed behind them.",
  "Two summons, one arena, no estus between them.",
  "The bells rang once, for both of them.",
  "They met where the ash lies deepest.",
  "No covenant, no mercy, no witnesses but the dead.",
  "The arena had been waiting for this pairing.",
] as const;

const CLASH = [
  "{W}, {WC}, against {L}, {LC}.",
  "A {WC} answering a {LC}.",
  "{WC} versus {LC} — the old argument, settled again.",
] as const;

/** Lower-case display form of a class, for prose. */
function classPhrase(c: ClassName): string {
  return `a ${c}`;
}

function displayName(side: DuelSide): string {
  return side.name?.trim() || side.login;
}

/**
 * Resolve a duel and narrate it. Higher overall power wins; equal power is a
 * mutual kill. Deterministic — the same pairing always yields the same tale,
 * seeded by both logins in a stable order so /a/vs/b and /b/vs/a agree.
 */
export function resolveDuel(a: DuelSide, b: DuelSide): DuelResult {
  const margin = Math.abs(a.overall - b.overall);
  const tie = a.overall === b.overall;

  const winner = tie ? null : a.overall > b.overall ? a : b;
  const loser = tie ? null : a.overall > b.overall ? b : a;

  // Order-independent seed: the same two logins tell the same story either way.
  const seedKey = [a.login.toLowerCase(), b.login.toLowerCase()]
    .sort()
    .join("|");
  const rng = mulberry32(hashString(seedKey));

  const bucket = tie
    ? FINISHERS.tie
    : margin >= 20
      ? FINISHERS.crushing
      : margin >= 8
        ? FINISHERS.clear
        : FINISHERS.narrow;

  const opening = pick(rng, OPENINGS);
  const clashTemplate = pick(rng, CLASH);
  const finisher = pick(rng, bucket);

  // On a tie there is no winner, so narrate the two sides in argument order.
  const w = winner ?? a;
  const l = loser ?? b;

  const fill = (s: string) =>
    s
      .replaceAll("{W}", displayName(w))
      .replaceAll("{L}", displayName(l))
      .replaceAll("{WC}", classPhrase(w.className))
      .replaceAll("{LC}", classPhrase(l.className));

  const lore = [opening, fill(clashTemplate), fill(finisher)].join(" ");

  return { winner, loser, margin, lore };
}
