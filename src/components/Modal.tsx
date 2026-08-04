"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** accessible name for the dialog */
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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={`animate-fade-up relative my-8 w-full ${maxWidth} rounded-lg border border-gold/30 bg-void-2/95 p-6 shadow-[0_0_60px_rgba(220,38,38,0.15)] outline-none sm:p-8`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="souls-focus absolute right-4 top-4 cursor-pointer rounded-sm px-2 py-1 text-lg text-muted transition-colors hover:text-gold"
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
