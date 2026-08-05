import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getBossProfile } from "@/lib/profile";
import { GitHubError } from "@/lib/github/client";
import { STAT_KEYS, STAT_LABELS } from "@/lib/scoring/types";
import { deviconUrl } from "@/lib/devicon";
import { fetchImageDataUri, loadFonts, readPublicImage } from "@/lib/og";
import {
  spritesheetPath, detectGender,
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
    if (err instanceof GitHubError && err.kind === "rate_limited") {
      return new Response("Rate limited — try again shortly", { status: 429 });
    }
    return new Response("Boss not found", { status: 404 });
  }

  const { rank, bossClass } = profile;
  const gender    = detectGender(profile.bio, profile.name, profile.pronouns);
  const sheetPath = spritesheetPath(profile.bossClass.name, gender);

  const SPRITE_DISPLAY = 210; // upscaled sprite size in the card

  const [avatar, langIcon, { fonts, fontFamily }, spriteDataUri, paperDataUri] = await Promise.all([
    fetchImageDataUri(profile.avatarUrl),
    profile.topLanguage ? fetchLanguageIcon(profile.topLanguage) : Promise.resolve(null),
    loadFonts(),
    extractSpriteDataUri(sheetPath, SPRITE_DISPLAY),
    readPublicImage("img/pixel-paper.png"),
  ]);

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
          padding: "110px 80px 44px",
        }}
      >
        {/* Rank */}
        <div style={{ display:"flex", fontSize:"34px", letterSpacing:"14px", textTransform:"uppercase", color:rank.color, textShadow:`0 0 24px ${rank.glow}` }}>
          {rank.name}
        </div>

        {/* Avatar — slightly larger */}
        <div style={{ display:"flex", position:"relative", marginTop:"36px", borderRadius:"9999px", border:`8px solid ${rank.color}`, boxShadow:`0 0 70px ${rank.glow}` }}>
          {avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={avatar} alt="" width={320} height={320} style={{ width:"320px", height:"320px", objectFit:"cover", borderRadius:"9999px" }} />
          ) : (
            <div style={{ display:"flex", width:"320px", height:"320px", alignItems:"center", justifyContent:"center", borderRadius:"9999px", backgroundColor:"#1a102a", fontSize:"128px", color:rank.color }}>
              {(profile.name ?? profile.login).slice(0,1).toUpperCase()}
            </div>
          )}
          <div style={{ display:"flex", position:"absolute", top:0, left:0, width:"320px", height:"320px", borderRadius:"9999px", backgroundImage:"radial-gradient(circle at 30% 72%, rgba(205,205,225,0.30), transparent 56%), linear-gradient(to top, rgba(0,0,0,0.55), transparent 46%)" }} />
        </div>

        {/* LV badge */}
        <div style={{ display:"flex", marginTop:"-24px", borderRadius:"9999px", border:`3px solid ${rank.color}`, backgroundColor:"#0b0710", padding:"6px 26px", fontSize:"26px", color:rank.color }}>
          LV {profile.level}
        </div>

        {/* Name + @login */}
        <div style={{ display:"flex", marginTop:"28px", fontSize:"58px", fontWeight:700, textAlign:"center" }}>
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

        {/* Pixel art box — paper bg + sprite, built as satori JSX */}
        <div style={{
          display: "flex",
          marginTop: "32px",
          width: "920px",
          height: "280px",
          borderRadius: "20px",
          border: "2px solid rgba(212,175,55,0.18)",
          overflow: "hidden",
          backgroundImage: paperDataUri ? `url(${paperDataUri})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundColor: "#110a1a",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: "0px",
        }}>
          {spriteDataUri && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={spriteDataUri}
              alt=""
              width={SPRITE_DISPLAY}
              height={SPRITE_DISPLAY}
              style={{
                width: `${SPRITE_DISPLAY}px`,
                height: `${SPRITE_DISPLAY}px`,
                imageRendering: "pixelated",
              }}
            />
          )}
        </div>

        {/* Stats — immediately below the pixel art box, larger text */}
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

        {/* Footer */}
        <div style={{ display:"flex", paddingTop:"24px", fontSize:"22px", letterSpacing:"2px", color:"#8a8172" }}>
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
