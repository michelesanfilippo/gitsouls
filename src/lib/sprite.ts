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
 * The automatic sequence played on loop:
 *   sitting → stand up → walk → attack × 2 → walk → sit down → …
 *
 * Row groups confirmed from spritesheet inspection:
 *   8  = walk         (9 frames)
 *   12 = slash        (6 frames, sword trail)
 *   32 = sit-down     (3 frames)
 *   36 = sit-idle     (3 frames)
 *
 * All other groups visible in the sheet (spellcast/thrust/shoot/hurt) are
 * available for future use but are not in the default sequence.
 */
export const STORY_SEQUENCE: AnimPhase[] = [
  { rowGroup: 36, frameCount: 3, fps: 2,  repeats: 3 },                    // sit idle (hold)
  { rowGroup: 32, frameCount: 3, fps: 8,  repeats: 1, backward: true },    // stand up (sit reversed)
  { rowGroup:  8, frameCount: 9, fps: 9,  repeats: 2 },                    // walk
  { rowGroup: 12, frameCount: 6, fps: 9,  repeats: 2 },                    // slash attack ×2
  { rowGroup:  8, frameCount: 9, fps: 9,  repeats: 2 },                    // walk back
  { rowGroup: 32, frameCount: 3, fps: 8,  repeats: 1 },                    // sit down
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
