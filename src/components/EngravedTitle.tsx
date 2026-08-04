import type { ElementType, ReactNode } from "react";

interface EngravedTitleProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** slowly wash a light down the engraving */
  lit?: boolean;
}

/**
 * Reusable engraved ember/gold title — the "BEARER OF THE CURSE" look.
 * Used for the hero eyebrow and the profile rank/class headings.
 *
 * `lit` washes a slow light down the letters. It animates background-position,
 * which only repaints this element — do not reach for a filter or an overlaid
 * animated layer instead, as either forces the clipped glyphs to re-composite
 * every frame.
 */
export default function EngravedTitle({
  as,
  children,
  className = "",
  lit = false,
}: EngravedTitleProps) {
  const Tag = as ?? "h2";

  return (
    <Tag
      className={`engraved ${
        lit ? "engraved-lit" : ""
      } font-display uppercase ${className}`}
    >
      {children}
    </Tag>
  );
}
