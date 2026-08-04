"use client";

import { useState } from "react";
import { STAT_KEYS, STAT_LABELS, type Stats, type StatKey } from "@/lib/scoring/types";
import { STAT_EXPLAINERS } from "@/lib/scoring/explain";

const SIZE = 200;
const CENTRE = SIZE / 2;
const RADIUS = 68;
/** how far the stat labels sit beyond the outer ring */
const LABEL_RADIUS = RADIUS + 20;

/**
 * Vertex position for stat `i` at `scale` (0–1) of the full radius.
 * Starts at the top (-90°) and runs clockwise, so VIT is the apex.
 */
function vertex(i: number, scale: number): [number, number] {
  const angle = (Math.PI / 180) * (-90 + i * 60);
  return [
    CENTRE + Math.cos(angle) * RADIUS * scale,
    CENTRE + Math.sin(angle) * RADIUS * scale,
  ];
}

function polygon(scale: number): string {
  return STAT_KEYS.map((_, i) => vertex(i, scale).join(",")).join(" ");
}

/** Stats are 0–99; scale against 100 so a maxed stat sits just inside the ring. */
function plotted(value: number): number {
  return Math.max(value, 4) / 100;
}

/**
 * Radar chart of the six stats. The filled shape reveals a boss's profile at a
 * glance — a spike toward one vertex reads as specialisation, an even spread as
 * a generalist. Hovering or focusing a vertex explains how that stat is derived.
 */
export default function StatHexagon({
  stats,
  color,
  /** grey the whole chart out, for a defeated fighter */
  muted = false,
}: {
  stats: Stats;
  color: string;
  muted?: boolean;
}) {
  const [active, setActive] = useState<StatKey | null>(null);
  const stroke = muted ? "#6b7280" : color;
  const shape = STAT_KEYS.map((k, i) =>
    vertex(i, plotted(stats[k])).join(","),
  ).join(" ");

  const explain = active ? STAT_EXPLAINERS[active] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-auto w-full"
        role="img"
        aria-label={STAT_KEYS.map((k) => `${k} ${stats[k]}`).join(", ")}
      >
        {/* Guide rings */}
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <polygon
            key={r}
            points={polygon(r)}
            fill="none"
            stroke="rgba(212,175,55,0.14)"
            strokeWidth="1"
          />
        ))}

        {/* Spokes */}
        {STAT_KEYS.map((k, i) => {
          const [x, y] = vertex(i, 1);
          return (
            <line
              key={k}
              x1={CENTRE}
              y1={CENTRE}
              x2={x}
              y2={y}
              stroke="rgba(212,175,55,0.12)"
              strokeWidth="1"
            />
          );
        })}

        {/* The boss's shape */}
        <polygon
          points={shape}
          fill={stroke}
          fillOpacity={muted ? 0.14 : 0.26}
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Stat labels */}
        {STAT_KEYS.map((k, i) => {
          const angle = (Math.PI / 180) * (-90 + i * 60);
          const x = CENTRE + Math.cos(angle) * LABEL_RADIUS;
          const y = CENTRE + Math.sin(angle) * LABEL_RADIUS;
          return (
            <text
              key={k}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-display"
              fontSize="11"
              letterSpacing="1.5"
              fill={
                active === k ? "#d4af37" : muted ? "#6b7280" : "#dc2626"
              }
            >
              {k}
            </text>
          );
        })}

        {/* Vertex handles. Drawn last so they sit above the fill, each with a
            generous transparent hit area — the visible dot is too small to
            target comfortably. */}
        {STAT_KEYS.map((k, i) => {
          const [x, y] = vertex(i, plotted(stats[k]));
          const on = active === k;
          return (
            <g
              key={k}
              onMouseEnter={() => setActive(k)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(k)}
              onBlur={() => setActive(null)}
              tabIndex={0}
              role="button"
              aria-label={`${STAT_LABELS[k]} ${stats[k]} — how it is calculated`}
              className="cursor-help focus:outline-none"
            >
              <circle cx={x} cy={y} r="11" fill="transparent" />
              <circle
                cx={x}
                cy={y}
                r={on ? 5 : 2.5}
                fill={on ? "#d4af37" : stroke}
                className="transition-all duration-150"
              />
            </g>
          );
        })}
      </svg>

      {/* Explanation panel. Positioned over the chart rather than beside it, so
          it never widens the column on a narrow duel layout. */}
      {explain && active && (
        <div className="animate-fade-up pointer-events-none absolute inset-x-0 top-full z-20 -mt-2 rounded-xl border border-gold/25 bg-void-2 p-3 text-left shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <span className="block font-display text-xs uppercase tracking-[0.2em] text-gold">
            {active} · {STAT_LABELS[active]} — {stats[active]}
          </span>
          <span className="mt-1.5 block text-xs text-parchment/75">
            {explain.summary}
          </span>
          <span className="mt-2 block">
            {explain.parts.map((p) => (
              <span key={p} className="block text-[11px] text-parchment/60">
                {p}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
