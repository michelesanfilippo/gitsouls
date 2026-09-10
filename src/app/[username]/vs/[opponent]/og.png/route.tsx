import { ImageResponse } from "next/og";
import { getBossProfile, type BossProfile } from "@/lib/profile";
import { resolveDuel } from "@/lib/lore/duel";
import { fetchImageDataUri, loadFonts, readPublicImage, readRankRing } from "@/lib/og";
import type { RankRing } from "@/lib/rank-ring";

export const runtime = "nodejs";

function toSide(p: BossProfile) {
  return {
    login: p.login,
    name: p.name,
    className: p.bossClass.name,
    rankName: p.rank.name,
    overall: p.overall,
    skills: p.skills,
  };
}

/** One combatant's column. The loser is drained of colour. */
function Fighter({
  profile,
  avatar,
  ring,
  defeated,
  hp,
}: {
  profile: BossProfile;
  avatar: string | null;
  ring: (RankRing & { dataUri: string }) | null;
  defeated: boolean;
  hp: number;
}) {
  const accent = defeated ? "#5b6270" : profile.rank.color;

  // Same geometry as the profile medallion: fixed outer box with ring art, the
  // portrait sized to that ring's hole, Hollow keeping its plain border.
  const MEDALLION = ring ? 250 : 204;
  const PORTRAIT = ring ? Math.round(MEDALLION * ring.innerRatio) : 190;
  const inset = Math.round((MEDALLION - PORTRAIT) / 2);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          position: "relative",
          width: `${MEDALLION}px`,
          height: `${MEDALLION}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: `${inset}px`,
            left: `${inset}px`,
            width: `${PORTRAIT}px`,
            height: `${PORTRAIT}px`,
            borderRadius: "9999px",
            boxShadow: defeated ? "none" : `0 0 60px ${profile.rank.glow}`,
            ...(ring ? {} : { border: `7px solid ${accent}` }),
          }}
        >
          {avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatar}
              alt=""
              width={PORTRAIT}
              height={PORTRAIT}
              style={{
                width: `${PORTRAIT}px`,
                height: `${PORTRAIT}px`,
                objectFit: "cover",
                borderRadius: "9999px",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: `${PORTRAIT}px`,
                height: `${PORTRAIT}px`,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9999px",
                backgroundColor: "#1a102a",
                fontSize: "84px",
                color: accent,
              }}
            >
              {(profile.name ?? profile.login).slice(0, 1).toUpperCase()}
            </div>
          )}

          {/* Satori has no grayscale filter, so the loser is dimmed with an
              overlay instead. */}
          {defeated && (
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: 0,
                left: 0,
                width: `${PORTRAIT}px`,
                height: `${PORTRAIT}px`,
                borderRadius: "9999px",
                backgroundColor: "rgba(11,7,16,0.62)",
              }}
            />
          )}
        </div>

        {ring && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={ring.dataUri}
            alt=""
            width={MEDALLION}
            height={MEDALLION}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${MEDALLION}px`,
              height: `${MEDALLION}px`,
              // The loser's regalia is dimmed the same way the portrait is.
              opacity: defeated ? 0.42 : 1,
            }}
          />
        )}
      </div>

      <div
        style={{
          display: "flex",
          marginTop: "12px",
          fontSize: "20px",
          letterSpacing: "7px",
          textTransform: "uppercase",
          color: accent,
        }}
      >
        {profile.rank.name}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "6px",
          fontSize: "38px",
          fontWeight: 700,
          color: defeated ? "rgba(232,224,207,0.55)" : "#e8e0cf",
        }}
      >
        {profile.name ?? profile.login}
      </div>
      <div style={{ display: "flex", fontSize: "22px", color: "#8a8172" }}>
        {profile.bossClass.name}
      </div>

      {/* Health bar */}
      <div
        style={{
          display: "flex",
          width: "200px",
          height: "12px",
          marginTop: "12px",
          borderRadius: "9999px",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: `${Math.max(hp, 2)}%`,
            height: "12px",
            borderRadius: "9999px",
            backgroundColor: defeated ? "#4b5563" : accent,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "6px",
          fontSize: "20px",
          color: defeated ? "#6b7280" : accent,
        }}
      >
        {hp}% HP
      </div>
    </div>
  );
}

