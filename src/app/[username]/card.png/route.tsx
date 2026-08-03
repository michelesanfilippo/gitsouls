import { ImageResponse } from "next/og";
import { getBossProfile } from "@/lib/profile";
import { STAT_KEYS, STAT_LABELS } from "@/lib/scoring/types";

export const runtime = "nodejs";

/** Downloadable / social 1200×630 boss card rendered with next/og. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  let profile: Awaited<ReturnType<typeof getBossProfile>>;
  try {
    profile = await getBossProfile(username);
  } catch {
    return new Response("Boss not found", { status: 404 });
  }

  const { rank, bossClass } = profile;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(900px 500px at 50% -10%, rgba(220,38,38,0.18), transparent 60%), #0b0710",
          color: "#e8e0cf",
          fontFamily: "sans-serif",
          padding: "56px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "44px" }}>
          <div
            style={{
              display: "flex",
              borderRadius: "9999px",
              border: `8px solid ${rank.color}`,
              boxShadow: `0 0 60px ${rank.glow}`,
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatarUrl}
              alt=""
              width={260}
              height={260}
              style={{ width: "260px", height: "260px", objectFit: "cover" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: "30px",
                letterSpacing: "10px",
                textTransform: "uppercase",
                color: rank.color,
              }}
            >
              {rank.name}
            </div>
            <div style={{ fontSize: "76px", fontWeight: 700, lineHeight: 1.1 }}>
              {profile.name ?? profile.login}
            </div>
            <div style={{ fontSize: "30px", color: "#8a8172" }}>
              @{profile.login} · LV {profile.level}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: "14px",
                fontSize: "30px",
                color: bossClass.color,
                letterSpacing: "6px",
                textTransform: "uppercase",
              }}
            >
              {bossClass.name}
              {profile.topLanguage ? `  ·  ${profile.topLanguage}` : ""}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "auto",
            gap: "16px",
          }}
        >
          {STAT_KEYS.map((k) => (
            <div
              key={k}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
              }}
            >
              <div style={{ fontSize: "44px", fontWeight: 700, color: "#d4af37" }}>
                {profile.stats[k]}
              </div>
              <div style={{ fontSize: "22px", color: "#dc2626", letterSpacing: "3px" }}>
                {k}
              </div>
              <div style={{ fontSize: "16px", color: "#8a8172" }}>
                {STAT_LABELS[k]}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "34px",
            fontSize: "24px",
            color: "#8a8172",
          }}
        >
          <div style={{ display: "flex" }}>gitsouls.com/{profile.login}</div>
          <div style={{ display: "flex", color: "#d4af37" }}>
            Overall {profile.overall}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
