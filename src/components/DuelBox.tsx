"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { parseUsername, VALID_USERNAME } from "@/lib/username";

/**
 * "Duel" call to action. Opens an inline prompt for a challenger's handle and
 * sends the pair to /<login>/vs/<opponent>.
 */
export default function DuelBox({ login }: { login: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const opponent = parseUsername(value);

    if (!opponent) {
      setError("Name your challenger.");
      return;
    }
    if (!VALID_USERNAME.test(opponent)) {
      setError("That is no valid GitHub name.");
      return;
    }
    if (opponent.toLowerCase() === login.toLowerCase()) {
      setError("You cannot duel your own shadow.");
      return;
    }

    setError(null);
    startTransition(() => {
      router.push(`/${login}/vs/${opponent}`);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="souls-focus flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-ember to-ember-glow px-6 py-3.5 font-display text-base font-semibold uppercase tracking-[0.15em] text-parchment shadow-[0_0_28px_rgba(220,38,38,0.4)] transition-transform hover:scale-[1.02]"
      >
        <span aria-hidden>⚔️</span> Duel
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass-soft rounded-2xl p-4">
      <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-gold/80">
        Summon a challenger
      </p>
      <div className="flex items-stretch gap-2">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder="github username"
          aria-label="Challenger's GitHub username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          className="souls-focus min-w-0 flex-1 rounded-xl border border-gold/25 bg-black/55 px-4 py-2.5 font-serif text-parchment placeholder:text-muted/70"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Begin the duel"
          className="souls-focus flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-ember to-ember-glow px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-widest text-parchment transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          {pending ? "…" : "Fight"}
        </button>
      </div>
      <p className="mt-2 h-5 text-sm text-ember/90" aria-live="polite">
        {error}
      </p>
    </form>
  );
}
