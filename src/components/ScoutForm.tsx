"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { parseUsername, VALID_USERNAME } from "@/lib/username";

/** Landing search: type a username, press Scout, open its boss profile. */
export default function ScoutForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function scout(username: string) {
    setError(null);
    startTransition(() => {
      router.push(`/${username}`);
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const username = parseUsername(value);
    if (!username) {
      setError("Speak a name into the fog.");
      return;
    }
    if (!VALID_USERNAME.test(username)) {
      setError("That is no valid GitHub name.");
      return;
    }
    scout(username);
  }

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={onSubmit}>
        <div className="flex items-stretch gap-2.5">
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder="github username"
            aria-label="GitHub username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="souls-focus min-w-0 flex-1 rounded-2xl border border-gold/25 bg-black/55 px-6 py-4 font-serif text-lg text-parchment placeholder:text-muted/70"
          />
          <button
            type="submit"
            disabled={pending}
            className="souls-focus flex shrink-0 cursor-pointer items-center gap-2.5 rounded-2xl border border-ember bg-ember px-8 py-4 font-display text-lg font-semibold uppercase tracking-widest text-parchment shadow-[0_0_24px_rgba(220,38,38,0.35)] transition-colors hover:border-parchment hover:bg-parchment hover:text-ember disabled:opacity-60"
          >
            {pending ? "…" : "Summon"}
            {!pending && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="12" x2="19" y2="12" />
                <polyline points="13 6 19 12 13 18" />
              </svg>
            )}
          </button>
        </div>

        <p className="mt-3 text-left text-base text-muted">
          try{" "}
          <button
            type="button"
            onClick={() => scout("michelesanfilippo")}
            className="cursor-pointer text-gold/80 underline underline-offset-4 transition-colors hover:text-gold"
          >
            michelesanfilippo
          </button>{" "}
          or your own
        </p>

        <p className="mt-1 h-5 text-left text-sm text-ember/90" aria-live="polite">
          {error}
        </p>
      </form>
    </div>
  );
}
