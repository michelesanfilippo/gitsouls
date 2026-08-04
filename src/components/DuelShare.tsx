"use client";

import { useState } from "react";
import Icon from "./Icon";
import { XLogo, LinkedInLogo, ShareGlyph } from "./SocialIcons";

interface DuelShareProps {
  /** headline describing the outcome, used as the share text */
  summary: string;
}

/** Share row for a duel: X, LinkedIn, copy link, then the native share. */
export default function DuelShare({ summary }: DuelShareProps) {
  const [copied, setCopied] = useState(false);

  const duelUrl = () =>
    typeof window !== "undefined" ? window.location.href : "https://gitsouls.com";

  const shareX = () =>
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        summary,
      )}&url=${encodeURIComponent(duelUrl())}`,
      "_blank",
      "noopener,noreferrer",
    );

  const shareLinkedIn = () =>
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        duelUrl(),
      )}`,
      "_blank",
      "noopener,noreferrer",
    );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(duelUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "GitSouls",
          text: summary,
          url: duelUrl(),
        });
      } catch {
        /* user dismissed */
      }
    } else {
      shareX();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2.5">
        <button
          onClick={shareX}
          aria-label="Share this duel on X"
          className="souls-focus flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gold/25 text-parchment/80 transition-colors hover:border-gold/60 hover:text-gold"
        >
          <XLogo />
        </button>
        <button
          onClick={shareLinkedIn}
          aria-label="Share this duel on LinkedIn"
          className="souls-focus flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gold/25 text-parchment/80 transition-colors hover:border-gold/60 hover:text-gold"
        >
          <LinkedInLogo />
        </button>
        <button
          onClick={copyLink}
          aria-label="Copy link to this duel"
          className="souls-focus flex cursor-pointer items-center gap-2 rounded-full border border-gold/25 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-parchment/80 transition-colors hover:border-gold/60 hover:text-gold"
        >
          <Icon name="link" /> Copy link
        </button>
      </div>

      <button
        onClick={nativeShare}
        className="souls-focus flex cursor-pointer items-center gap-2.5 rounded-full bg-gradient-to-r from-ember to-ember-glow px-7 py-3.5 font-display text-base font-semibold uppercase tracking-[0.15em] text-parchment shadow-[0_0_28px_rgba(220,38,38,0.4)] transition-transform hover:scale-[1.02]"
      >
        <ShareGlyph className="h-5 w-5" /> Share the duel
      </button>

      <p className="h-4 text-xs text-gold/90" aria-live="polite">
        {copied ? "Link copied to the archive." : ""}
      </p>
    </div>
  );
}
