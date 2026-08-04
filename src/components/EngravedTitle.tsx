import type { ElementType, ReactNode } from "react";

interface EngravedTitleProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
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
}: EngravedTitleProps) {
  const Tag = as ?? "h2";

  // The pulse is intentionally not an animation. Stacking an animated layer over
  // text that uses background-clip:text made Chrome re-composite the clipped
  // glyphs every frame, which tore as black hairlines on the landing page.
  return (
    <Tag className={`engraved font-display uppercase ${className}`}>
      {children}
    </Tag>
  );
}
