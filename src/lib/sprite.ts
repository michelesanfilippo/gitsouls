import type { ClassName, RankName } from "./scoring/types";

export const FRAME_SIZE = 64;

/**
 * LPC direction offsets within each 4-row group.
 * Standard order: 0=North(back) 1=West(left) 2=South(front) 3=East(right)
 */
export type Dir = 0 | 1 | 2 | 3;
export const DIR: Record<"S" | "E" | "N" | "W", Dir> = {
  S: 2, // South / front-facing (default)
  E: 3,
  N: 0,
  W: 1,
};
/** Click cycles through these directions in order. */
export const DIR_CYCLE: Dir[] = [2, 3, 0, 1]; // S → E → N → W → S

/**
 * One phase in the auto-play story sequence.
 * rowGroup is the first of the 4 direction rows (+ Dir offset = actual row).
 */
export interface AnimPhase {
  rowGroup: number;
  frameCount: number;
  fps: number;
  /** how many full loops of frameCount before advancing to the next phase */
  repeats: number;
  /** play frames in reverse (e.g. stand-up = sit-down reversed) */
  backward?: boolean;
}

/**
 * The automatic sequence played on loop. Rows are 0-indexed.
 * Confirmed by pixel-scanning the male-sword spritesheet:
 *   row 32 = sit/stand (3 frames)  — user's "row 33"
 *   row 10 = walk with weapon (9 frames) — user's "row 11"
 *   row 60 = sword attack (12 frames)    — user's "row 61"
 *
 * All animations are played front-facing only (no direction cycle).
 * The sprite is NOT clickable.
 */
export const STORY_SEQUENCE: AnimPhase[] = [
  { rowGroup: 32, frameCount: 3, fps: 5,  repeats: 3 },                    // sit idle (hold)
  { rowGroup: 32, frameCount: 3, fps: 7,  repeats: 1, backward: true },    // stand up (reversed)
  { rowGroup: 10, frameCount: 9, fps: 9,  repeats: 2 },                    // walk with weapon
  { rowGroup: 60, frameCount: 12, fps: 9, repeats: 1 },                    // sword attack
  { rowGroup: 10, frameCount: 9, fps: 9,  repeats: 2 },                    // walk back
  { rowGroup: 32, frameCount: 3, fps: 7,  repeats: 1 },                    // sit down
];

// ── Sprite file mapping ──────────────────────────────────────────────────────

const CLASS_STEM: Record<ClassName, { male: string; female: string }> = {
  Sorcerer:       { male: "sorcerer",          female: "sorcerer" },
  Saint:          { male: "saint",              female: "saint" },
  "Blade Dancer": { male: "sword",              female: "sword-character" },
  Vanguard:       { male: "vanguard",           female: "vanguard" },
  Juggernaut:     { male: "juggernaut",         female: "juggernaut" },
  Soulkeeper:     { male: "soulkeeper",         female: "soulkeeper" },
};

export function spritesheetPath(cls: ClassName, gender: "male" | "female"): string {
  const stem = CLASS_STEM[cls][gender];
  return `/sprites/${gender}-${stem}-spritesheet.png`;
}

/**
 * Detect gender from the GitHub bio.
 * "she/her" → female; everything else (including absent bio) → male.
 */
export function detectGender(bio: string | null): "male" | "female" {
  if (!bio) return "male";
  const b = bio.toLowerCase();
  if (b.includes("she/her") || b.includes("she / her")) return "female";
  return "male";
}

// ── Rank colour filters ───────────────────────────────────────────────────────

export const RANK_FILTER: Record<RankName, string> = {
  "Hollow":          "grayscale(1) brightness(0.65)",
  "Undead":          "grayscale(0.6) sepia(0.3) brightness(0.75)",
  "Knight":          "sepia(0.2) saturate(3) hue-rotate(190deg) brightness(0.95)",
  "Abyss Walker":    "sepia(0.3) saturate(4) hue-rotate(255deg) brightness(0.9)",
  "Lord":            "sepia(0.8) saturate(5) brightness(1.1)",
  "Soul of Cinder":  "sepia(1) saturate(8) hue-rotate(330deg) brightness(1.2)",
};

export const RANK_GLOW_COLOR: Record<RankName, string> = {
  "Hollow":          "rgba(100,100,110,0.35)",
  "Undead":          "rgba(80,100,80,0.40)",
  "Knight":          "rgba(59,130,246,0.40)",
  "Abyss Walker":    "rgba(168,85,247,0.45)",
  "Lord":            "rgba(212,175,55,0.50)",
  "Soul of Cinder":  "rgba(220,38,38,0.55)",
};
