import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getBossProfile } from "@/lib/profile";
import { GitHubError } from "@/lib/github/client";
import { STAT_KEYS, STAT_LABELS } from "@/lib/scoring/types";
import { deviconUrl } from "@/lib/devicon";
import { fetchImageDataUri, loadFonts, readPublicImage, readRankRing } from "@/lib/og";
import {
  spritesheetPath, detectGender,
  RANK_GLOW_COLOR,
} from "@/lib/sprite";

export const runtime = "nodejs";

/** Extract one sprite frame as a PNG data URI using sharp. */
async function extractSpriteDataUri(
  spritePath: string,
  outSize: number,
): Promise<string | null> {
  try {
    const sharp = (await import("sharp")).default;
    const file  = path.join(process.cwd(), "public", spritePath.replace(/^\//, ""));
    const buf   = await readFile(file);
    // Row 10 (0-indexed, py=640), frame 4 — walk with weapon (upright stance)
    const png = await sharp(buf)
      .extract({ left: 4 * 64, top: 640, width: 64, height: 64 })
      .resize(outSize, outSize, { kernel: "nearest" })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
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

async function buildCard(
  username: string,
  clientSprite: string | null,
): Promise<Response> {
  let profile: Awaited<ReturnType<typeof getBossProfile>>;
  try {
    profile = await getBossProfile(username);
  } catch (err) {
    if (err instanceof GitHubError && err.kind === "rate_limited") {
      return new Response("Rate limited — try again shortly", { status: 429 });
    }
    return new Response("Boss not found", { status: 404 });
  }

  const { rank, bossClass } = profile;
  const gender    = detectGender(profile.bio, profile.name, profile.pronouns);
  const sheetPath = spritesheetPath(profile.bossClass.name, gender);

  const SPRITE_DISPLAY = 288;

  const [avatar, langIcon, { fonts, fontFamily }, serverSprite, paperDataUri, ring] = await Promise.all([
    fetchImageDataUri(profile.avatarUrl),
    profile.topLanguage ? fetchLanguageIcon(profile.topLanguage) : Promise.resolve(null),
    loadFonts(),
    // Only extract server-side if client didn't send one
    clientSprite ? Promise.resolve(null) : extractSpriteDataUri(sheetPath, SPRITE_DISPLAY),
    readPublicImage("img/pixel-paper.png"),
    readRankRing(rank.name),
  ]);

  // Client sprite (already tinted, exact frame) takes priority
  const spriteDataUri = clientSprite || serverSprite;

  // Medallion geometry. With ring art the outer box is fixed and the portrait is
  // sized to that ring's hole; without it (Hollow) the portrait keeps its old
  // size and the box is just the portrait plus its border.
  const MEDALLION = ring ? 500 : 336;
  const PORTRAIT  = ring ? Math.round(MEDALLION * ring.innerRatio) : 320;
  const inset     = Math.round((MEDALLION - PORTRAIT) / 2);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#0b0710",
          backgroundImage:
            "radial-gradient(1000px 900px at 50% 0%, rgba(220,38,38,0.20), transparent 65%), radial-gradient(900px 800px at 50% 100%, rgba(212,175,55,0.12), transparent 65%)",
          color: "#e8e0cf",
          fontFamily,
          padding: "80px 80px 44px",
        }}
      >
        {/* Rank */}
        <div style={{ display:"flex", fontSize:"34px", letterSpacing:"14px", textTransform:"uppercase", color:rank.color, textShadow:`0 0 24px ${rank.glow}` }}>
          {rank.name}
        </div>

        {/* Medallion — portrait, rank ring, level */}
        <div style={{ display:"flex", position:"relative", marginTop:"36px", width:`${MEDALLION}px`, height:`${MEDALLION}px` }}>
          <div style={{
            display: "flex",
            position: "absolute",
            top: `${inset}px`,
            left: `${inset}px`,
            width: `${PORTRAIT}px`,
            height: `${PORTRAIT}px`,
            borderRadius: "9999px",
            boxShadow: `0 0 70px ${rank.glow}`,
            ...(ring ? {} : { border: `8px solid ${rank.color}` }),
          }}>
            {avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={avatar} alt="" width={PORTRAIT} height={PORTRAIT} style={{ width:`${PORTRAIT}px`, height:`${PORTRAIT}px`, objectFit:"cover", borderRadius:"9999px" }} />
            ) : (
              <div style={{ display:"flex", width:`${PORTRAIT}px`, height:`${PORTRAIT}px`, alignItems:"center", justifyContent:"center", borderRadius:"9999px", backgroundColor:"#1a102a", fontSize:"128px", color:rank.color }}>
                {(profile.name ?? profile.login).slice(0,1).toUpperCase()}
              </div>
            )}
            <div style={{ display:"flex", position:"absolute", top:0, left:0, width:`${PORTRAIT}px`, height:`${PORTRAIT}px`, borderRadius:"9999px", backgroundImage:"radial-gradient(circle at 30% 72%, rgba(205,205,225,0.30), transparent 56%), linear-gradient(to top, rgba(0,0,0,0.55), transparent 46%)" }} />
          </div>
          {/* Ring art over the portrait, so its ornaments overlap the face */}
          {ring && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={ring.dataUri} alt="" width={MEDALLION} height={MEDALLION} style={{ position:"absolute", top:0, left:0, width:`${MEDALLION}px`, height:`${MEDALLION}px` }} />
          )}
          {/* LV badge, centred on the medallion's bottom edge. A full-width flex
              row does the centring: satori has no reliable percentage transform
              on a shrink-to-fit element. */}
          <div style={{ display:"flex", position:"absolute", left:0, bottom:"-26px", width:`${MEDALLION}px`, justifyContent:"center" }}>
            <div style={{
              display: "flex",
              borderRadius: "9999px",
              border: `4px solid ${rank.color}`,
              backgroundColor: "#0b0710",
              boxShadow: `0 0 18px ${rank.color}, 0 0 46px ${rank.glow}`,
              padding: "8px 32px",
              fontSize: "34px",
              fontWeight: 700,
              color: rank.color,
            }}>
              LV {profile.level}
            </div>
          </div>
        </div>

        {/* Name + @login */}
        <div style={{ display:"flex", marginTop:"52px", fontSize:"58px", fontWeight:700, textAlign:"center" }}>
          {profile.name ?? profile.login}
        </div>
        <div style={{ display:"flex", fontSize:"26px", color:"#8a8172" }}>
          @{profile.login}
        </div>

        {/* Class chip + language */}
        <div style={{ display:"flex", alignItems:"center", gap:"16px", marginTop:"24px" }}>
          <div style={{ display:"flex", borderRadius:"16px", border:`3px solid ${bossClass.color}`, backgroundColor:`${bossClass.color}26`, boxShadow:`0 0 22px ${bossClass.color}4d`, padding:"8px 22px", fontSize:"26px", fontWeight:700, letterSpacing:"4px", textTransform:"uppercase", color:bossClass.color }}>
            {bossClass.name}
          </div>
          {langIcon ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={langIcon} alt="" width={48} height={48} style={{ width:"48px", height:"48px" }} />
          ) : profile.topLanguage ? (
            <div style={{ display:"flex", width:"48px", height:"48px", alignItems:"center", justifyContent:"center", borderRadius:"9999px", border:`2px solid ${rank.color}`, fontSize:"18px", fontWeight:700, color:rank.color }}>
              {profile.topLanguage.slice(0,2).toUpperCase()}
            </div>
          ) : null}
        </div>

        {/*
          Pixel art box — paper bg via img, sprite bottom-centre.
          It absorbs the slack instead of a fixed height: a ranked medallion is
          560px tall against Hollow's 336, and letting the box flex is what keeps
          both cards full without hand-tuning every block above it. Clamped so
          the sprite never crowds the frame nor floats in a sea of sky.
        */}
        <div style={{
          display: "flex",
          position: "relative",
          marginTop: "32px",
          width: "920px",
          flexGrow: 1,
          minHeight: "340px",
          maxHeight: "470px",
          borderRadius: "20px",
          border: "2px solid rgba(212,175,55,0.18)",
          overflow: "hidden",
          backgroundColor: "#0d0b14",
        }}>
          {/* Background: pixel-paper as a regular img stretched to fill */}
          {paperDataUri && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={paperDataUri} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center bottom" }} />
          )}
          {/* Dark vignette */}
          <div style={{ position:"absolute", inset:0, display:"flex", background:"linear-gradient(to bottom, rgba(11,7,16,0.72) 0%, rgba(11,7,16,0.20) 48%, rgba(11,7,16,0.10) 100%)" }} />
          <div style={{ position:"absolute", inset:0, display:"flex", background:"linear-gradient(to right, rgba(11,7,16,0.55) 0%, transparent 40%)" }} />
          {/* Sprite — right-aligned to avoid clipping, with rank glow underneath */}
          {spriteDataUri && (
            <div style={{ position:"absolute", bottom:0, right:"200px", display:"flex", alignItems:"flex-end", justifyContent:"center", width:`${SPRITE_DISPLAY + 60}px`, height:`${SPRITE_DISPLAY + 60}px` }}>
              {/* Rank glow circle behind sprite */}
                <div style={{ position:"absolute", bottom:0, right:"60px", width:`${SPRITE_DISPLAY}px`, height:`${SPRITE_DISPLAY}px`, borderRadius:"50%", background:`radial-gradient(circle, ${RANK_GLOW_COLOR[rank.name]}, transparent 70%)` }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={spriteDataUri} alt="" style={{ position:"absolute", bottom:0, right:"60px", width:`${SPRITE_DISPLAY}px`, height:`${SPRITE_DISPLAY}px`, imageRendering:"pixelated" }} />
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display:"flex", flexDirection:"column", width:"100%", marginTop:"32px", gap:"20px" }}>
          {STAT_KEYS.map((k) => (
            <div key={k} style={{ display:"flex", flexDirection:"column", width:"100%" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", width:"100%" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                  <span style={{ fontSize:"30px", letterSpacing:"5px", color:"#dc2626" }}>{k}</span>
                  <span style={{ fontSize:"22px", color:"#8a8172" }}>{STAT_LABELS[k].toUpperCase()}</span>
                </div>
                <span style={{ fontSize:"36px", fontWeight:700 }}>{profile.stats[k]}</span>
              </div>
              <div style={{ display:"flex", width:"100%", height:"12px", marginTop:"10px", borderRadius:"9999px", backgroundColor:"rgba(0,0,0,0.45)" }}>
                <div style={{ display:"flex", width:`${profile.stats[k]}%`, height:"12px", borderRadius:"9999px", backgroundColor:"#d4af37" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer — pinned to the bottom so any leftover slack sits above it */}
        <div style={{ display:"flex", marginTop:"auto", paddingTop:"24px", fontSize:"22px", letterSpacing:"2px", color:"#8a8172" }}>
          gitsouls.com/{profile.login}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      ...(fonts.length > 0 ? { fonts } : {}),
      headers: {
        "Content-Disposition": `attachment; filename="${profile.login}-gitsouls.png"`,
      },
    },
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  return buildCard(username, null);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  let clientSprite: string | null = null;
  try {
    const body = await req.json() as { sprite?: string };
    if (body.sprite && body.sprite.startsWith("data:image/png")) {
      clientSprite = body.sprite;
    }
  } catch { /* ignore parse errors */ }
  return buildCard(username, clientSprite);
}
