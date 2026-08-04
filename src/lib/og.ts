import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Helpers shared by the image routes (`card.png`, `og.png`).
 *
 * Everything here returns null on failure rather than throwing. That matters:
 * satori renders lazily inside the response stream, after `ImageResponse` has
 * already sent a 200 and an image/png content type, so an error at draw time
 * yields a truncated PNG rather than a clean failure. Fetch assets up front.
 */

/**
 * Cinzel, the display face used across the site. Fetched from Google Fonts
 * because satori needs raw font bytes; without it everything falls back to the
 * single bundled sans, which has no bold, so weights silently flatten.
 */
export async function loadCinzel(
  weight: 400 | 700,
): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Cinzel:wght@${weight}`,
      {
        // A UA string that gets us TTF rather than WOFF2, which satori can't read.
        headers: { "User-Agent": "Mozilla/5.0 (compatible; gitsouls)" },
        next: { revalidate: 60 * 60 * 24 * 30 },
      },
    ).then((r) => (r.ok ? r.text() : null));
    if (!css) return null;

    const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (!url) return null;

    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** Both Cinzel weights plus the family name to declare, or a safe fallback. */
export async function loadFonts() {
  const [regular, bold] = await Promise.all([loadCinzel(400), loadCinzel(700)]);

  const fonts = [
    ...(regular
      ? [
          {
            name: "Cinzel",
            data: regular,
            weight: 400 as const,
            style: "normal" as const,
          },
        ]
      : []),
    ...(bold
      ? [
          {
            name: "Cinzel",
            data: bold,
            weight: 700 as const,
            style: "normal" as const,
          },
        ]
      : []),
  ];

  return {
    fonts,
    // Only claim the family when we actually loaded it, else satori errors out.
    fontFamily: fonts.length > 0 ? "Cinzel" : "sans-serif",
  };
}

/**
 * Fetch a remote image as a data URI so satori never has to fetch it itself.
 * Returns null so callers can fall back to something drawable.
 */
export async function fetchImageDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "image/png";
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Read an image out of `public/` as a data URI. Used for the OctoSouls mascot:
 * satori cannot resolve site-relative URLs, and going back out over HTTP to our
 * own origin would be both slower and dependent on the deployment URL.
 */
export async function readPublicImage(
  relativePath: string,
): Promise<string | null> {
  try {
    const file = path.join(process.cwd(), "public", relativePath);
    const buf = await readFile(file);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
