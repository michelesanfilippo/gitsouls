"use client";

import { useEffect, useRef } from "react";
import { STAT_KEYS, STAT_LABELS } from "@/lib/scoring/types";
import { RANKS } from "@/lib/scoring/rank";
import { CLASS_BY_STAT } from "@/lib/scoring/class";

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
}

const STAT_SOURCES: Record<string, string> = {
  VIT: "Total contributions & commits",
  END: "Streak, active months, account age",
  INT: "Language breadth & repo quality",
  DEX: "Repo count, creation cadence, commits",
  FAI: "Owned repos, forks received, public PRs",
  SOP: "Followers, stars, watchers",
};

/** Souls-styled modal explaining how stats, ranks and classes are derived. */
export default function HowItWorksModal({ open, onClose }: HowItWorksModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="How GitSouls works"
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up relative my-8 w-full max-w-2xl rounded-lg border border-gold/30 bg-void-2/95 p-6 shadow-[0_0_60px_rgba(220,38,38,0.15)] outline-none sm:p-8"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="souls-focus absolute right-4 top-4 rounded-sm px-2 py-1 text-lg text-muted transition-colors hover:text-gold"
        >
          ✕
        </button>

        <h2 className="font-display text-2xl font-semibold tracking-wide text-gold">
          How the souls are weighed
        </h2>
        <p className="mt-2 text-sm text-parchment/70">
          Every boss is forged in real time from public GitHub data. No account,
          no database — just your commits, repos and reputation.
        </p>

        <div className="rule my-5" />

        <h3 className="font-display text-lg text-parchment">The six stats</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {STAT_KEYS.map((key) => (
            <li key={key} className="flex gap-3">
              <span className="w-10 shrink-0 font-display font-semibold text-ember">
                {key}
              </span>
              <span className="text-parchment/80">
                <span className="text-parchment">{STAT_LABELS[key]}</span> —{" "}
                {STAT_SOURCES[key]}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs italic text-muted">
          Overall power = (VIT + END + INT + DEX + FAI + SOP) / 6
        </p>

        <div className="rule my-5" />

        <h3 className="font-display text-lg text-parchment">Boss rank</h3>
        <p className="mt-1 text-sm text-parchment/70">
          Set by your overall power — and it colors the boss&apos;s border.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {RANKS.map((r) => (
            <span
              key={r.name}
              className="rounded-full border px-3 py-1 text-xs font-medium"
              style={{ borderColor: r.color, color: r.color }}
            >
              {r.name}
            </span>
          ))}
        </div>

        <div className="rule my-5" />

        <h3 className="font-display text-lg text-parchment">Class</h3>
        <p className="mt-1 text-sm text-parchment/70">
          Decided by your single highest stat.
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {STAT_KEYS.map((key) => {
            const c = CLASS_BY_STAT[key];
            return (
              <li key={key} className="flex items-center gap-2">
                <span
                  className="font-display font-semibold"
                  style={{ color: c.color }}
                >
                  {c.name}
                </span>
                <span className="text-muted">· {key}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
