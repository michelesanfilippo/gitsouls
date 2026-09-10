import { readFile } from "node:fs/promises";
import path from "node:path";
import { getBossProfile } from "@/lib/profile";
import { GitHubError } from "@/lib/github/client";
import { loadCinzel, readPublicImage } from "@/lib/og";
import {
  spritesheetPath,
  detectGender,
  applyArmourTint,
  RANK_TINT_RGB,
} from "@/lib/sprite";

export const runtime = "nodejs";

/**
 * Embeddable pixel-ego: the boss panel as a self-contained animated SVG, meant
 * to be dropped into a profile README, a blog post, anywhere an <img> goes.
 *
 * SVG rather than GIF because a README widget has to stay legible at whatever
 * width the host picks, and because the text here is generated per request —
 * rasterising it would cost both sharpness and bytes. Everything is inlined as
 * data URIs: an SVG rendered as an image gets no network, so a remote font or
 * spritesheet reference would simply not load.
 *
 * The walk cycle is one horizontal strip stepped by a CSS animation. That is the
 * only animation technique that survives GitHub's image proxy — SMIL is patchy
 * and JS never runs.
 */

const W = 480;
const H = 180;

/** Walk-south row of the LPC sheet: py 640, nine 64×64 frames. */
const FRAME = 64;
const FRAMES = 9;
const WALK_PY = 640;
const FPS = 8;

/** On-panel sprite size — 2× nearest-neighbour, the scale the site uses. */
const SPRITE = 128;

const CACHE =
  "public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400";

function svgResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": status === 200 ? CACHE : "no-store",
    },
  });
}

