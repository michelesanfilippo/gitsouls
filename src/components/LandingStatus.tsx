"use client";

import { useEffect, useState } from "react";
import { formatSouls } from "@/lib/souls";
import HowItWorksModal from "./HowItWorksModal";

/**
 * Status line under the search box: the live summon count and the "How it works"
 * trigger, which lives here rather than in the TopBar on the landing page.
 *
 * The count is fetched client-side so the page stays static. When the counter
 * isn't configured (no Redis env vars) the tally and its separator are omitted
 * rather than showing a hollow zero — but "How it works" still renders, which is
 * why the two share a component instead of being composed in the page.
 */
export default function LandingStatus() {
  const [count, setCount] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/souls")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { count: number | null } | null) => {
        if (!cancelled && typeof data?.count === "number") setCount(data.count);
      })
      .catch(() => {
        /* counter is decorative — stay silent */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="mt-7 flex items-center gap-3 font-display text-sm tracking-wide sm:text-base">
        {count !== null && (
          <>
            <span className="relative flex h-2.5 w-2.5" aria-hidden>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
            </span>
            <span className="text-parchment">
              {formatSouls(count)} souls summoned
            </span>
            <span className="text-muted/50" aria-hidden>
              |
            </span>
          </>
        )}

        <button
          onClick={() => setOpen(true)}
          className="souls-focus cursor-pointer rounded-sm text-parchment/80 transition-colors hover:text-gold"
        >
          How it works
        </button>
      </div>

      <HowItWorksModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
