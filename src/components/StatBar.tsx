"use client";

import type { StatKey } from "@/lib/scoring/types";
import { STAT_EXPLAINERS } from "@/lib/scoring/explain";
import Tooltip from "./Tooltip";

interface StatBarProps {
  statKey: StatKey;
  label: string;
  value: number;
  /** right-aligns the label/bar for the right-hand column */
  align?: "left" | "right";
}

/** A single stat row: abbreviation, value and a filled ember bar. */
export default function StatBar({
  statKey,
  label,
  value,
  align = "left",
}: StatBarProps) {
  const right = align === "right";
  const explain = STAT_EXPLAINERS[statKey];

  return (
    <div className={right ? "text-right" : "text-left"}>
      <div
        className={`flex items-baseline gap-2 ${
          right ? "flex-row-reverse" : ""
        }`}
      >
        <Tooltip
          align={right ? "right" : "left"}
          content={
            <>
              <span className="block font-display text-xs uppercase tracking-[0.2em] text-gold">
                {statKey} · {label}
              </span>
              <span className="mt-1.5 block text-xs text-parchment/75">
                {explain.summary}
              </span>
              <span className="mt-2 block space-y-0.5">
                {explain.parts.map((p) => (
                  <span key={p} className="block text-[11px] text-parchment/60">
                    {p}
                  </span>
                ))}
              </span>
              <span className="mt-2 block text-[11px] italic text-muted">
                {explain.note}
              </span>
            </>
          }
        >
          <button
            type="button"
            aria-label={`How ${label} is calculated`}
            className="souls-focus cursor-help rounded-sm font-display text-sm font-semibold tracking-widest text-ember decoration-ember/40 decoration-dotted underline-offset-4 hover:underline"
          >
            {statKey}
          </button>
        </Tooltip>
        <span className="text-xs uppercase tracking-wide text-muted">
          {label}
        </span>
        <span
          className={`font-display text-lg font-bold text-parchment ${
            right ? "mr-auto" : "ml-auto"
          }`}
        >
          {value}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-ember to-gold"
          style={{
            width: `${value}%`,
            marginLeft: right ? "auto" : undefined,
          }}
        />
      </div>
    </div>
  );
}