/** XML-escape — logins are constrained but display names and bios are not. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Trim a label so it cannot run past the panel's text column. */
function clamp(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

/**
 * The nine walk frames as one rank-tinted PNG strip, base64 data URI.
 * Null on failure so the panel can render without the sprite rather than 500.
 */
async function walkStrip(
  sheetPath: string,
  tint: [number, number, number],
): Promise<string | null> {
  try {
    const sharp = (await import("sharp")).default;
    const file = path.join(process.cwd(), "public", sheetPath.replace(/^\//, ""));
    const width = FRAME * FRAMES;

    const { data } = await sharp(await readFile(file))
      .extract({ left: 0, top: WALK_PY, width, height: FRAME })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    applyArmourTint(data, tint);

    const png = await sharp(data, {
      raw: { width, height: FRAME, channels: 4 },
    })
      .png({ compressionLevel: 9 })
      .toBuffer();

    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Cinzel inlined as an @font-face data URI. The site's display face is the whole
 * point of the panel's look, and an image-rendered SVG cannot fetch it.
 */
function fontFace(ttf: ArrayBuffer | null): string {
  if (!ttf) return "";
  const b64 = Buffer.from(ttf).toString("base64");
  return `@font-face{font-family:'CinzelEmbed';src:url(data:font/ttf;base64,${b64}) format('truetype');}`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  let profile: Awaited<ReturnType<typeof getBossProfile>>;
  try {
    profile = await getBossProfile(username);
  } catch (err) {
    const rateLimited = err instanceof GitHubError && err.kind === "rate_limited";
    return svgResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="40"></svg>`,
      rateLimited ? 429 : 404,
    );
  }

  const { rank, bossClass } = profile;
  const gender = detectGender(profile.bio, profile.name, profile.pronouns);

  const [strip, paper, cinzel] = await Promise.all([
    walkStrip(spritesheetPath(bossClass.name, gender), RANK_TINT_RGB[rank.name]),
    readPublicImage("img/pixel-paper.png"),
    loadCinzel(700),
  ]);

  const rawName = clamp(profile.name ?? profile.login, 22);
  const display = esc(rawName);
  const handle = clamp(esc(`@${profile.login}`), 26);
  // No text metrics available here, so the name steps down a size once it can no
  // longer fit the ~300px column beside the sprite. Cinzel bold runs ~0.68em per
  // glyph, which puts the break at 16 characters.
  const nameSize = rawName.length > 16 ? 20 : 27;
  // Chip width from the same estimate: 0.72em per cap plus the letter-spacing,
  // with 13px of padding either side.
  const chipLabel = bossClass.name.toUpperCase();
  const chipW = Math.round(chipLabel.length * 11.3 + 26);
  const face = cinzel
    ? "'CinzelEmbed', Georgia, serif"
    : "Georgia, 'Times New Roman', serif";

  // Sprite sits bottom-right, clipped by a nested svg: its viewBox is one frame
  // wide, so stepping the strip left by whole frames plays the cycle.
  const spriteX = W - 26 - SPRITE;
  const spriteY = H - 10 - SPRITE;
  const stripW = FRAME * FRAMES;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(
    profile.name ?? profile.login,
  )} — ${esc(rank.name)}, level ${profile.level}">
<style>
${fontFace(cinzel)}
.f{font-family:${face}}
.walk{animation:walk ${(FRAMES / FPS).toFixed(3)}s steps(${FRAMES}) infinite;image-rendering:pixelated}
@keyframes walk{from{transform:translateX(0)}to{transform:translateX(-${stripW}px)}}
@media (prefers-reduced-motion:reduce){.walk{animation:none}}
</style>
<defs>
<clipPath id="panel"><rect width="${W}" height="${H}" rx="16"/></clipPath>
<linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#0b0710" stop-opacity="0.78"/>
<stop offset="0.55" stop-color="#0b0710" stop-opacity="0.28"/>
<stop offset="1" stop-color="#0b0710" stop-opacity="0.1"/>
</linearGradient>
<linearGradient id="leftFade" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#0b0710" stop-opacity="0.86"/>
<stop offset="0.62" stop-color="#0b0710" stop-opacity="0.3"/>
<stop offset="1" stop-color="#0b0710" stop-opacity="0.05"/>
</linearGradient>
<radialGradient id="rankGlow">
<stop offset="0" stop-color="${rank.color}" stop-opacity="0.45"/>
<stop offset="1" stop-color="${rank.color}" stop-opacity="0"/>
</radialGradient>
<filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
<feDropShadow dx="0" dy="0" stdDeviation="3.5" flood-color="${rank.color}" flood-opacity="0.85"/>
</filter>
</defs>

<g clip-path="url(#panel)">
<rect width="${W}" height="${H}" fill="#0d0b14"/>
${
  paper
    ? `<image href="${paper}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMax slice"/>`
    : ""
}
<rect width="${W}" height="${H}" fill="url(#topFade)"/>
<rect width="${W}" height="${H}" fill="url(#leftFade)"/>
<ellipse cx="${spriteX + SPRITE / 2}" cy="${spriteY + SPRITE - 14}" rx="${SPRITE * 0.5}" ry="${SPRITE * 0.42}" fill="url(#rankGlow)"/>
${
  strip
    ? `<svg x="${spriteX}" y="${spriteY}" width="${SPRITE}" height="${SPRITE}" viewBox="0 0 ${FRAME} ${FRAME}">
<image class="walk" href="${strip}" x="0" y="0" width="${stripW}" height="${FRAME}"/>
</svg>`
    : ""
}
<text class="f" x="24" y="32" fill="${rank.color}" font-size="13" font-weight="700" letter-spacing="4.2" filter="url(#glow)">${esc(
    rank.name.toUpperCase(),
  )}</text>
<text class="f" x="${W - 24}" y="32" text-anchor="end" fill="${rank.color}" font-size="15" font-weight="700" letter-spacing="1.6" filter="url(#glow)">LV ${
    profile.level
  }</text>
<text class="f" x="24" y="84" fill="#e8e0cf" font-size="${nameSize}" font-weight="700">${display}</text>
<text class="f" x="24" y="106" fill="#8a8172" font-size="13">${handle}</text>
<rect x="24" y="122" width="${chipW}" height="26" rx="8" fill="${
    bossClass.color
  }" fill-opacity="0.13" stroke="${
    bossClass.color
  }" stroke-opacity="0.75" stroke-width="1.5"/>
<text class="f" x="37" y="140" fill="${
    bossClass.color
  }" font-size="12" font-weight="700" letter-spacing="2.4">${esc(chipLabel)}</text>
<text class="f" x="24" y="170" fill="#8a8172" font-size="10" letter-spacing="1.4">GITSOULS.COM/${esc(
    profile.login.toUpperCase(),
  )}</text>
</g>
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${
    H - 1.5
  }" rx="16" fill="none" stroke="#d4af37" stroke-opacity="0.22"/>
</svg>`;

  return svgResponse(svg);
}
