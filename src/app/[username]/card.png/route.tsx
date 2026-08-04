import { ImageResponse } from "next/og";
import { getBossProfile } from "@/lib/profile";
import { GitHubError } from "@/lib/github/client";
import { STAT_KEYS, STAT_LABELS } from "@/lib/scoring/types";
import { deviconUrl } from "@/lib/devicon";

export const runtime = "nodejs";

/**
 * Cinzel, the display face used across the site. Fetched from Google Fonts at
 * render time: satori needs the raw font bytes, and without them everything
 * falls back to the single bundled sans (which also has no bold, so weights
 * silently flatten).
 */
async function loadCinzel(weight: 400 | 700): Promise<ArrayBuffer | null> {
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

    const res = await fetch(url, {
      next: { revalidate: 60 * 60 * 24 * 30 },
    });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** Devicon SVG as a data URI — satori can't fetch remote SVGs reliably. */
async function fetchLanguageIcon(language: string): Promise<string | null> {
  const url = deviconUrl(language);
  if (!url) return null;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 60 * 60 * 24 * 30 },
    });
    if (!res.ok) return null;
    const svg = await res.text();
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Fetch the avatar up-front as a data URI. Satori would otherwise fetch it
 * lazily while the response stream is already open with a 200 status, so a
 * failure there yields a truncated PNG rather than an error — the classic
 * "downloaded file is broken" symptom. Returns null so we can fall back.
 */
