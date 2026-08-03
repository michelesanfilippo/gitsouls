"use client";

import Image from "next/image";
import { useCallback } from "react";

const KEY = "gitsouls:sword-cursor";

/** Enable the sword cursor for the rest of the tab session. */
export function enableSwordCursor() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* ignore storage errors */
  }
  document.documentElement.classList.add("sword-cursor");
}

/**
 * Decorative floating sword. Clicking it turns the pointer into the sword
 * for the whole tab (persisted in sessionStorage across navigation).
 */
export default function SwordCursor() {
  const onClick = useCallback(() => enableSwordCursor(), []);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Wield the sword cursor"
      className="animate-sword cursor-pointer select-none bg-transparent transition-transform hover:scale-110"
      style={{ filter: "drop-shadow(0 8px 20px rgba(220,38,38,0.35))" }}
    >
      <Image
        src="/img/sword.png"
        alt="Souls sword"
        width={300}
        height={300}
        className="h-auto w-40 sm:w-52"
        priority
      />
    </button>
  );
}
