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
    setError(null);
    startTransition(() => {
      router.push(`/${username}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
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
          className="souls-focus flex-1 rounded-sm border border-gold/25 bg-black/30 px-4 py-3 font-serif text-parchment placeholder:text-muted/70"
        />
        <button
          type="submit"
          disabled={pending}
          className="souls-focus rounded-sm border border-ember/60 bg-ember/10 px-6 py-3 font-display font-semibold uppercase tracking-widest text-ember transition-colors hover:bg-ember/20 disabled:opacity-60"
        >
          {pending ? "…" : "Scout"}
        </button>
      </div>
      <p className="mt-2 h-5 text-center text-sm text-ember/90" aria-live="polite">
        {error}
      </p>
    </form>
  );
}
