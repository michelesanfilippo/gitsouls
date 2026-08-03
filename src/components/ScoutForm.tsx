"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/** Extract a bare username from raw input (handles @user and github URLs). */
function parseUsername(raw: string): string {
  let v = raw.trim();
  const urlMatch = v.match(/github\.com\/([^/?#]+)/i);
  if (urlMatch) v = urlMatch[1];
  return v.replace(/^@/, "").trim();
}

const VALID = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

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
    if (!VALID.test(username)) {
      setError("That is no valid GitHub name.");
      return;
    }
    scout(username);
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={onSubmit}>
        <div className="flex items-stretch gap-2">
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
            className="souls-focus flex-1 rounded-2xl border border-gold/25 bg-black/30 px-5 py-3 font-serif text-parchment backdrop-blur placeholder:text-muted/70"
          />
          <button
            type="submit"
            disabled={pending}
            className="souls-focus flex cursor-pointer items-center gap-2 rounded-2xl border border-ember/60 bg-ember/10 px-6 py-3 font-display font-semibold uppercase tracking-widest text-ember transition-colors hover:bg-ember/20 disabled:opacity-60"
          >
            {pending ? "…" : "Scout"}
            {!pending && (
              <svg
                width="18"
                height="18"
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
        <p
          className="mt-2 h-5 text-center text-sm text-ember/90"
          aria-live="polite"
        >
          {error}
        </p>
      </form>

      <p className="mt-3 text-center text-sm text-muted">
        try{" "}
        <button
          type="button"
          onClick={() => scout("michelesanfilippo")}
          className="cursor-pointer text-gold/80 underline underline-offset-4 transition-colors hover:text-gold"
        >
          michelesanfilippo
        </button>{" "}
        ·{" "}
        <button
          type="button"
          onClick={() => scout("torvalds")}
          className="cursor-pointer text-gold/80 underline underline-offset-4 transition-colors hover:text-gold"
        >
          torvalds
        </button>{" "}
        · or your own
      </p>
    </div>
  );
}
