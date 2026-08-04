"use client";

import { useState } from "react";
import Link from "next/link";
import GitHubLogo from "./GitHubLogo";
import HowItWorksModal from "./HowItWorksModal";
import { REPO_URL } from "@/lib/links";

interface TopBarProps {
  /** show the "Back" link on the left (profile pages) */
  showBack?: boolean;
}

/** Page chrome: optional "Back" on the left, "How it works" and "Star on GitHub" on the right. */
export default function TopBar({ showBack = false }: TopBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex w-full items-center justify-between gap-4 p-4 text-base sm:p-6">
        {showBack ? (
          <Link
            href="/"
            className="souls-focus flex cursor-pointer items-center gap-2 rounded-sm font-display text-base tracking-wide text-parchment/80 transition-colors hover:text-gold"
          >
            <span aria-hidden>←</span> Back
          </Link>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => setOpen(true)}
            className="souls-focus cursor-pointer rounded-sm font-display text-base tracking-wide text-parchment/80 transition-colors hover:text-gold"
          >
            How it works
          </button>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="souls-focus flex cursor-pointer items-center gap-2 rounded-lg border border-gold/30 bg-void-2/50 px-4 py-2 font-display text-base text-parchment/80 backdrop-blur transition-colors hover:border-gold/60 hover:text-gold"
          >
            <GitHubLogo className="h-5 w-5" />
            <span>Star on GitHub</span>
          </a>
        </div>
      </header>
      <HowItWorksModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
