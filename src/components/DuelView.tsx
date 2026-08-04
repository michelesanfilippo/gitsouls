"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { BossProfile } from "@/lib/profile";
import { STAT_KEYS, STAT_LABELS } from "@/lib/scoring/types";
import { resolveDuel } from "@/lib/lore/duel";

/** ms between each stat row being revealed */
const STEP_MS = 460;

function toSide(p: BossProfile) {
  return {
    login: p.login,
    name: p.name,
    className: p.bossClass.name,
    rankName: p.rank.name,
    overall: p.overall,
  };
}

/** One combatant's portrait, rank, name and class. */
function Fighter({
  profile,
  outcome,
}: {
  profile: BossProfile;
  /** undefined until the duel has finished resolving */
  outcome?: "won" | "lost" | "tied";
}) {
  const { rank, bossClass } = profile;
  const defeated = outcome === "lost";

  return (
    <div className="flex flex-col items-center text-center">
      <span
        className="mb-2 font-display text-lg uppercase tracking-[0.3em] sm:text-xl"
        style={{
          color: defeated ? "#6b7280" : rank.color,
          textShadow: defeated
            ? "none"
            : `0 0 20px ${rank.glow}, 0 2px 4px rgba(0,0,0,0.85)`,
        }}
      >
        {rank.name}
      </span>

      <div
        className="relative transition-all duration-1000"
        style={{
          filter: defeated ? "grayscale(1) brightness(0.55)" : "none",
        }}
      >
        <div
          className="relative overflow-hidden rounded-full"
          style={{
            border: `5px solid ${defeated ? "#4b5563" : rank.color}`,
            boxShadow: defeated
              ? "inset 0 0 25px rgba(0,0,0,0.8)"
              : `0 0 70px ${rank.glow}, 0 0 24px ${rank.color}, inset 0 0 25px rgba(0,0,0,0.7)`,
          }}
        >
          <Image
            src={profile.avatarUrl}
            alt={`${profile.login} avatar`}
            width={200}
            height={200}
            priority
            className="h-32 w-32 object-cover sm:h-40 sm:w-40"
          />
        </div>

        <span
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border bg-void px-2.5 py-0.5 font-display text-xs font-bold"
          style={{
            borderColor: defeated ? "#4b5563" : rank.color,
            color: defeated ? "#9ca3af" : rank.color,
          }}
        >
          LV {profile.level}
        </span>
      </div>

      <a
        href={`/${profile.login}`}
        className="mt-6 font-display text-lg font-bold text-parchment transition-colors hover:text-gold sm:text-xl"
      >
        {profile.name ?? profile.login}
      </a>
      <span className="text-xs text-muted">@{profile.login}</span>

      <span
        className="mt-2.5 rounded-lg border px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.15em]"
        style={{
          color: defeated ? "#9ca3af" : bossClass.color,
          borderColor: defeated ? "#4b5563" : bossClass.color,
          backgroundColor: defeated ? "transparent" : `${bossClass.color}15`,
        }}
      >
        {bossClass.name}
      </span>

      {outcome === "won" && (
        <span className="animate-fade-up mt-3 font-display text-sm uppercase tracking-[0.3em] text-gold">
          Victor
        </span>
      )}
      {outcome === "lost" && (
        <span className="animate-fade-up mt-3 font-display text-sm uppercase tracking-[0.3em] text-muted">
          Fallen
        </span>
      )}
    </div>
  );
}

/** Side-by-side duel: stats resolve one by one, then the tale is told. */
export default function DuelView({
  left,
  right,
}: {
  left: BossProfile;
  right: BossProfile;
}) {
  const duel = resolveDuel(toSide(left), toSide(right));

  // Reveal one stat row at a time, then the verdict.
  const [revealed, setRevealed] = useState(0);
  const done = revealed >= STAT_KEYS.length;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setRevealed((n) => n + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [revealed, done]);

  const outcomeFor = (login: string): "won" | "lost" | "tied" | undefined => {
    if (!done) return undefined;
    if (!duel.winner) return "tied";
    return duel.winner.login === login ? "won" : "lost";
  };

  return (
    <div className="animate-fade-up mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-6 sm:px-8">
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)]">
        <Fighter profile={left} outcome={outcomeFor(left.login)} />

        {/* Stat ledger */}
        <div className="flex flex-col gap-2.5">
          {STAT_KEYS.map((k, i) => {
            const shown = i < revealed;
            const l = left.stats[k];
            const r = right.stats[k];
            const leftWins = shown && l > r;
            const rightWins = shown && r > l;

            return (
              <div
                key={k}
                className="grid grid-cols-[3rem_1fr_3rem] items-center gap-2 transition-opacity duration-500"
                style={{ opacity: shown ? 1 : 0.15 }}
              >
                <span
                  className={`text-right font-display text-xl font-bold tabular-nums ${
                    leftWins ? "text-gold" : "text-parchment/55"
                  }`}
                >
                  {shown ? l : "—"}
                </span>

                <div className="text-center">
                  <span className="block font-display text-[11px] uppercase tracking-[0.25em] text-ember">
                    {k}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wide text-muted">
                    {STAT_LABELS[k]}
                  </span>
                </div>

                <span
                  className={`font-display text-xl font-bold tabular-nums ${
                    rightWins ? "text-gold" : "text-parchment/55"
                  }`}
                >
                  {shown ? r : "—"}
                </span>
              </div>
            );
          })}

          {/* Overall, once every stat is in */}
          <div
            className="mt-2 grid grid-cols-[3rem_1fr_3rem] items-center gap-2 border-t border-gold/15 pt-3 transition-opacity duration-700"
            style={{ opacity: done ? 1 : 0 }}
          >
            <span
              className={`text-right font-display text-2xl font-bold tabular-nums ${
                duel.winner?.login === left.login ? "text-gold" : "text-parchment/55"
              }`}
            >
              {left.overall}
            </span>
            <span className="text-center font-display text-[11px] uppercase tracking-[0.25em] text-gold/80">
              Overall
            </span>
            <span
              className={`font-display text-2xl font-bold tabular-nums ${
                duel.winner?.login === right.login ? "text-gold" : "text-parchment/55"
              }`}
            >
              {right.overall}
            </span>
          </div>
        </div>

        <Fighter profile={right} outcome={outcomeFor(right.login)} />
      </div>

      {/* The tale, once the dust settles */}
      <div
        className="flex min-h-[5rem] flex-col items-center text-center transition-opacity duration-1000"
        style={{ opacity: done ? 1 : 0 }}
      >
        <p className="mx-auto max-w-2xl font-serif text-base italic leading-relaxed text-parchment/80 sm:text-lg">
          {duel.lore}
        </p>
        {done && (
          <p className="mt-4 font-display text-xs uppercase tracking-[0.3em] text-muted">
            {duel.winner
              ? `Won by ${duel.margin} power`
              : "Mutual destruction"}
          </p>
        )}
      </div>
    </div>
  );
}
