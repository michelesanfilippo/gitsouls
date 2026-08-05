"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { XLogo, LinkedInLogo, ShareGlyph } from "./SocialIcons";

interface ShareBoxProps {
  login: string;
  name: string;
}

/** Bottom-left share cluster: X, LinkedIn, native share, download menu. */
export default function ShareBox({ login, name }: ShareBoxProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const getProfileUrl = () =>
    typeof window !== "undefined"
      ? window.location.href
      : `https://gitsouls.com/${login}`;

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const shareText = `${name} is a Souls-like boss on GitSouls ⚔️`;
  const cardUrl = `/${login}/card.png`;

  const downloadCard = async () => {
    setMenuOpen(false);
    // Capture the live pixel art canvas, upscale to display size
    const canvas = document.querySelector<HTMLCanvasElement>('[data-pixel-boss="true"]');
    let spriteDataUri = "";
    if (canvas) {
      // The canvas is 96×96 internally but displayed at ~118px via CSS scale.
      // We upscale with nearest-neighbour to match the visual size on screen.
      const TARGET = 288; // 20% smaller than before
      const off = document.createElement("canvas");
      off.width  = TARGET;
      off.height = TARGET;
      const ctx = off.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = false; // pixelated upscale
        ctx.drawImage(canvas, 0, 0, TARGET, TARGET);
        spriteDataUri = off.toDataURL("image/png");
      }
    }
    try {
      const res = await fetch(cardUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sprite: spriteDataUri }),
      });
      if (!res.ok) throw new Error("card generation failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${login}-gitsouls.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open GET route in new tab
      window.open(cardUrl, "_blank");
    }
  };

  const shareX = () =>
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText,
      )}&url=${encodeURIComponent(getProfileUrl())}`,
      "_blank",
      "noopener,noreferrer",
    );

  const shareLinkedIn = () =>
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        getProfileUrl(),
      )}`,
      "_blank",
      "noopener,noreferrer",
    );

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "GitSouls",
          text: shareText,
          url: getProfileUrl(),
        });
      } catch {
        /* user dismissed */
      }
    } else {
      shareX();
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getProfileUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
    setMenuOpen(false);
  };

  return (
    <div className="glass-soft rounded-2xl p-4">
      <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-gold/80">
        Spread the curse
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={shareX}
          aria-label="Share on X"
          className="souls-focus flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gold/25 text-parchment/80 transition-colors hover:border-gold/60 hover:text-gold"
        >
          <XLogo />
        </button>
        <button
          onClick={shareLinkedIn}
          aria-label="Share on LinkedIn"
          className="souls-focus flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gold/25 text-parchment/80 transition-colors hover:border-gold/60 hover:text-gold"
        >
          <LinkedInLogo />
        </button>

        <button
          onClick={nativeShare}
          className="souls-focus flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-ember to-ember-glow px-4 py-2 font-display text-xs font-semibold text-parchment shadow-[0_0_24px_rgba(220,38,38,0.35)] transition-transform hover:scale-[1.03]"
        >
          <ShareGlyph />
          Share your soul
        </button>

        <div ref={wrapRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="souls-focus flex cursor-pointer items-center gap-2 rounded-full border border-gold/40 bg-void-2/60 px-4 py-2 font-display text-xs font-semibold text-gold transition-colors hover:border-gold/70"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
            </svg>
            Download
          </button>
          {menuOpen && (
            <div className="glass animate-fade-up absolute bottom-full left-0 z-20 mb-2 w-52 overflow-hidden rounded-xl">
              <button
                onClick={downloadCard}
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-sm text-parchment/85 transition-colors hover:bg-white/5 hover:text-gold"
              >
                <Icon name="image" /> Download story card
              </button>
              <button
                onClick={copyLink}
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-sm text-parchment/85 transition-colors hover:bg-white/5 hover:text-gold"
              >
                <Icon name="link" /> Copy profile link
              </button>
            </div>
          )}
        </div>
      </div>
      {copied && (
        <p className="mt-2 text-xs text-gold/90">Link copied to the archive.</p>
      )}
    </div>
  );
}
