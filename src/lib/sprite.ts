import type { ClassName, RankName } from "./scoring/types";

/**
 * The sheet has TWO grids:
 *   ZONE A (rows 0-53 in 64px): standard LPC 64×64 frames
 *   ZONE B (from pixel-y 3456 onward): 96×96 frames for attack animations
 *
 * To unify them in the renderer we describe each phase with the pixel
 * coordinates of its top-left frame (sx0, sy0) and its frame dimensions.
 */
export interface AnimPhase {
  /** pixel Y of the first row of this animation */
  sy0: number;
  /** pixel X of the first frame (always 0) */
  sx0: number;
  frameW: number;
  frameH: number;
  frameCount: number;
  fps: number;
  /** how many full loops before advancing */
  repeats: number;
  /** play frames reversed (stand-up = sit-down backward) */
  backward?: boolean;
}

/**
 * Confirmed from pixel-scanning male-sword-spritesheet.png:
 *
 *   64px zone:
 *     row 32 (py 2048): sit-down  — 3 frames, 64×64
 *     row 10 (py  640): walk      — 9 frames, 64×64
 *
 *   96px zone (starts at py 3456):
 *     96px-row 38 (py 3456 + 2×96 = 3648): South-facing slash — 8 frames, 96×96
 *
 * Sequence: sit → stand → walk → attack → walk → sit → loop
 */
export const STORY_SEQUENCE: AnimPhase[] = [
  // sit idle (hold a moment)
  { sy0: 2048, sx0: 0, frameW: 64, frameH: 64, frameCount: 3, fps: 3,  repeats: 2 },
  // stand up (sit reversed)
  { sy0: 2048, sx0: 0, frameW: 64, frameH: 64, frameCount: 3, fps: 5,  repeats: 1, backward: true },
  // walk with weapon (slow)
  { sy0:  640, sx0: 0, frameW: 64, frameH: 64, frameCount: 9, fps: 6,  repeats: 2 },
  // sword attack (96px, South = 96px-row 38 = py 3648)
  { sy0: 3648, sx0: 0, frameW: 96, frameH: 96, frameCount: 8, fps: 7,  repeats: 1 },
  // walk back (slow)
  { sy0:  640, sx0: 0, frameW: 64, frameH: 64, frameCount: 9, fps: 6,  repeats: 2 },
  // sit down
  { sy0: 2048, sx0: 0, frameW: 64, frameH: 64, frameCount: 3, fps: 5,  repeats: 1 },
];

/** Canonical display size for rendering — the canvas clips to this. */
export const DISPLAY_FRAME = 96; // all phases render into a 96×96 canvas

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
