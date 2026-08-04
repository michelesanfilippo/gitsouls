import { ImageResponse } from "next/og";
import { getBossProfile } from "@/lib/profile";
import { GitHubError } from "@/lib/github/client";
import { STAT_KEYS, STAT_LABELS } from "@/lib/scoring/types";

export const runtime = "nodejs";

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
  const avatar = await fetchAvatar(profile.avatarUrl);

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
            "radial-gradient(1000px 900px at 50% 0%, rgba(220,38,38,0.20), transparent 65%), radial-gradient(900px 800px at 50% 100%, rgba(212,175,55,0.12), transparent 65%)",
          color: "#e8e0cf",
          fontFamily: "sans-serif",
          padding: "110px 80px",
        }}
      >
        {/* Rank */}
        <div
          style={{
            display: "flex",
            fontSize: "40px",
            letterSpacing: "16px",
            textTransform: "uppercase",
            color: rank.color,
          }}
        >
          {rank.name}
        </div>

        {/* Avatar */}
        <div
          style={{
            display: "flex",
            marginTop: "56px",
            borderRadius: "9999px",
            border: `10px solid ${rank.color}`,
            boxShadow: `0 0 90px ${rank.glow}`,
            overflow: "hidden",
          }}
        >
          {avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatar}
              alt=""
              width={400}
              height={400}
              style={{ width: "400px", height: "400px", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: "400px",
                height: "400px",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#1a102a",
                fontSize: "160px",
                color: rank.color,
              }}
            >
              {(profile.name ?? profile.login).slice(0, 1).toUpperCase()}
            </div>
          )}
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

        {/* Class */}
        <div
          style={{
            display: "flex",
            marginTop: "40px",
            borderRadius: "26px",
            border: `4px solid ${bossClass.color}`,
            padding: "16px 42px",
            fontSize: "44px",
            letterSpacing: "8px",
            textTransform: "uppercase",
            color: bossClass.color,
          }}
        >
          {bossClass.name}
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

        {/* Overall + footer */}
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: "34px", color: "#d4af37" }}>
            OVERALL {profile.overall}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "16px",
              fontSize: "30px",
              color: "#8a8172",
            }}
          >
            gitsouls.com/{profile.login}
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      headers: {
        // Force a save dialog: the <a download> attribute alone is ignored by
        // iOS Safari and in-app webviews, which just display the image instead.
        "Content-Disposition": `attachment; filename="${profile.login}-gitsouls.png"`,
      },
    },
  );
}
