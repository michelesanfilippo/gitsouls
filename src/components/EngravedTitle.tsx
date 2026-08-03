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
 */
export default function EngravedTitle({
  as,
  children,
  className = "",
  pulse = false,
}: EngravedTitleProps) {
  const Tag = as ?? "h2";
  return (
    <Tag
      className={`engraved font-display uppercase ${
        pulse ? "animate-ember" : ""
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
