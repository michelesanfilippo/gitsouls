export const DEVICON_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/";

/** GitHub language name (lowercased) → devicon icon path. */
export const DEVICON: Record<string, string> = {
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

/** Full devicon URL for a language, or null when we have no icon for it. */
export function deviconUrl(language: string): string | null {
  const file = DEVICON[language.toLowerCase()];
  return file ? `${DEVICON_BASE}${file}` : null;
}
