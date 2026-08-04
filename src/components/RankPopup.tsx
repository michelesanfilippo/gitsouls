"use client";

import { useState } from "react";
import type { RankInfo } from "@/lib/scoring";
import Modal from "./Modal";

/** "WHERE YOU RANK" trigger + popup with a population scale chart. */
export default function RankPopup({
  rankInfo,
  color,
}: {
  rankInfo: RankInfo;
  color: string;
}) {
  const [open, setOpen] = useState(false);

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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        label="Where you rank"
        maxWidth="max-w-lg"
      >
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
                      background: isUser ? color : "rgba(212,175,55,0.22)",
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
      </Modal>
    </>
  );
}
