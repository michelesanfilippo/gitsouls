"use client";

import Image from "next/image";
import { useCallback, useEffect, useSyncExternalStore } from "react";

const KEY = "gitsouls:sword-cursor";

/**
 * The blade's state lives in sessionStorage, not React state, because it is
 * shared with SwordCursorInit and must survive navigation. Exposed as an
 * external store so components can read it without a setState-in-effect and
 * without risking a hydration mismatch (the server snapshot is always false).
 */
const listeners = new Set<() => void>();

function readWielded(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function emit() {
  for (const l of listeners) l();
}

/** Enable the sword cursor for the rest of the tab session. */
export function enableSwordCursor() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* ignore storage errors */
  }
  document.documentElement.classList.add("sword-cursor");
  emit();
}

/** Sheathe the blade: restore the normal pointer for the rest of the session. */
export function disableSwordCursor() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore storage errors */
  }
  document.documentElement.classList.remove("sword-cursor");
  emit();
}

/**
 * Decorative floating sword. Clicking it takes the blade in hand — the pointer
 * becomes the sword (persisted for the tab) and the resting sword fades away.
 * Right-clicking anywhere returns it to its pedestal and restores the cursor.
 */
export default function SwordCursor() {
  const wielded = useSyncExternalStore(subscribe, readWielded, () => false);

  const take = useCallback(() => enableSwordCursor(), []);

  // While wielded, right-click anywhere sheathes it instead of opening the menu.
  useEffect(() => {
    if (!wielded) return;
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      disableSwordCursor();
    };
    document.addEventListener("contextmenu", onContextMenu);
    return () => document.removeEventListener("contextmenu", onContextMenu);
  }, [wielded]);

  return (
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={take}
        aria-label="Take the sword in hand"
        aria-pressed={wielded}
        // No drop-shadow filter: a blur on a transform-animated element is
        // re-rasterised every frame, which is what tore as black hairlines.
        className={`animate-sword group relative cursor-pointer select-none bg-transparent transition-all duration-500 hover:scale-110 ${
          wielded ? "pointer-events-none scale-90 opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src="/img/sword.png"
          alt="Souls sword"
          width={300}
          height={300}
          className="h-auto w-28 sm:w-36"
          priority
        />

        {/* Hover invitation */}
        <span className="pointer-events-none absolute left-1/2 top-full w-56 -translate-x-1/2 pt-3 text-center font-display text-xs uppercase tracking-[0.2em] text-gold/0 transition-colors duration-300 group-hover:text-gold/90">
          Take up the blade
          <span className="mt-1 block font-serif text-[11px] normal-case italic tracking-normal text-parchment/0 transition-colors duration-300 group-hover:text-parchment/60">
            Only the cursed may wield it
          </span>
        </span>
      </button>

      {/* Shown once the blade is in hand — the only way back is a right-click. */}
      {wielded && (
        <p className="animate-fade-up absolute top-1/2 w-60 -translate-y-1/2 text-center font-serif text-sm italic text-parchment/45">
          The blade is yours.
          <span className="mt-1 block font-display text-[10px] uppercase not-italic tracking-[0.2em] text-gold/50">
            Right-click to sheathe
          </span>
        </p>
      )}
    </div>
  );
}
