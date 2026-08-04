/**
 * Shared weapon-cursor store. One active weapon at a time; stored in
 * sessionStorage so it survives client-side navigation within the tab.
 */

export type Weapon = "sword" | "bow" | "wand";

const STORAGE_KEY = "gitsouls:cursor";
const CLASS: Record<Weapon, string> = {
  sword: "sword-cursor",
  bow:   "bow-cursor",
  wand:  "wand-cursor",
};

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getActive(): Weapon | null {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    return (v as Weapon | null);
  } catch {
    return null;
  }
}

/** Equip a weapon: remove any previous cursor class, apply the new one. */
export function equip(w: Weapon): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, w);
  } catch { /* ignore */ }
  const cl = document.documentElement.classList;
  for (const c of Object.values(CLASS)) cl.remove(c);
  cl.add(CLASS[w]);
  emit();
}

/** Unequip all weapons, restore the default pointer. */
export function unequip(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
  const cl = document.documentElement.classList;
  for (const c of Object.values(CLASS)) cl.remove(c);
  emit();
}

/** Re-apply whatever was stored — called on mount after navigation. */
export function restoreFromStorage(): void {
  const w = getActive();
  if (!w) return;
  const cl = document.documentElement.classList;
  for (const c of Object.values(CLASS)) cl.remove(c);
  cl.add(CLASS[w]);
}
