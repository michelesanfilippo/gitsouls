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

type Outcome = "won" | "lost" | "tied";

/** One combatant: health bar, portrait, rank, name and class. */
function Fighter({
  profile,
  outcome,
  hp,
}: {
  profile: BossProfile;
  /** undefined until the duel has finished resolving */
  outcome?: Outcome;
  /** health left once resolved, 0–100 */
  hp: number;
}) {
  const { rank, bossClass } = profile;
  const defeated = outcome === "lost" || outcome === "tied";
  const resolved = outcome !== undefined;

  // Full health until the fight resolves, then whatever is left.
  const shownHp = resolved ? hp : 100;

  return (
    <div className="flex flex-col items-center text-center">
      {/* Health */}
      <div className="mb-5 w-full max-w-[15rem]">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="font-display text-[11px] uppercase tracking-[0.25em] text-muted">
            HP
          </span>
          <span
            className="font-display text-sm font-bold tabular-nums"
            style={{ color: defeated ? "#6b7280" : rank.color }}
          >
            {shownHp}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/50">
          <div
            className="h-full rounded-full transition-all duration-[1400ms] ease-out"
            style={{
              width: `${shownHp}%`,
              background: defeated
                ? "#4b5563"
                : `linear-gradient(to right, ${rank.color}, #d4af37)`,
            }}
          />
        </div>
      </div>

      <span
        className="mb-3 font-display text-xl uppercase tracking-[0.3em] sm:text-2xl"
        style={{
          color: defeated ? "#6b7280" : rank.color,
          textShadow: defeated
            ? "none"
            : `0 0 22px ${rank.glow}, 0 2px 4px rgba(0,0,0,0.85)`,
        }}
      >
        {rank.name}
      </span>

      <div
        className="relative transition-all duration-1000"
        style={{ filter: defeated ? "grayscale(1) brightness(0.5)" : "none" }}
      >
        <div
          className="relative overflow-hidden rounded-full"
          style={{
            border: `6px solid ${defeated ? "#4b5563" : rank.color}`,
            boxShadow: defeated
              ? "inset 0 0 25px rgba(0,0,0,0.8)"
              : `0 0 80px ${rank.glow}, 0 0 30px ${rank.color}, inset 0 0 25px rgba(0,0,0,0.7)`,
          }}
        >
          <Image
            src={profile.avatarUrl}
            alt={`${profile.login} avatar`}
            width={240}
            height={240}
            priority
            className="h-44 w-44 object-cover sm:h-52 sm:w-52"
          />
        </div>

        <span
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border bg-void px-3 py-0.5 font-display text-sm font-bold"
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
        className="mt-7 font-display text-2xl font-bold text-parchment transition-colors hover:text-gold sm:text-3xl"
      >
        {profile.name ?? profile.login}
      </a>
      <span className="text-sm text-muted">@{profile.login}</span>

      <span
        className="mt-3 rounded-xl border-2 px-3.5 py-1.5 font-display text-sm font-semibold uppercase tracking-[0.18em] sm:text-base"
        style={{
          color: defeated ? "#9ca3af" : bossClass.color,
          borderColor: defeated ? "#4b5563" : bossClass.color,
          backgroundColor: defeated ? "transparent" : `${bossClass.color}15`,
          boxShadow: defeated ? "none" : `0 0 20px ${bossClass.color}30`,
        }}
      >
        {bossClass.name}
      </span>

      {outcome === "won" && (
        <span
          className="animate-fade-up mt-4 font-display text-lg font-bold uppercase tracking-[0.3em] text-gold sm:text-xl"
          style={{ textShadow: "0 0 24px rgba(212,175,55,0.5)" }}
        >
          Victory
        </span>
      )}
      {outcome === "lost" && (
        <span className="animate-fade-up mt-4 font-display text-lg uppercase tracking-[0.3em] text-muted sm:text-xl">
          Fallen
        </span>
      )}
      {outcome === "tied" && (
        <span className="animate-fade-up mt-4 font-display text-lg uppercase tracking-[0.3em] text-muted sm:text-xl">
          Slain
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

  const outcomeFor = (login: string): Outcome | undefined => {
    if (!done) return undefined;
    if (!duel.winner) return "tied";
    return duel.winner.login === login ? "won" : "lost";
  };

  const hpFor = (login: string): number => {
    if (!duel.winner) return 0;
    return duel.winner.login === login ? duel.winnerHp : 0;
  };

  return (
    <div className="animate-fade-up mx-auto flex w-full max-w-7xl flex-1 flex-col gap-14 px-4 py-8 sm:px-8">
      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Fighter
          profile={left}
          outcome={outcomeFor(left.login)}
          hp={hpFor(left.login)}
        />

        {/* Stat ledger */}
        <div className="flex flex-col gap-4 md:pt-16">
          {STAT_KEYS.map((k, i) => {
            const shown = i < revealed;
            const l = left.stats[k];
            const r = right.stats[k];
            const leftWins = shown && l > r;
            const rightWins = shown && r > l;

            return (
              <div
                key={k}
                className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-3 transition-opacity duration-500"
                style={{ opacity: shown ? 1 : 0.15 }}
              >
                <span
                  className={`text-right font-display text-2xl font-bold tabular-nums sm:text-3xl ${
                    leftWins ? "text-gold" : "text-parchment/55"
                  }`}
                >
                  {shown ? l : "—"}
                </span>

                <div className="text-center">
                  <span className="block font-display text-sm uppercase tracking-[0.25em] text-ember">
                    {k}
                  </span>
                  <span className="block text-[11px] uppercase tracking-wide text-muted">
                    {STAT_LABELS[k]}
                  </span>
                </div>

                <span
                  className={`font-display text-2xl font-bold tabular-nums sm:text-3xl ${
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
            className="mt-3 grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-3 border-t border-gold/15 pt-4 transition-opacity duration-700"
            style={{ opacity: done ? 1 : 0 }}
          >
            <span
              className={`text-right font-display text-3xl font-bold tabular-nums ${
                duel.winner?.login === left.login
                  ? "text-gold"
                  : "text-parchment/55"
              }`}
            >
              {left.overall}
            </span>
            <span className="text-center font-display text-sm uppercase tracking-[0.25em] text-gold/80">
              Overall
            </span>
            <span
              className={`font-display text-3xl font-bold tabular-nums ${
                duel.winner?.login === right.login
                  ? "text-gold"
                  : "text-parchment/55"
              }`}
            >
              {right.overall}
            </span>
          </div>
        </div>

        <Fighter
          profile={right}
          outcome={outcomeFor(right.login)}
          hp={hpFor(right.login)}
        />
      </div>

      {/* The tale, once the dust settles */}
      <div
        className="flex min-h-[6rem] flex-col items-center text-center transition-opacity duration-1000"
        style={{ opacity: done ? 1 : 0 }}
      >
        <div className="rule mx-auto mb-6 w-32" />
        <p className="mx-auto max-w-3xl font-serif text-lg italic leading-relaxed text-parchment/85 sm:text-xl">
          {duel.lore}
        </p>
      </div>
    </div>
  );
}
