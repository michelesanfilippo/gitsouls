"use client";

import { useEffect, useRef, useState } from "react";
import type { RankInfo } from "@/lib/scoring";

/** "WHERE YOU RANK" trigger + popup with a population scale chart. */
export default function RankPopup({
  rankInfo,
  color,
}: {
  rankInfo: RankInfo;
  color: string;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const pctLabel =
    rankInfo.topPercent < 1
      ? "<1%"
      : `${rankInfo.topPercent % 1 === 0 ? rankInfo.topPercent : rankInfo.topPercent.toFixed(1)}%`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="souls-focus cursor-pointer font-display text-xs uppercase tracking-[0.3em] text-gold/80 underline decoration-gold/40 underline-offset-4 transition-colors hover:text-gold"
      >
        Where you rank
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Where you rank"
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-up relative w-full max-w-lg rounded-lg border border-gold/30 bg-void-2/95 p-6 shadow-[0_0_60px_rgba(220,38,38,0.15)] outline-none sm:p-8"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="souls-focus absolute right-4 top-4 cursor-pointer rounded-sm px-2 py-1 text-lg text-muted transition-colors hover:text-gold"
            >
              ✕
            </button>

            <h2 className="font-display text-2xl font-semibold tracking-wide text-gold">
              Where you rank
            </h2>
            <p className="mt-2 text-sm text-parchment/70">
              Most of GitHub gathers at the lower fires. You stand among the few.
            </p>

            <div
              className="mt-6 text-center font-display text-4xl font-bold"
              style={{ color }}
            >
              Top {pctLabel}
              <span className="ml-2 align-middle text-base font-normal text-parchment/60">
                of GitHub
              </span>
            </div>

            <div className="mt-8 flex h-40 items-end justify-between gap-1.5">
              {rankInfo.buckets.map((b, i) => {
                const isUser = i === rankInfo.userBucket;
                return (
                  <div
                    key={b.from}
                    className="flex flex-1 flex-col items-center gap-1.5"
                  >
                    <div className="flex h-32 w-full items-end">
                      <div
                        className="w-full rounded-t transition-all"
                        style={{
                          height: `${Math.max(4, b.weight)}%`,
                          background: isUser
                            ? color
                            : "rgba(212,175,55,0.22)",
                          boxShadow: isUser ? `0 0 18px ${color}` : undefined,
                        }}
                      />
                    </div>
                    <span
                      className={`text-[9px] ${
                        isUser ? "font-bold text-parchment" : "text-muted"
                      }`}
                    >
                      {b.from}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs text-muted">
              Boss level along the bottom · your tier is lit in flame.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
