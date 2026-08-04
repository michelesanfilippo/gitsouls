import { ImageResponse } from "next/og";
import { getBossProfile } from "@/lib/profile";
import { STAT_KEYS } from "@/lib/scoring/types";
import { fetchImageDataUri, loadFonts, readPublicImage } from "@/lib/og";

export const runtime = "nodejs";

/**
 * 1200×630 social preview for a boss profile.
 *
 * Separate from `card.png` on purpose: that one is 1080×1920 and sets
 * Content-Disposition: attachment, which makes it a good download but useless
 * as a link preview — crawlers would save it instead of displaying it. This
 * route is served inline and shaped for the 1.91:1 slot X and LinkedIn render.
 *
 * Never fails: a profile that cannot be fetched falls back to the branded card,
 * because a broken preview is worse than a generic one.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const { fonts, fontFamily } = await loadFonts();

  let profile: Awaited<ReturnType<typeof getBossProfile>> | null = null;
  try {
    profile = await getBossProfile(username);
  } catch {
    profile = null;
  }

  const [avatar, mascot] = await Promise.all([
    profile ? fetchImageDataUri(profile.avatarUrl) : Promise.resolve(null),
    readPublicImage("img/octoSouls-nobg.png"),
  ]);

  const shell = {
    width: "1200px",
    height: "630px",
    display: "flex" as const,
    backgroundColor: "#0b0710",
    backgroundImage:
      "radial-gradient(900px 700px at 50% 0%, rgba(220,38,38,0.22), transparent 65%), radial-gradient(800px 600px at 50% 100%, rgba(212,175,55,0.12), transparent 65%), radial-gradient(900px 420px at 20% 78%, rgba(178,178,205,0.14), transparent 68%)",
    color: "#e8e0cf",
    fontFamily,
  };

  // No boss to show — fall back to the branded card.
  if (!profile) {
    return new ImageResponse(
      (
        <div
          style={{
            ...shell,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "70px",
          }}
        >
          {mascot && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={mascot} alt="" width={240} height={244} />
          )}
          <div
            style={{
              display: "flex",
              marginTop: "24px",
              fontSize: "92px",
              fontWeight: 700,
            }}
          >
            <span>Git</span>
            <span style={{ color: "#d4af37" }}>Souls</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "14px",
              fontSize: "34px",
              color: "rgba(232,224,207,0.75)",
            }}
          >
            Your github profile turned into a Souls-like boss
          </div>
        </div>
      ),
      { width: 1200, height: 630, ...(fonts.length > 0 ? { fonts } : {}) },
    );
  }

  const { rank, bossClass } = profile;

  return new ImageResponse(
    (
      <div style={{ ...shell, flexDirection: "column", padding: "56px 64px" }}>
        {/* Brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {mascot && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={mascot} alt="" width={62} height={63} />
            )}
            <div style={{ display: "flex", fontSize: "38px", fontWeight: 700 }}>
              <span>Git</span>
              <span style={{ color: "#d4af37" }}>Souls</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "26px",
              letterSpacing: "10px",
              textTransform: "uppercase",
              color: rank.color,
            }}
          >
            {rank.name}
          </div>
        </div>

        {/* Boss */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            gap: "52px",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              position: "relative",
              borderRadius: "9999px",
              border: `8px solid ${rank.color}`,
              boxShadow: `0 0 70px ${rank.glow}`,
            }}
          >
            {avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatar}
                alt=""
                width={260}
                height={260}
                style={{
                  width: "260px",
                  height: "260px",
                  objectFit: "cover",
                  borderRadius: "9999px",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  width: "260px",
                  height: "260px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "9999px",
                  backgroundColor: "#1a102a",
                  fontSize: "110px",
                  color: rank.color,
                }}
              >
                {(profile.name ?? profile.login).slice(0, 1).toUpperCase()}
              </div>
            )}
            {/* Fog over the portrait, echoing the site */}
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: 0,
                left: 0,
                width: "260px",
                height: "260px",
                borderRadius: "9999px",
                backgroundImage:
                  "radial-gradient(circle at 30% 72%, rgba(205,205,225,0.32), transparent 56%), linear-gradient(to top, rgba(0,0,0,0.55), transparent 46%)",
              }}
            />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "66px",
                fontWeight: 700,
                lineHeight: 1.05,
              }}
            >
              {profile.name ?? profile.login}
            </div>
            <div
              style={{ display: "flex", fontSize: "28px", color: "#8a8172" }}
            >
              @{profile.login} · LV {profile.level}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: "20px",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  borderRadius: "16px",
                  border: `3px solid ${bossClass.color}`,
                  backgroundColor: `${bossClass.color}26`,
                  padding: "8px 22px",
                  fontSize: "26px",
                  letterSpacing: "5px",
                  textTransform: "uppercase",
                  color: bossClass.color,
                }}
              >
                {bossClass.name}
              </div>
              {profile.topLanguage && (
                <div
                  style={{ display: "flex", fontSize: "24px", color: "#8a8172" }}
                >
                  {profile.topLanguage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(212,175,55,0.2)",
            paddingTop: "24px",
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
              <div
                style={{ fontSize: "44px", fontWeight: 700, color: "#d4af37" }}
              >
                {profile.stats[k]}
              </div>
              <div
                style={{
                  fontSize: "20px",
                  letterSpacing: "4px",
                  color: "#dc2626",
                }}
              >
                {k}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630, ...(fonts.length > 0 ? { fonts } : {}) },
  );
}
