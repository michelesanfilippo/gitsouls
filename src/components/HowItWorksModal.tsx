"use client";

import { STAT_KEYS, STAT_LABELS } from "@/lib/scoring/types";
import { RANKS } from "@/lib/scoring/rank";
import { CLASS_BY_STAT } from "@/lib/scoring/class";
import { STAT_EXPLAINERS, SAMPLING_NOTE } from "@/lib/scoring/explain";
import Modal from "./Modal";

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
}

/** Souls-styled modal explaining how stats, ranks and classes are derived. */
export default function HowItWorksModal({ open, onClose }: HowItWorksModalProps) {
  return (
    // Wider than the default so the stat and class lists sit two-up, which keeps
    // the dialog from running taller than a laptop viewport.
    <Modal
      open={open}
      onClose={onClose}
      label="How the souls are weighed"
      maxWidth="max-w-3xl"
    >
      <p className="text-sm text-parchment/70">
        Every boss is forged in real time from public GitHub data. No account, no
        database — just your commits, repos and reputation.
      </p>

      <div className="rule my-5" />

      <h3 className="font-display text-lg text-parchment">The six stats</h3>
      <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {STAT_KEYS.map((key) => (
          <li key={key} className="flex gap-3">
            <span className="w-10 shrink-0 font-display font-semibold text-ember">
              {key}
            </span>
            <span className="text-parchment/80">
              <span className="text-parchment">{STAT_LABELS[key]}</span> —{" "}
              {STAT_EXPLAINERS[key].summary}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs italic text-muted">
        Overall power = (VIT + END + INT + DEX + FAI + SOP) / 6
      </p>
      <p className="mt-1 text-xs italic text-muted/70">
        Hover any stat on a profile for its exact weighting. {SAMPLING_NOTE}
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

      <div className="rule my-5" />

      <h3 className="font-display text-lg text-parchment">Skills</h3>
      <p className="mt-1 text-sm text-parchment/70">
        Unlocked by crossing thresholds — six languages, a thirty-day streak, a
        hundred stars, and so on. Hover any skill on a profile to see exactly
        what earned it. Each also carries a weight from 1 to 5, and rarer
        conditions weigh more.
      </p>

      <div className="rule my-5" />

      <h3 className="font-display text-lg text-parchment">Duels</h3>
      <p className="mt-1 text-sm text-parchment/70">
        Two bosses can be pitted against each other at{" "}
        <span className="text-parchment">gitsouls.com/you/vs/them</span>, or from
        the Duel button on any profile.
      </p>
      <ul className="mt-3 space-y-2 text-sm text-parchment/80">
        <li className="flex gap-3">
          <span className="w-24 shrink-0 font-display font-semibold text-ember">
            Battle power
          </span>
          <span>
            Overall power plus the summed weight of every unlocked skill. The
            higher total wins, so a deeper roster can take a fight that raw stats
            alone would lose.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="w-24 shrink-0 font-display font-semibold text-ember">
            Health
          </span>
          <span>
            The victor keeps the share of their power the loser could not answer.
            A near-equal opponent leaves them at a sliver; a far weaker one
            barely scratches them.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="w-24 shrink-0 font-display font-semibold text-ember">
            The tale
          </span>
          <span>
            Written from both fighters — their ranks, classes and the skills they
            lean on. Equal power means neither survives.
          </span>
        </li>
      </ul>
      <p className="mt-3 text-xs italic text-muted">
        A duel always tells the same story for the same two profiles, so a shared
        link shows what you saw — but it is retold as either boss grows stronger.
      </p>
    </Modal>
  );
}
