"use client";

import { useEffect, useState } from "react";
import { formatSouls } from "@/lib/souls";

/**
 * Live "N souls summoned" badge. Fetched client-side so the landing page stays
 * static; renders nothing at all when the counter isn't configured (no Redis
 * env vars) rather than showing a hollow zero.
 */
export default function SoulsCounter() {
  const [count, setCount] = useState<number | null>(null);

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

  if (count === null) return null;

  return (
    <div className="animate-fade-up mt-6 flex items-center gap-3 rounded-full border border-[#22c55e]/35 bg-[#22c55e]/10 px-6 py-3 backdrop-blur">
      <span className="relative flex h-2.5 w-2.5" aria-hidden>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-70" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
      </span>
      <span className="font-display text-lg tracking-wide text-[#4ade80]">
        {formatSouls(count)} souls summoned
      </span>
    </div>
  );
}
