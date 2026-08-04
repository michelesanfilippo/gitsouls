"use client";

import { useId, useState, type ReactNode } from "react";

interface TooltipProps {
  /** tooltip body */
  content: ReactNode;
  children: ReactNode;
  /** which side of the trigger to anchor the panel to */
  align?: "left" | "right";
  className?: string;
}

/**
 * Hover/focus tooltip. Kept CSS-free of group-hover so it also opens on
 * keyboard focus and on tap, and is wired up with aria-describedby rather than
 * a title attribute (which screen readers announce inconsistently).
 */
export default function Tooltip({
  content,
  children,
  align = "left",
  className = "",
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={open ? id : undefined}
    >
      {children}

      {open && (
        <span
          id={id}
          role="tooltip"
          className={`animate-fade-up pointer-events-none absolute bottom-full z-30 mb-2 w-64 rounded-xl border border-gold/25 bg-void-2 p-3 text-left shadow-[0_8px_30px_rgba(0,0,0,0.6)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
