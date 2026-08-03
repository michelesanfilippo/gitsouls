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
      <header className="flex w-full items-center justify-end gap-4 p-4 text-sm sm:gap-6 sm:p-6">
        <button
          onClick={() => setOpen(true)}
          className="souls-focus rounded-sm text-muted transition-colors hover:text-gold"
        >
          How it works
        </button>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="souls-focus flex items-center gap-2 rounded-sm text-muted transition-colors hover:text-gold"
        >
          <GitHubLogo className="h-4 w-4" />
          <span>Star on GitHub</span>
        </a>
      </header>
      <HowItWorksModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
