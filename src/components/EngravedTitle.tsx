import type { ElementType, ReactNode } from "react";

interface EngravedTitleProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** add the slow ember pulse (used for the hero eyebrow) */
  pulse?: boolean;
}

/**
 * Reusable engraved ember/gold title — the "BEARER OF THE CURSE" look.
 * Used for the hero eyebrow and the profile rank/class headings.
 *
 * The pulse animates a glow layer behind the text rather than the text's own
 * opacity: animating an element that uses background-clip:text makes Chrome
 * re-composite the clipped glyphs each frame, which tears as black hairlines.
 */
export default function EngravedTitle({
  as,
  children,
  className = "",
  pulse = false,
}: EngravedTitleProps) {
  const Tag = as ?? "h2";

  if (!pulse) {
    return (
      <Tag className={`engraved font-display uppercase ${className}`}>
        {children}
      </Tag>
    );
  }

  return (
    <span className="relative inline-block">
      {/* Pulsing glow behind the glyphs. text-shadow rather than a blur filter:
          a blur on an animated element is re-rasterised every frame. */}
      <span
        aria-hidden
        className={`animate-ember pointer-events-none absolute inset-0 font-display uppercase text-transparent ${className}`}
        style={{ textShadow: "0 0 18px rgba(220,38,38,0.55)" }}
      >
        {children}
      </span>
      <Tag className={`engraved relative font-display uppercase ${className}`}>
        {children}
      </Tag>
    </span>
  );
}
