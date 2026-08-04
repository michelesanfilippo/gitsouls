import type { RankInfo } from "@/lib/scoring";

/**
 * Standing among all of GitHub, stated outright instead of hidden behind a
 * popup. The population bar keeps the "most gather at the lower fires" idea
 * without needing the full chart.
 */
export default function PercentileBox({
  rankInfo,
  color,
}: {
  rankInfo: RankInfo;
  color: string;
}) {
  const pctLabel =
    rankInfo.topPercent < 1
      ? "<1%"
      : `${
          rankInfo.topPercent % 1 === 0
            ? rankInfo.topPercent
            : rankInfo.topPercent.toFixed(1)
        }%`;

  return (
    <div className="glass-soft rounded-2xl p-3">
      <p className="mb-1.5 font-display text-[10px] uppercase tracking-[0.3em] text-gold/80">
        Where you rank
      </p>
      <p className="font-display text-xl font-bold" style={{ color }}>
        Top {pctLabel}
        <span className="ml-1.5 align-middle font-serif text-xs font-normal text-parchment/60">
          of GitHub
        </span>
      </p>

      {/* Population scale: the lit tier is this boss's */}
      <div
        className="mt-2.5 flex h-6 items-end gap-1"
        role="img"
        aria-label={`Overall ${rankInfo.buckets[rankInfo.userBucket].from} to ${
          rankInfo.buckets[rankInfo.userBucket].to
        }, top ${pctLabel} of GitHub`}
      >
        {rankInfo.buckets.map((b, i) => {
          const isUser = i === rankInfo.userBucket;
          return (
            <div
              key={b.from}
              className="flex-1 rounded-t"
              style={{
                height: `${Math.max(8, b.weight)}%`,
                background: isUser ? color : "rgba(212,175,55,0.18)",
                boxShadow: isUser ? `0 0 12px ${color}` : undefined,
              }}
            />
          );
        })}
      </div>
      <p className="mt-1.5 text-[10px] text-muted">
        Boss level 0 → 99 · your tier is lit
      </p>
    </div>
  );
}
