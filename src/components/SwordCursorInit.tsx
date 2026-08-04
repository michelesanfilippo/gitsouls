"use client";

import { useEffect } from "react";
import { restoreFromStorage } from "@/lib/cursor";

/**
 * Re-applies the active weapon cursor on every page load / navigation within
 * the tab, so the choice persists until the tab is closed. Rendered once in
 * the root layout.
 */
export default function SwordCursorInit() {
  useEffect(() => {
    restoreFromStorage();
  }, []);
  return null;
}
