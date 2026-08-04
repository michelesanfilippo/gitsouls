import type { ReactNode } from "react";
import type { IconName } from "@/lib/icons";

/**
 * Hand-rolled line icons, replacing the emoji the UI used to show.
 *
 * Written out rather than pulled from an icon package for two reasons: the
 * project deliberately carries no runtime dependencies beyond Next and React,
 * and emoji render in their own fixed colours and per-platform styles, which
 * clashed with the Souls palette. These inherit `currentColor`, so a skill icon
 * takes the gold of its box and a fallen fighter's icons desaturate with them.
 *
 * All paths are drawn on a 24x24 grid with a 1.7 stroke to match GitHubLogo's
 * weight at the sizes used.
 */
const PATHS: Record<IconName, ReactNode> = {
  // Kindling Spark — a flame
  flame: (
    <>
      <path d="M12 3c2.5 3.2 5 5.4 5 8.6a5 5 0 0 1-10 0C7 8.4 9.5 6.2 12 3Z" />
      <path d="M12 17.5c-1.2-1.3-2-2.3-2-3.6 0-1.3 1-2.2 2-3.4 1 1.2 2 2.1 2 3.4 0 1.3-.8 2.3-2 3.6Z" />
    </>
  ),
  // Language Adept — a scroll
  scroll: (
    <>
      <path d="M6 4h10a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V4Z" />
      <path d="M6 4a2 2 0 0 0-2 2v1h2M9 9h6M9 13h6" />
    </>
  ),
  // Polyglot Ascendant — speech
  languages: (
    <>
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h7A2.5 2.5 0 0 1 15 6.5v3A2.5 2.5 0 0 1 12.5 12H8l-3 2.5V12a2 2 0 0 1-2-2V6.5Z" />
      <path d="M17 8.5h1.5A2.5 2.5 0 0 1 21 11v3a2.5 2.5 0 0 1-2.5 2.5H18v2.5L15 16.5h-2" />
    </>
  ),
  // Relentless Onslaught — crossed blades
  swords: (
    <>
      <path d="M4 4h3l9 9-2 2-9-9V4ZM20 4h-3l-4 4 2.5 2.5L20 7V4Z" />
      <path d="M5 20l4-4M19 20l-4-4M3.5 18.5l2 2M20.5 18.5l-2 2" />
    </>
  ),
  // Undying Vigor — a heartbeat
  pulse: <path d="M3 12h3.5l2-5 3 10 2.5-7 1.5 2H21" />,
  // Eternal Watch — a crescent moon
  moon: <path d="M20 14.5A8.5 8.5 0 1 1 10.5 4a6.8 6.8 0 0 0 9.5 10.5Z" />,
  // Beacon of the Commons — a lit candle
  candle: (
    <>
      <path d="M12 3.5c1.4 1.6 2 2.5 2 3.6a2 2 0 0 1-4 0c0-1.1.6-2 2-3.6Z" />
      <path d="M9 11h6v9H9zM7 20h10" />
    </>
  ),
  // Starforged — a star
  star: (
    <path d="M12 3.5l2.6 5.6 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6L3.4 9.8l6-.7L12 3.5Z" />
  ),
  // Gravity of Legend — a ringed planet
  orbit: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M4.2 14.6c-1.4-.9-2.2-2-2.2-3 0-2 3.4-3.4 8-3.4M19.8 9.4c1.4.9 2.2 2 2.2 3 0 2-3.4 3.4-8 3.4" />
    </>
  ),
  // Ancient One — an hourglass
  hourglass: (
    <>
      <path d="M7 3h10M7 21h10" />
      <path d="M7 3c0 4 5 6 5 9s-5 5-5 9M17 3c0 4-5 6-5 9s5 5 5 9" />
    </>
  ),
  // Legion Commander — a crown
  crown: (
    <>
      <path d="M3 8l3.5 3L12 5l5.5 6L21 8l-1.5 10h-15L3 8Z" />
      <path d="M4.5 18h15" />
    </>
  ),
  // Ember of Cinder — a sun
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
    </>
  ),
  // Download card — a framed picture
  image: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M3 15.5l4.5-4 3.5 3 3-3.5L21 16" />
      <circle cx="8.5" cy="9" r="1.2" />
    </>
  ),
  // Copy link — a chain
  link: (
    <>
      <path d="M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1" />
      <path d="M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" />
    </>
  ),
  // Support the builder — a steaming cup
  coffee: (
    <>
      <path d="M3.5 9h13v5.5a4.5 4.5 0 0 1-4.5 4.5H8a4.5 4.5 0 0 1-4.5-4.5V9Z" />
      <path d="M16.5 10.5H19a2.25 2.25 0 0 1 0 4.5h-2.5" />
      <path d="M7.5 2.8c-.9 1-.9 2 0 3M12 2.5c-.9 1-.9 2 0 3" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  className?: string;
  /** set when the icon is the only label, so it needs a name */
  label?: string;
}

export default function Icon({ name, className = "h-4 w-4", label }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {PATHS[name]}
    </svg>
  );
}
