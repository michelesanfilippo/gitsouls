"use client";

import { useState } from "react";
import { deviconUrl } from "@/lib/devicon";

/** The most-used language rendered as its icon, with a graceful text fallback. */
export default function LanguageIcon({
  language,
  color,
}: {
  language: string;
  color: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = deviconUrl(language);

  if (!url || failed) {
    return (
      <span
        title={language}
        className="flex h-12 w-12 items-center justify-center rounded-full border font-display text-sm font-bold"
        style={{ borderColor: color, color }}
      >
        {language.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={`${language} — most used language`}
      title={language}
      width={48}
      height={48}
      onError={() => setFailed(true)}
      className="h-12 w-12 object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]"
    />
  );
}
