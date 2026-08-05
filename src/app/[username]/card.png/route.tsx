import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getBossProfile } from "@/lib/profile";
import { GitHubError } from "@/lib/github/client";
import { STAT_KEYS, STAT_LABELS } from "@/lib/scoring/types";
import { deviconUrl } from "@/lib/devicon";
import { fetchImageDataUri, loadFonts } from "@/lib/og";
import { spritesheetPath, detectGender } from "@/lib/sprite";

export const runtime = "nodejs";

/**
 * Extract a single frame from an LPC spritesheet using sharp.
 * Walk south, frame 0: row 10 (py=640), col 0 (px=0), 64×64.
 * Upscaled to 192×192 with nearest-neighbour so pixel art stays crisp.
 * Returns a PNG data URI or null on any failure.
 */
async function extractSpriteFrame(
  spritePath: string,
  sx: number,
  sy: number,
  fw: number,
  fh: number,
  outSize: number,
): Promise<string | null> {
  try {
    const sharp = (await import("sharp")).default;
    const file  = path.join(process.cwd(), "public", spritePath.replace(/^\//, ""));
    const buf   = await readFile(file);
    const png   = await sharp(buf)
      .extract({ left: sx, top: sy, width: fw, height: fh })
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
    // Distinguish the two failures rather than calling everything a 404.
    if (err instanceof GitHubError && err.kind === "rate_limited") {
      return new Response("Rate limited — try again shortly", { status: 429 });
    }
    return new Response("Boss not found", { status: 404 });
  }

  const { rank, bossClass } = profile;

  const gender       = detectGender(profile.bio);
  const sheetPath    = spritesheetPath(profile.bossClass.name, gender);
  // Walk south, frame 0 (row 10 = py 640, col 0 = px 0), 64×64 → upscale to 192
  const WALK_ROW_PY  = 640;

  const [avatar, langIcon, { fonts, fontFamily }, spriteFrame] = await Promise.all([
    fetchImageDataUri(profile.avatarUrl),
    profile.topLanguage
      ? fetchLanguageIcon(profile.topLanguage)
      : Promise.resolve(null),
    loadFonts(),
    extractSpriteFrame(sheetPath, 0, WALK_ROW_PY, 64, 64, 192),
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
          // Separate properties: satori's multi-layer `background` shorthand
          // parsing is its least reliable path.
          backgroundColor: "#0b0710",
          backgroundImage:
            // Last two layers are the drifting fog banks.
            "radial-gradient(1000px 900px at 50% 0%, rgba(220,38,38,0.20), transparent 65%), radial-gradient(900px 800px at 50% 100%, rgba(212,175,55,0.12), transparent 65%), radial-gradient(1100px 520px at 22% 74%, rgba(178,178,205,0.16), transparent 68%), radial-gradient(950px 460px at 82% 34%, rgba(158,158,190,0.12), transparent 66%)",
          color: "#e8e0cf",
          fontFamily,
          padding: "110px 80px 44px",
        }}
      >
        {/* Rank */}
        <div style={{ display:"flex", fontSize:"28px", letterSpacing:"12px", textTransform:"uppercase", color:rank.color, textShadow:`0 0 20px ${rank.glow}` }}>
          {rank.name}
        </div>

        {/* Avatar */}
        <div style={{ display:"flex", position:"relative", marginTop:"36px", borderRadius:"9999px", border:`7px solid ${rank.color}`, boxShadow:`0 0 60px ${rank.glow}` }}>
          {avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={avatar} alt="" width={280} height={280} style={{ width:"280px", height:"280px", objectFit:"cover", borderRadius:"9999px" }} />
          ) : (
            <div style={{ display:"flex", width:"280px", height:"280px", alignItems:"center", justifyContent:"center", borderRadius:"9999px", backgroundColor:"#1a102a", fontSize:"110px", color:rank.color }}>
              {(profile.name ?? profile.login).slice(0,1).toUpperCase()}
            </div>
          )}
          <div style={{ display:"flex", position:"absolute", top:0, left:0, width:"280px", height:"280px", borderRadius:"9999px", backgroundImage:"radial-gradient(circle at 30% 72%, rgba(205,205,225,0.30), transparent 56%), linear-gradient(to top, rgba(0,0,0,0.55), transparent 46%)" }} />
        </div>

        {/* LV badge */}
        <div style={{ display:"flex", marginTop:"-22px", borderRadius:"9999px", border:`3px solid ${rank.color}`, backgroundColor:"#0b0710", padding:"5px 22px", fontSize:"24px", color:rank.color }}>
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
        <div style={{ display:"flex", alignItems:"center", gap:"16px", marginTop:"28px" }}>
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

        {/* Pixel art — walk frame upscaled from spritesheet */}
        {spriteFrame && (
          <div style={{ display:"flex", marginTop:"28px", borderRadius:"16px", border:`2px solid rgba(212,175,55,0.25)`, backgroundColor:"rgba(20,12,30,0.55)", padding:"12px 24px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={spriteFrame} alt="" width={192} height={192} style={{ width:"192px", height:"192px", imageRendering:"pixelated" }} />
          </div>
        )}

        {/* Stats */}
        <div style={{ display:"flex", flexDirection:"column", width:"100%", marginTop:"32px", gap:"18px" }}>
          {STAT_KEYS.map((k) => (
            <div key={k} style={{ display:"flex", flexDirection:"column", width:"100%" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", width:"100%" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                  <span style={{ fontSize:"26px", letterSpacing:"4px", color:"#dc2626" }}>{k}</span>
                  <span style={{ fontSize:"19px", color:"#8a8172" }}>{STAT_LABELS[k].toUpperCase()}</span>
                </div>
                <span style={{ fontSize:"32px", fontWeight:700 }}>{profile.stats[k]}</span>
              </div>
              <div style={{ display:"flex", width:"100%", height:"10px", marginTop:"8px", borderRadius:"9999px", backgroundColor:"rgba(0,0,0,0.45)" }}>
                <div style={{ display:"flex", width:`${profile.stats[k]}%`, height:"10px", borderRadius:"9999px", backgroundColor:"#d4af37" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display:"flex", marginTop:"auto", paddingTop:"28px", fontSize:"22px", letterSpacing:"2px", color:"#8a8172" }}>
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
