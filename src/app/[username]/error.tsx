"use client";

import Link from "next/link";

/** Fallback boundary for unexpected failures while forging a boss. */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-sm uppercase tracking-[0.35em] text-ember">
        The flame guttered
      </p>
      <h1 className="mt-4 font-display text-3xl text-parchment">
        The summoning failed
      </h1>
      <p className="mt-3 max-w-md text-parchment/70">
        Something went wrong forging this boss. Try again in a moment.
      </p>
      <div className="mt-6 flex items-center gap-4 text-sm">
        <button
          onClick={() => reset()}
          className="souls-focus rounded-sm border border-ember/60 px-4 py-2 text-ember transition-colors hover:bg-ember/10"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-muted underline-offset-4 hover:text-gold hover:underline"
        >
          Return to the fog
        </Link>
      </div>
    </div>
  );
}
