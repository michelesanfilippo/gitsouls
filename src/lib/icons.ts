/**
 * Names of the line icons the UI can draw. Kept here, in lib, so pure modules
 * (e.g. scoring/skills) can label themselves without importing a component —
 * the drawing lives in components/Icon.tsx.
 */
export type IconName =
  | "flame"
  | "scroll"
  | "languages"
  | "swords"
  | "pulse"
  | "moon"
  | "candle"
  | "star"
  | "orbit"
  | "hourglass"
  | "crown"
  | "sun"
  | "image"
  | "link";
