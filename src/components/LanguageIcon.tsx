"use client";

import { useState } from "react";

const DEVICON_BASE =
  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/";

/** GitHub language name → devicon icon path. */
const DEVICON: Record<string, string> = {
  javascript: "javascript/javascript-original.svg",
  typescript: "typescript/typescript-original.svg",
  python: "python/python-original.svg",
  java: "java/java-original.svg",
  kotlin: "kotlin/kotlin-original.svg",
  swift: "swift/swift-original.svg",
  c: "c/c-original.svg",
  "c++": "cplusplus/cplusplus-original.svg",
  "c#": "csharp/csharp-original.svg",
  go: "go/go-original-logo.svg",
  rust: "rust/rust-original.svg",
  ruby: "ruby/ruby-original.svg",
  php: "php/php-original.svg",
  html: "html5/html5-original.svg",
  css: "css3/css3-original.svg",
  scss: "sass/sass-original.svg",
  shell: "bash/bash-original.svg",
  dart: "dart/dart-original.svg",
  scala: "scala/scala-original.svg",
  elixir: "elixir/elixir-original.svg",
  haskell: "haskell/haskell-original.svg",
  lua: "lua/lua-original.svg",
  r: "r/r-original.svg",
  perl: "perl/perl-original.svg",
  vue: "vuejs/vuejs-original.svg",
  clojure: "clojure/clojure-original.svg",
  erlang: "erlang/erlang-original.svg",
  ocaml: "ocaml/ocaml-original.svg",
  solidity: "solidity/solidity-original.svg",
  powershell: "powershell/powershell-original.svg",
  "objective-c": "objectivec/objectivec-plain.svg",
  "jupyter notebook": "jupyter/jupyter-original.svg",
};

/** The most-used language rendered as its icon, with a graceful text fallback. */
export default function LanguageIcon({
  language,
  color,
}: {
  language: string;
  color: string;
}) {
  const [failed, setFailed] = useState(false);
  const file = DEVICON[language.toLowerCase()];

  if (!file || failed) {
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
      src={`${DEVICON_BASE}${file}`}
      alt={`${language} — most used language`}
      title={language}
      width={48}
      height={48}
      onError={() => setFailed(true)}
      className="h-12 w-12 object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]"
    />
  );
}
