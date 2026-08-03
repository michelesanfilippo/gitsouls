import { AUTHOR_HANDLE, AUTHOR_URL } from "@/lib/links";

/** Small centered attribution shown at the bottom of every page. */
export default function Footer() {
  return (
    <footer className="w-full py-6 text-center text-sm text-muted">
      <span>Built by </span>
      <a
        href={AUTHOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gold/80 underline-offset-4 transition-colors hover:text-gold hover:underline"
      >
        {AUTHOR_HANDLE}
      </a>
    </footer>
  );
}