async function fetchAvatar(url: string): Promise<string | null> {
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

/** Downloadable 1080×1920 story-style boss card rendered with next/og. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  let profile: Awaited<ReturnType<typeof getBossProfile>>;
  try {
    profile = await getBossProfile(username);
  } catch (err) {
    // Distinguish the two failures rather than calling everything a 404.
    if (err instanceof GitHubError && err.kind === "rate_limited") {
      return new Response("Rate limited — try again shortly", { status: 429 });
    }
    return new Response("Boss not found", { status: 404 });
  }

  const { rank, bossClass } = profile;

  const [avatar, langIcon, cinzel, cinzelBold] = await Promise.all([
    fetchAvatar(profile.avatarUrl),
    profile.topLanguage
      ? fetchLanguageIcon(profile.topLanguage)
      : Promise.resolve(null),
    loadCinzel(400),
    loadCinzel(700),
  ]);

  const fonts = [
    ...(cinzel
      ? [{ name: "Cinzel", data: cinzel, weight: 400 as const, style: "normal" as const }]
      : []),
    ...(cinzelBold
      ? [{ name: "Cinzel", data: cinzelBold, weight: 700 as const, style: "normal" as const }]
      : []),
  ];
  // Only claim the family when we actually loaded it, else satori errors out.
  const fontFamily = fonts.length > 0 ? "Cinzel" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          // Separate properties: satori's multi-layer `background` shorthand
          // parsing is its least reliable path.
          backgroundColor: "#0b0710",
          backgroundImage:
            // Last two layers are the drifting fog banks.
            "radial-gradient(1000px 900px at 50% 0%, rgba(220,38,38,0.20), transparent 65%), radial-gradient(900px 800px at 50% 100%, rgba(212,175,55,0.12), transparent 65%), radial-gradient(1100px 520px at 22% 74%, rgba(178,178,205,0.16), transparent 68%), radial-gradient(950px 460px at 82% 34%, rgba(158,158,190,0.12), transparent 66%)",
          color: "#e8e0cf",
          fontFamily,
          padding: "110px 80px",
        }}
      >
        {/* Rank — coloured and glowing like the profile heading */}
        <div
          style={{
            display: "flex",
            fontSize: "40px",
            letterSpacing: "16px",
            textTransform: "uppercase",
            color: rank.color,
            textShadow: `0 0 26px ${rank.glow}, 0 2px 4px rgba(0,0,0,0.85)`,
          }}
        >
          {rank.name}
        </div>

        {/* Avatar. The radius goes on the <img> itself, not just the wrapper:
            satori does not clip children to a rounded parent, which is why a
            square photo used to sit inside a circular border. */}
        <div
          style={{
            display: "flex",
            position: "relative",
            marginTop: "56px",
            borderRadius: "9999px",
            border: `10px solid ${rank.color}`,
            boxShadow: `0 0 90px ${rank.glow}`,
          }}
        >
          {avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatar}
              alt=""
              width={400}
              height={400}
              style={{
                width: "400px",
                height: "400px",
                objectFit: "cover",
                borderRadius: "9999px",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: "400px",
                height: "400px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9999px",
                backgroundColor: "#1a102a",
                fontSize: "160px",
                color: rank.color,
              }}
            >
              {(profile.name ?? profile.login).slice(0, 1).toUpperCase()}
            </div>
          )}

          {/* Fog over the portrait, echoing the profile page */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              left: 0,
              width: "400px",
              height: "400px",
              borderRadius: "9999px",
              backgroundImage:
                "radial-gradient(circle at 30% 72%, rgba(205,205,225,0.34), transparent 56%), radial-gradient(circle at 72% 38%, rgba(180,180,205,0.24), transparent 52%)",
            }}
          />
          {/* Shadow pooling at the base of the portrait */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              left: 0,
              width: "400px",
              height: "400px",
              borderRadius: "9999px",
              backgroundImage:
                "linear-gradient(to top, rgba(0,0,0,0.62), transparent 46%)",
            }}
          />
        </div>

        {/* Level */}
        <div
          style={{
            display: "flex",
            marginTop: "-34px",
            borderRadius: "9999px",
            border: `4px solid ${rank.color}`,
            backgroundColor: "#0b0710",
            padding: "8px 30px",
            fontSize: "34px",
            color: rank.color,
          }}
        >
          LV {profile.level}
        </div>

        {/* Name */}
        <div
          style={{
            display: "flex",
            marginTop: "44px",
            fontSize: "84px",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          {profile.name ?? profile.login}
        </div>
        <div style={{ display: "flex", fontSize: "38px", color: "#8a8172" }}>
          @{profile.login}
        </div>

        {/* Class chip, mirroring the profile page: tinted fill, matching border
            and an outer glow. The top language sits beside it as its icon. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginTop: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              borderRadius: "22px",
              border: `4px solid ${bossClass.color}`,
              backgroundColor: `${bossClass.color}26`,
              boxShadow: `0 0 32px ${bossClass.color}4d`,
              padding: "12px 32px",
              fontSize: "36px",
              fontWeight: 700,
              letterSpacing: "6px",
              textTransform: "uppercase",
              color: bossClass.color,
            }}
          >
            {bossClass.name}
          </div>

          {langIcon ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={langIcon}
              alt=""
              width={68}
              height={68}
              style={{ width: "68px", height: "68px" }}
            />
          ) : (
            profile.topLanguage && (
              // No icon for this language — fall back to its initials.
              <div
                style={{
                  display: "flex",
                  width: "68px",
                  height: "68px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "9999px",
                  border: `3px solid ${rank.color}`,
                  fontSize: "26px",
                  fontWeight: 700,
                  color: rank.color,
                }}
              >
                {profile.topLanguage.slice(0, 2).toUpperCase()}
              </div>
            )
          )}
        </div>

        {/* Stats, one per row */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            marginTop: "80px",
            gap: "30px",
          }}
        >
          {STAT_KEYS.map((k) => (
            <div
              key={k}
              style={{ display: "flex", flexDirection: "column", width: "100%" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  width: "100%",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "18px" }}
                >
                  <span
                    style={{
                      fontSize: "38px",
                      letterSpacing: "5px",
                      color: "#dc2626",
                    }}
                  >
                    {k}
                  </span>
                  <span style={{ fontSize: "28px", color: "#8a8172" }}>
                    {STAT_LABELS[k].toUpperCase()}
                  </span>
                </div>
                <span style={{ fontSize: "46px", fontWeight: 700 }}>
                  {profile.stats[k]}
                </span>
              </div>
              {/* Bar */}
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "14px",
                  marginTop: "12px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(0,0,0,0.45)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: `${profile.stats[k]}%`,
                    height: "14px",
                    borderRadius: "9999px",
                    backgroundColor: "#d4af37",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            fontSize: "30px",
            color: "#8a8172",
          }}
        >
          gitsouls.com/{profile.login}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      ...(fonts.length > 0 ? { fonts } : {}),
      headers: {
        // Force a save dialog: the <a download> attribute alone is ignored by
        // iOS Safari and in-app webviews, which just display the image instead.
        "Content-Disposition": `attachment; filename="${profile.login}-gitsouls.png"`,
      },
    },
  );
}
