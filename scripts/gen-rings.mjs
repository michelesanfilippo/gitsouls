/**
 * Turns the source rank-ring artwork (opaque JPEGs painted on pure black) into
 * transparent PNGs the app can layer over an avatar.
 *
 * The art is glow-on-black, so alpha comes straight from luminance: pure black
 * is background, anything lit is ring. Colour is left untouched (straight, not
 * premultiplied) — the page sits on #0b0710, so the dark fringe of a
 * semi-transparent pixel composites to the same value it already had.
 *
 * It also measures each ring's inner edge, because the five rings do not share
 * a band thickness: Knight's is thin (hole = 0.70 of the canvas), Undead's is
 * fat (0.56). Rather than rescale the art to a common hole — which crops the
 * outer glow, since every source runs edge to edge — we report the ratio and
 * let the layout size the avatar per rank. Paste the printed values into
 * RANK_RING in src/lib/rank-ring.ts.
 *
 * Run:  node scripts/gen-rings.mjs [--src <dir>]
 * Out:  public/img/rings/<rank>.png
 */

import { mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "img", "rings");

const srcFlag = process.argv.indexOf("--src");
const SRC_DIR =
  srcFlag !== -1 && process.argv[srcFlag + 1]
    ? process.argv[srcFlag + 1]
    : path.join(os.homedir(), "Downloads", "circles");

/** Source stem → rank slug used by the app. Hollow has no ring by design. */
const RINGS = [
  { src: "undead", out: "undead" },
  { src: "knight", out: "knight" },
  { src: "abysswalker", out: "abysswalker" },
  { src: "lord", out: "lord" },
  { src: "cinder", out: "cinder" },
];

/**
 * 512 covers the largest consumer (card.png draws the ring near 560 CSS px on a
 * 1080-wide canvas) without the file size that a full RGBA export costs: these
 * are embedded as data URIs in the OG routes, so every kilobyte is per-request.
 * Palette-quantised, which takes each ring from ~480 KB to ~130 KB — the glows
 * are broad and smooth enough that 256 colours show no banding at display size.
 */
const OUT_SIZE = 512;

/** Below this luminance a pixel is background; above it, fully solid ring. */
const ALPHA_FLOOR = 6;
const ALPHA_CEIL = 32;

/** Luminance at which the inner-edge scan considers it has hit the ring. */
const EDGE_LUMA = 22;

const luma = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

/**
 * Median distance from centre to the first lit pixel, sampled every degree.
 * Median, not min: cardinal ornaments (skulls, medallions) jut far inward and
 * would otherwise drag the avatar down to a fraction of the real hole. Those
 * spikes overlapping the portrait is the intended look.
 */
function measureInnerRatio(data, width, height, channels) {
  const cx = width / 2;
  const cy = height / 2;
  const limit = Math.min(width, height) / 2;
  const hits = [];

  for (let deg = 0; deg < 360; deg++) {
    const ca = Math.cos((deg * Math.PI) / 180);
    const sa = Math.sin((deg * Math.PI) / 180);
    let hit = limit;
    for (let r = 4; r < limit; r++) {
      const x = Math.round(cx + r * ca);
      const y = Math.round(cy + r * sa);
      if (x < 0 || y < 0 || x >= width || y >= height) break;
      const i = (y * width + x) * channels;
      if (luma(data[i], data[i + 1], data[i + 2]) >= EDGE_LUMA) {
        hit = r;
        break;
      }
    }
    hits.push(hit);
  }

  hits.sort((a, b) => a - b);
  return (2 * hits[180]) / width;
}

/** Rebuild the RGB buffer as RGBA with luminance-keyed alpha. */
function keyAlpha(rgb, pixelCount, channels) {
  const rgba = Buffer.allocUnsafe(pixelCount * 4);
  const span = ALPHA_CEIL - ALPHA_FLOOR;
  for (let p = 0; p < pixelCount; p++) {
    const s = p * channels;
    const d = p * 4;
    const r = rgb[s];
    const g = rgb[s + 1];
    const b = rgb[s + 2];
    const l = luma(r, g, b);
    const a =
      l <= ALPHA_FLOOR ? 0 : l >= ALPHA_CEIL ? 255 : Math.round(((l - ALPHA_FLOOR) / span) * 255);
    rgba[d] = r;
    rgba[d + 1] = g;
    rgba[d + 2] = b;
    rgba[d + 3] = a;
  }
  return rgba;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const ratios = [];

  for (const ring of RINGS) {
    const file = path.join(SRC_DIR, `${ring.src}.jpg`);
    process.stdout.write(`→ ${ring.out.padEnd(12)}`);

    let buf;
    try {
      buf = await readFile(file);
    } catch {
      console.log("SKIP (not found)");
      continue;
    }

    // Measure on the full-resolution source: the inner edge is a thin glowing
    // line, and downscaling first would blur it across several pixels.
    const full = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
    const innerRatio = measureInnerRatio(
      full.data,
      full.info.width,
      full.info.height,
      full.info.channels,
    );

    const scaled = await sharp(buf)
      .resize(OUT_SIZE, OUT_SIZE, { fit: "cover" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const rgba = keyAlpha(scaled.data, OUT_SIZE * OUT_SIZE, scaled.info.channels);
    const png = await sharp(rgba, {
      raw: { width: OUT_SIZE, height: OUT_SIZE, channels: 4 },
    })
      .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
      .toBuffer();

    const out = path.join(OUT_DIR, `${ring.out}.png`);
    await writeFile(out, png);
    ratios.push([ring.out, innerRatio]);
    console.log(`✓  ${(png.length / 1024).toFixed(0)} KB   innerRatio ${innerRatio.toFixed(3)}`);
  }

  if (ratios.length) {
    console.log("\nPaste into RANK_RING (src/lib/rank-ring.ts):");
    for (const [name, r] of ratios) console.log(`  ${name}: innerRatio ${r.toFixed(3)}`);
  }
  console.log(`\nDone →  ${path.relative(ROOT, OUT_DIR)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
