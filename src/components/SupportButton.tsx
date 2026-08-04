import Icon from "./Icon";
import { SUPPORT_URL } from "@/lib/links";

/**
 * "Support the builder" link.
 * On mobile: gold coffee icon in a round button (no text, no border box).
 * On sm+: full pill with label, matching the TopBar Star on GitHub style.
 */
export default function SupportButton() {
  return (
    <a
      href={SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Support the builder"
      className="souls-focus flex cursor-pointer items-center justify-center transition-colors"
    >
      {/* Mobile: round icon only */}
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-void-2/80 hover:border-gold sm:hidden">
        <Icon name="coffee" className="h-5 w-5 text-gold" />
      </span>

      {/* sm+: pill with label */}
      <span className="hidden items-center gap-2 rounded-lg border border-gold/40 bg-void-2/80 px-4 py-2 font-display text-sm text-parchment/85 hover:border-gold hover:text-gold sm:flex">
        <Icon name="coffee" className="h-5 w-5 text-gold" />
        Support the builder
      </span>
    </a>
  );
}
