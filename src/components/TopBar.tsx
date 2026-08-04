"use client";

import { useState } from "react";
import Link from "next/link";
import GitHubLogo from "./GitHubLogo";
import HowItWorksModal from "./HowItWorksModal";
import { REPO_URL } from "@/lib/links";

interface TopBarProps {
  /**
   * Destination for the "Back" link. Pass a string to show the link;
   * omit (or pass undefined) to hide it.
   */
  backHref?: string;
  /**
   * Hide the "How it works" trigger. The landing page shows it in its status
   * line beside the summon count instead, so keeping it here too would duplicate
   * it in two places on the same screen.
   */
  hideHowItWorks?: boolean;
}

/** Page chrome: optional "Back" on the left, "How it works" and "Star on GitHub" on the right. */
export default function TopBar({
  backHref,
  hideHowItWorks = false,
}: TopBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex w-full items-center justify-between gap-4 p-4 text-base sm:p-6">
        {backHref ? (
          <Link
            href={backHref}
            className="souls-focus flex cursor-pointer items-center gap-2 rounded-sm font-display text-base tracking-wide text-parchment/80 transition-colors hover:text-gold"
          >
            <span aria-hidden>←</span> Back
          </Link>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-4 sm:gap-6">
          {!hideHowItWorks && (
            <button
              onClick={() => setOpen(true)}
              className="souls-focus cursor-pointer rounded-sm font-display text-sm tracking-wide text-parchment/80 transition-colors hover:text-gold sm:text-base"
            >
              How it works
            </button>
          )}

          {/* Mobile: round icon only. sm+: pill with label. */}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Star on GitHub"
            className="souls-focus flex cursor-pointer items-center transition-colors"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-void-2/80 hover:border-gold/60 hover:text-gold sm:hidden">
              <GitHubLogo className="h-5 w-5" />
            </span>
            <span className="hidden items-center gap-2 rounded-lg border border-gold/30 bg-void-2/80 px-4 py-2 font-display text-base text-parchment/80 hover:border-gold/60 hover:text-gold sm:flex">
              <GitHubLogo className="h-5 w-5" />
              Star on GitHub
            </span>
          </a>
        </div>
      </header>
      <HowItWorksModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