/**
 * 1200×630 social preview for a duel — two portraits and a verdict.
 *
 * This is the most shareable image the site produces, because it names two
 * people: the loser has a reason to reply. Served inline, unlike card.png.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string; opponent: string }> },
) {
  const { username, opponent } = await params;
  const { fonts, fontFamily } = await loadFonts();

  let pair: [BossProfile, BossProfile] | null = null;
  try {
    pair = await Promise.all([
      getBossProfile(username),
      getBossProfile(opponent),
    ]);
  } catch {
    pair = null;
  }

  const mascot = await readPublicImage("img/octoSouls-nobg.png");

  // Fall back to the branded card rather than serving a broken preview.
  if (!pair) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0b0710",
            color: "#e8e0cf",
            fontFamily,
          }}
        >
          {mascot && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={mascot} alt="" width={220} height={224} />
          )}
          <div
            style={{ display: "flex", marginTop: "20px", fontSize: "72px", fontWeight: 700 }}
          >
            <span>Git</span>
            <span style={{ color: "#d4af37" }}>Souls</span>
          </div>
          <div style={{ display: "flex", fontSize: "30px", color: "#8a8172" }}>
            No duel to be had
          </div>
        </div>
      ),
      { width: 1200, height: 630, ...(fonts.length > 0 ? { fonts } : {}) },
    );
  }

  const [left, right] = pair;
  const duel = resolveDuel(toSide(left), toSide(right));

  const [leftAvatar, rightAvatar, leftRing, rightRing] = await Promise.all([
    fetchImageDataUri(left.avatarUrl),
    fetchImageDataUri(right.avatarUrl),
    readRankRing(left.rank.name),
    readRankRing(right.rank.name),
  ]);

  const lost = (login: string) =>
    duel.winner ? duel.winner.login !== login : true;
  const hpOf = (login: string) =>
    duel.winner?.login === login ? duel.winnerHp : 0;

  const verdict = duel.winner
    ? `${duel.winner.name?.trim() || duel.winner.login} wins`
    : "Mutual destruction";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          padding: "32px 56px",
          backgroundColor: "#0b0710",
          backgroundImage:
            "radial-gradient(900px 600px at 50% 0%, rgba(220,38,38,0.24), transparent 65%), radial-gradient(900px 420px at 50% 100%, rgba(178,178,205,0.13), transparent 68%)",
          color: "#e8e0cf",
          fontFamily,
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
          }}
        >
          {mascot && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={mascot} alt="" width={46} height={47} />
          )}
          <div style={{ display: "flex", fontSize: "30px", fontWeight: 700 }}>
            <span>Git</span>
            <span style={{ color: "#d4af37" }}>Souls</span>
          </div>
        </div>

        {/* The two fighters, VS between them */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            marginTop: "6px",
          }}
        >
          <Fighter
            profile={left}
            avatar={leftAvatar}
            ring={leftRing}
            defeated={lost(left.login)}
            hp={hpOf(left.login)}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "180px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "62px",
                fontWeight: 700,
                color: "#dc2626",
              }}
            >
              VS
            </div>
            <div
              style={{
                display: "flex",
                marginTop: "10px",
                fontSize: "26px",
                color: "#d4af37",
              }}
            >
              {duel.scores[left.login]} — {duel.scores[right.login]}
            </div>
          </div>

          <Fighter
            profile={right}
            avatar={rightAvatar}
            ring={rightRing}
            defeated={lost(right.login)}
            hp={hpOf(right.login)}
          />
        </div>

        {/* Verdict */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            borderTop: "1px solid rgba(212,175,55,0.2)",
            paddingTop: "16px",
            fontSize: "30px",
            letterSpacing: "8px",
            textTransform: "uppercase",
            color: "#d4af37",
          }}
        >
          {verdict}
        </div>
      </div>
    ),
    { width: 1200, height: 630, ...(fonts.length > 0 ? { fonts } : {}) },
  );
}
