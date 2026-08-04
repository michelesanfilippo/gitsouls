import { ImageResponse } from "next/og";
import { loadFonts, readPublicImage } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "GitSouls — your github profile turned into a Souls-like boss";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Site-wide social preview: the OctoSouls mascot and the wordmark. App Router
 * picks this file up by convention and attaches it to every page that does not
 * override `openGraph.images` — so profiles and duels supply their own, and
 * everything else gets this.
 */
export default async function OpengraphImage() {
  const [mascot, { fonts, fontFamily }] = await Promise.all([
    readPublicImage("img/octoSouls-nobg.png"),
    loadFonts(),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "60px",
          padding: "70px",
          backgroundColor: "#0b0710",
          backgroundImage:
            "radial-gradient(900px 700px at 30% 0%, rgba(220,38,38,0.24), transparent 65%), radial-gradient(800px 600px at 80% 100%, rgba(212,175,55,0.14), transparent 65%), radial-gradient(1000px 420px at 20% 80%, rgba(178,178,205,0.14), transparent 68%)",
          color: "#e8e0cf",
          fontFamily,
        }}
      >
        {mascot && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={mascot} alt="" width={300} height={305} />
        )}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: "104px",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            <span>Git</span>
            <span style={{ color: "#d4af37" }}>Souls</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "22px",
              maxWidth: "560px",
              fontSize: "34px",
              lineHeight: 1.35,
              color: "rgba(232,224,207,0.78)",
            }}
          >
            Your github profile turned into a Souls-like boss
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "30px",
              fontSize: "26px",
              letterSpacing: "6px",
              textTransform: "uppercase",
              color: "#dc2626",
            }}
          >
            gitsouls.com
          </div>
        </div>
      </div>
    ),
    { ...size, ...(fonts.length > 0 ? { fonts } : {}) },
  );
}
