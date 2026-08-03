"use client";

import { useEffect, useRef, useState } from "react";

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
    <div className="glass rounded-2xl p-4">
      <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-gold/80">
        Spread the curse
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={shareX}
          aria-label="Share on X"
          className="souls-focus flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gold/25 text-parchment/80 transition-colors hover:border-gold/60 hover:text-gold"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h6.83l4.713 6.231 5.447-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
          </svg>
        </button>
        <button
          onClick={shareLinkedIn}
          aria-label="Share on LinkedIn"
          className="souls-focus flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gold/25 text-parchment/80 transition-colors hover:border-gold/60 hover:text-gold"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
          </svg>
        </button>

        <button
          onClick={nativeShare}
          className="souls-focus flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-ember to-ember-glow px-4 py-2 font-display text-xs font-semibold text-parchment shadow-[0_0_24px_rgba(220,38,38,0.35)] transition-transform hover:scale-[1.03]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
          </svg>
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
              <a
                href={cardUrl}
                download={`${login}-gitsouls.png`}
                onClick={() => setMenuOpen(false)}
                className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm text-parchment/85 transition-colors hover:bg-white/5 hover:text-gold"
              >
                🖼️ Download card (PNG)
              </a>
              <button
                onClick={copyLink}
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-sm text-parchment/85 transition-colors hover:bg-white/5 hover:text-gold"
              >
                🔗 Copy profile link
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
