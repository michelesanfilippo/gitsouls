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
  sy0: number;
  sx0: number;
  frameW: number;
  frameH: number;
  /** destination Y in the 96px canvas, bottom-aligns the character */
  destY: number;
  frameCount: number;
  fps: number;
  repeats: number;
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
/**
 * destY: where to draw the frame in the 96-px canvas so the character's
 * feet are always at the canvas bottom.
 *
 * Measured content_maxY (0-indexed, inclusive):
 *   64px frames (walk/sit): maxY = 62 → destY = 96 - 1 - 62 = 33
 *   96px frames (attack):   maxY = 32 → destY = 96 - 1 - 32 = 63
 */
export const STORY_SEQUENCE: AnimPhase[] = [
  // stand up (sit-down reversed)
  { sy0: 2048, sx0: 0, frameW: 64, frameH: 64, destY: 33, frameCount: 3, fps: 5, repeats: 1, backward: true },
  // walk with weapon x3
  { sy0:  640, sx0: 0, frameW: 64, frameH: 64, destY: 33, frameCount: 9, fps: 6, repeats: 3 },
  // sit down
  { sy0: 2048, sx0: 0, frameW: 64, frameH: 64, destY: 33, frameCount: 3, fps: 5, repeats: 1 },
  // freeze on frame 0 of sit (first/most-upright seated pose) for 3 s
  // 1 frame × fps 0.333 → advance after 3000 ms
  { sy0: 2048, sx0: 0, frameW: 64, frameH: 64, destY: 33, frameCount: 1, fps: 0.333, repeats: 1 },
];

/**
 * Duel idle sequence: row 11 (0-indexed = user's "row 12"), py=704, 64×64, 9 frames.
 * Personaggio che cammina con arma. Content y→destY=33.
 */
export const DUEL_IDLE_SEQUENCE: AnimPhase[] = [
  { sy0: 704, sx0: 0, frameW: 64, frameH: 64, destY: 33, frameCount: 9, fps: 8, repeats: 9999 },
];

/**
 * Death sequence: play row 20 (64px, 6 frames, hurt/die) then freeze on last frame.
 * Content y=13-63 → destY = 96 - 1 - 63 = 32.
 */
export const DUEL_DEATH_SEQUENCE: AnimPhase[] = [
  { sy0: 1280, sx0: 0, frameW: 64, frameH: 64, destY: 32, frameCount: 6, fps: 6, repeats: 1 },
  // Freeze on last frame (sx0 = 5*64 = 320)
  { sy0: 1280, sx0: 320, frameW: 64, frameH: 64, destY: 32, frameCount: 1, fps: 0.001, repeats: 1 },
];

/**
 * Victory sequence: sit-down (same row as profile), then freeze on frame 0.
 */
export const DUEL_VICTORY_SEQUENCE: AnimPhase[] = [
  { sy0: 2048, sx0: 0, frameW: 64, frameH: 64, destY: 33, frameCount: 3, fps: 5, repeats: 1 },
  // Freeze seated
  { sy0: 2048, sx0: 0, frameW: 64, frameH: 64, destY: 33, frameCount: 1, fps: 0.001, repeats: 1 },
];

/**
 * Apply rank tint selectively on metal/armour pixels only.
 *
 * Works on a raw RGBA Uint8ClampedArray (from ctx.getImageData) or a plain
 * Buffer with the same layout. Pixels are tinted only when their saturation
 * is below `satThreshold` (0-1) — grey metals pass, warm skin tones don't.
 *
 * Algorithm per qualifying pixel:
 *   result = lerp(original, tintTarget, strength × (1 - saturation))
 * Pixels with low saturation (metal) get almost full tint; anything with even
 * slight colour (skin, hair, accent) is left mostly alone.
 */
export function applyArmourTint(
  data: Uint8ClampedArray | Buffer,
  tint: [number, number, number],
  satThreshold = 0.22,
  strength = 0.72,
): void {
  const [tr, tg, tb] = tint;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 10) continue; // transparent — skip

    const r = data[i], g = data[i + 1], b = data[i + 2];

    // HSL saturation in [0,1]
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    const sat = max === 0 ? 0 : (max - min) / max;

    if (sat >= satThreshold) continue; // coloured pixel — leave untouched

    // Blend amount: stronger for near-grey, softer as saturation approaches threshold
    const t = strength * (1 - sat / satThreshold);

    data[i]     = Math.round(r + (tr - r) * t);
    data[i + 1] = Math.round(g + (tg - g) * t);
    data[i + 2] = Math.round(b + (tb - b) * t);
  }
}

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
 * Looks for common "she/her" patterns (with or without spaces, with emoji
 * separators, or standalone). Falls back to "male" when absent or unclear.
 *
 * Note: GitHub added a dedicated pronouns field in the UI but does NOT expose
 * it in the public REST API — bio is the only text field available here.
 */
export function detectGender(bio: string | null): "male" | "female" {
  if (!bio) return "male";
  const b = bio.toLowerCase().replace(/[|·•–—]/g, "/");
  // Match "she/her", "she / her", "she|her", "she·her", or just "she/her" anywhere
  if (/\bshe\s*\/\s*her\b/.test(b)) return "female";
  if (/\bshe\/her\b/.test(b)) return "female";
  return "male";
}

// ── Rank colour filters ───────────────────────────────────────────────────────

/**
 * Target RGB for the rank's armour tint.
 * Applied only to low-saturation (metallic/grey) pixels so skin tones,
 * hair and warm-coloured details stay unchanged.
 */
export const RANK_TINT_RGB: Record<RankName, [number, number, number]> = {
  "Hollow":         [100, 100, 115],
  "Undead":         [ 80, 110,  80],
  "Knight":         [ 60, 100, 210],
  "Abyss Walker":   [130,  50, 230],
  "Lord":           [200, 165,  30],
  "Soul of Cinder": [220,  55,  20],
};

/**
 * Kept for compatibility — no longer drives the per-pixel tint,
 * only used for the ambient glow behind the sprite.
 */
export const RANK_FILTER: Record<RankName, string> = {
  "Hollow":         "none",
  "Undead":         "none",
  "Knight":         "none",
  "Abyss Walker":   "none",
  "Lord":           "none",
  "Soul of Cinder": "none",
};

// RANK_OVERLAY kept for back-compat, not used by the new renderer
export const RANK_OVERLAY: Record<RankName, string> = {
  "Hollow":         "rgba(0,0,0,0)",
  "Undead":         "rgba(0,0,0,0)",
  "Knight":         "rgba(0,0,0,0)",
  "Abyss Walker":   "rgba(0,0,0,0)",
  "Lord":           "rgba(0,0,0,0)",
  "Soul of Cinder": "rgba(0,0,0,0)",
};

export const RANK_GLOW_COLOR: Record<RankName, string> = {
  "Hollow":          "rgba(100,100,110,0.35)",
  "Undead":          "rgba(80,100,80,0.40)",
  "Knight":          "rgba(59,130,246,0.40)",
  "Abyss Walker":    "rgba(168,85,247,0.45)",
  "Lord":            "rgba(212,175,55,0.50)",
  "Soul of Cinder":  "rgba(220,38,38,0.55)",
};
