import { STAT_KEYS, type Stats } from "@/lib/scoring/types";

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

/**
 * Radar chart of the six stats. The filled shape reveals a boss's profile at a
 * glance — a spike toward one vertex reads as specialisation, an even spread as
 * a generalist.
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
  const stroke = muted ? "#6b7280" : color;
  const shape = STAT_KEYS.map((k, i) =>
    // Stats are 0–99; scale against 100 so a maxed stat sits just inside the ring.
    vertex(i, Math.max(stats[k], 4) / 100).join(","),
  ).join(" ");

  return (
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

      {/* Vertex dots */}
      {STAT_KEYS.map((k, i) => {
        const [x, y] = vertex(i, Math.max(stats[k], 4) / 100);
        return <circle key={k} cx={x} cy={y} r="2.5" fill={stroke} />;
      })}

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
            fill={muted ? "#6b7280" : "#dc2626"}
          >
            {k}
          </text>
        );
      })}
    </svg>
  );
}
