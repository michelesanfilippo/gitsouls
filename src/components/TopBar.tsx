"use client";

import { useState } from "react";
import GitHubLogo from "./GitHubLogo";
import HowItWorksModal from "./HowItWorksModal";
import { REPO_URL } from "@/lib/links";

/** Top-right chrome: "How it works" trigger and "Star on GitHub" link. */
export default function TopBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex w-full items-center justify-end gap-4 p-4 text-base sm:gap-6 sm:p-6">
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
      </header>
      <HowItWorksModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
