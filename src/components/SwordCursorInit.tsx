"use client";

import { useEffect } from "react";

/**
 * Re-applies the sword cursor on every page load / navigation within the
 * tab, so the choice persists until the tab is closed. Rendered once in the
 * root layout.
 */
export default function SwordCursorInit() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("gitsouls:sword-cursor") === "1") {
        document.documentElement.classList.add("sword-cursor");
      }
    } catch {
      /* ignore storage errors */
    }
  }, []);
  return null;
}
