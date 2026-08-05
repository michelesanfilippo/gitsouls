import type { ClassName, RankName } from "./scoring/types";

/**
 * LPC spritesheet layout.
 *
 * Every row group is 4 consecutive rows (one per direction: N W S E).
 * We always render the South-facing direction (row offset +2) for the
 * profile display. Frame size is 64x64 px throughout.
 */
export const FRAME_SIZE = 64;

export type AnimName =
  | "spellcast"   // 7 frames
  | "thrust"      // 8 frames
  | "walk"        // 9 frames
  | "slash"       // 6 frames
  | "shoot"       // 13 frames
  | "hurt"        // 6 frames
  | "idle";       // synthesised — first frame of walk

/**
 * Row groups in the LPC standard sheet (zero-indexed, each group = 4 rows).
 * Confirmed from the spritesheet inspection above.
 */
const ROW_GROUPS: Record<AnimName, number> = {
  spellcast: 0,   // rows 0-3
  thrust:    4,   // rows 4-7  (mapped to what we see, may vary by export)
  walk:      8,   // rows 8-11
  slash:     12,  // rows 12-15
  shoot:     16,  // rows 16-19
  hurt:      20,  // rows 20-23
  idle:      8,   // same group as walk, frame 0 only
};

/**
 * Frame counts per animation (LPC defaults — confirmed for sword sheet).
 */
export const FRAME_COUNT: Record<AnimName, number> = {
  spellcast: 7,
  thrust:    8,
  walk:      9,
  slash:     6,
  shoot:     13,
  hurt:      6,
  idle:      1,
};

/** Frame-per-second for each animation. */
export const ANIM_FPS: Record<AnimName, number> = {
  spellcast: 9,
  thrust:    9,
  walk:      9,
  slash:     9,
  shoot:     9,
  hurt:      6,
  idle:      1,
};

/** South-facing direction is offset +2 within each group. */
const SOUTH_OFFSET = 2;

/** Pixel Y of the first south-facing frame for an animation. */
export function animRowY(anim: AnimName): number {
  return (ROW_GROUPS[anim] + SOUTH_OFFSET) * FRAME_SIZE;
}

// ── Sprite file mapping ──────────────────────────────────────────────────────

/** Map class name to spritesheet filename stem. */
const CLASS_STEM: Record<ClassName, string> = {
  Sorcerer:       "sorcerer",
  Saint:          "saint",
  "Blade Dancer": "sword",         // male-sword-spritesheet.png
  Vanguard:       "vanguard",
  Juggernaut:     "juggernaut",
  Soulkeeper:     "soulkeeper",
};

export function spritesheetPath(cls: ClassName, gender: "male" | "female"): string {
  const stem = CLASS_STEM[cls];
  return `/sprites/${gender}-${stem}-spritesheet.png`;
}

/** Deterministic gender from the GitHub login (same output every time). */
export function loginGender(login: string): "male" | "female" {
  return login.charCodeAt(0) % 2 === 0 ? "male" : "female";
}

// ── Rank colour filters ───────────────────────────────────────────────────────

/**
 * CSS filter chain applied to the entire canvas element.
 * Starts from the silver/grey base sprite from LPC and shifts hue/saturation
 * to match the boss rank colour palette already used on the profile border.
 *
 * All are calibrated so the skin tones stay roughly intact while metal and
 * cloth change significantly. The orange trim visible in the sprite is
 * intentionally kept — it reads as ember/magical energy at higher ranks.
 */
export const RANK_FILTER: Record<RankName, string> = {
  "Hollow":          "grayscale(1) brightness(0.65)",
  "Undead":          "grayscale(0.6) sepia(0.3) brightness(0.75)",
  "Knight":          "sepia(0.2) saturate(3) hue-rotate(190deg) brightness(0.95)",
  "Abyss Walker":    "sepia(0.3) saturate(4) hue-rotate(255deg) brightness(0.9)",
  "Lord":            "sepia(0.8) saturate(5) brightness(1.1)",
  "Soul of Cinder":  "sepia(1) saturate(8) hue-rotate(330deg) brightness(1.2)",
};

/**
 * Glow color behind the sprite, matching the rank palette.
 * Kept as rgba so it can be used in box-shadow / radial-gradient.
 */
export const RANK_GLOW_COLOR: Record<RankName, string> = {
  "Hollow":          "rgba(100,100,110,0.4)",
  "Undead":          "rgba(80,100,80,0.45)",
  "Knight":          "rgba(59,130,246,0.45)",
  "Abyss Walker":    "rgba(168,85,247,0.5)",
  "Lord":            "rgba(212,175,55,0.55)",
  "Soul of Cinder":  "rgba(220,38,38,0.6)",
};

// ── Idle sequence per class ───────────────────────────────────────────────────

/**
 * Which animation plays by default on the profile card.
 * Aggressive classes show a quick slash; casters show spellcast; others walk.
 */
export const DEFAULT_ANIM: Record<ClassName, AnimName> = {
  Sorcerer:       "spellcast",
  Saint:          "spellcast",
  "Blade Dancer": "slash",
  Vanguard:       "thrust",
  Juggernaut:     "slash",
  Soulkeeper:     "slash",
};
