import type { StatKey } from "@/lib/scoring/types";

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
  return (
    <div className={right ? "text-right" : "text-left"}>
      <div
        className={`flex items-baseline gap-2 ${
          right ? "flex-row-reverse" : ""
        }`}
      >
        <span className="font-display text-sm font-semibold tracking-widest text-ember">
          {statKey}
        </span>
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
