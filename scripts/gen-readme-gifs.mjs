/**
 * Generates 12 animated GIFs (6 classes × M/F) for the README.
 * Walk-south animation: row 10 (0-indexed), py=640, 64×64, 9 frames.
 * Each GIF is tinted to the class colour via a multiply overlay.
 *
 * Run once:  node scripts/gen-readme-gifs.mjs
 * Output:    public/sprites/readme/<class>_<gender>.gif
 */

import GifEncoder from "gif-encoder-2";
import { mkdirSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, "..");
const OUT_DIR   = path.join(ROOT, "public", "sprites", "readme");
mkdirSync(OUT_DIR, { recursive: true });

const FRAME_SIZE = 64;
const WALK_PY    = 10 * FRAME_SIZE; // row 10, py=640
const FRAMES     = 9;
const FPS        = 9;
const DELAY_MS   = Math.round(1000 / FPS);
const SCALE      = 2;
const OUT_SIZE   = FRAME_SIZE * SCALE; // 128px output

// tint = [r,g,b] matching RANK_TINT_RGB in sprite.ts
const CLASSES = [
  { name: "sorcerer",    stem_m: "sorcerer",       stem_f: "sorcerer",        tint: [ 60, 100, 210] },
  { name: "bladedancer", stem_m: "sword",           stem_f: "sword-character", tint: [220,  55,  20] },
  { name: "saint",       stem_m: "saint",           stem_f: "saint",           tint: [ 80, 110,  80] },
  { name: "juggernaut",  stem_m: "juggernaut",      stem_f: "juggernaut",      tint: [100, 100, 115] },
  { name: "vanguard",    stem_m: "vanguard",        stem_f: "vanguard",        tint: [130,  50, 230] },
  { name: "soulkeeper",  stem_m: "soulkeeper",      stem_f: "soulkeeper",      tint: [200, 165,  30] },
];

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Selective armour tint — same logic as applyArmourTint in sprite.ts.
 * Only shifts low-saturation (grey/metal) pixels; skin tones are left alone.
 */
function applyArmourTint(rgba, tint, satThreshold = 0.22, strength = 0.72) {
  const [tr, tg, tb] = tint;
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] < 10) continue;
    const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    const sat = max === 0 ? 0 : (max - min) / max;
    if (sat >= satThreshold) continue;
    const t = strength * (1 - sat / satThreshold);
    rgba[i]     = Math.round(r + (tr - r) * t);
    rgba[i + 1] = Math.round(g + (tg - g) * t);
    rgba[i + 2] = Math.round(b + (tb - b) * t);
  }
}

async function extractFrame(sheetBuf, frameIdx) {
  return sharp(sheetBuf)
    .extract({ left: frameIdx * FRAME_SIZE, top: WALK_PY, width: FRAME_SIZE, height: FRAME_SIZE })
    .resize(OUT_SIZE, OUT_SIZE, { kernel: "nearest" })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

async function main() {
  for (const cls of CLASSES) {
    for (const gender of ["m", "f"]) {
      const stem   = gender === "m" ? cls.stem_m : cls.stem_f;
      const pfx    = gender === "m" ? "male" : "female";
      const sheet  = path.join(ROOT, "public", "sprites", `${pfx}-${stem}-spritesheet.png`);
      const outGif = path.join(OUT_DIR, `${cls.name}_${gender}.gif`);

      process.stdout.write(`→ ${cls.name} ${gender.toUpperCase()}  `);

      let sheetBuf;
      try { sheetBuf = await readFile(sheet); }
      catch { console.log(`SKIP (not found)`); continue; }

      // Extract + tint all frames
      const frames = [];
      for (let f = 0; f < FRAMES; f++) {
        const buf = await extractFrame(sheetBuf, f);
        applyArmourTint(buf, cls.tint);
        frames.push(buf);
      }

      // Build GIF synchronously via gif-encoder-2's internal output buffer
      const enc = new GifEncoder(OUT_SIZE, OUT_SIZE, "neuquant", true);
      enc.setDelay(DELAY_MS);
      enc.setRepeat(0);
      enc.setQuality(10);
      enc.start();
      for (const frame of frames) enc.addFrame(frame);
      enc.finish();

      const gif = enc.out.getData();
      writeFileSync(outGif, gif);
      console.log(`✓  ${(gif.length / 1024).toFixed(1)} KB`);
    }
  }
  console.log("\nDone →  public/sprites/readme/");
}

main().catch(console.error);
