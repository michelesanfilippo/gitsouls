"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** accessible name for the dialog, also shown as the header title */
  label: string;
  children: ReactNode;
  /** tailwind max-width class for the panel */
  maxWidth?: string;
}

/**
 * Shared Souls-styled dialog. Rendered through a portal on document.body so the
 * fixed overlay always resolves against the viewport — a transformed ancestor
 * (e.g. the fade-up profile container) would otherwise become its containing
 * block and clip the backdrop. Closes on Escape and on backdrop click.
 *
 * The panel is capped at the viewport height and scrolls its own body, with the
 * close button pinned in a sticky header. Previously the panel grew as tall as
 * its content and the close button was absolutely positioned inside it, so on
 * long content it ended up off-screen and the dialog could only be dismissed by
 * zooming out.
 */
export default function Modal({
  open,
  onClose,
  label,
  children,
  maxWidth = "max-w-2xl",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  // `open` only ever becomes true from a user interaction, so this never runs
  // during SSR; the document check is a cheap belt-and-braces guard.
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      {/* Scrim as its own layer, so the panel is a flex child that can be
          height-capped rather than growing the scrolling container. */}
      <div className="absolute inset-0 bg-black/85" />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={`animate-fade-up relative flex max-h-full w-full ${maxWidth} flex-col overflow-hidden rounded-lg border border-gold/30 bg-void-2 shadow-[0_0_60px_rgba(220,38,38,0.15)] outline-none`}
      >
        {/* Header stays put while the body scrolls, so Close is always reachable */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gold/15 px-6 py-4">
          <h2 className="font-display text-lg font-semibold tracking-wide text-gold sm:text-xl">
            {label}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="souls-focus -mr-2 shrink-0 cursor-pointer rounded-sm px-2 py-1 text-lg text-muted transition-colors hover:text-gold"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
