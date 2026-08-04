# Contributing to GitSouls
Thanks for wanting to help: bug fixes are welcome.

## Getting started
GitSouls is a Next.js (App Router) app in TypeScript.

```
git clone https://github.com/michelesanfilippo/gitsouls.git
cd gitsouls
npm install
npm run dev          # http://localhost:3000
```

### Environment (all optional)
Copy `.env.example` to `.env.local`. Everything degrades gracefully when unset:

| Variable | Effect when missing |
|---|---|
| `GITHUB_TOKEN` | Contribution stats (VIT, END, streak) read 0 and profiles score low. A classic token with **no scopes** is enough. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | The "souls summoned" counter is hidden. Nothing else is affected. |

### Checks
```
npm run lint      # eslint
npm run build     # types + prod build
npm test          # vitest unit tests (in tests/)
```

Tests live in tests/ (vitest, node environment — `tests/**/*.test.ts`). They cover
the pure logic in `src/lib/`: scoring, metrics, lore and duel resolution. Please
add or adjust tests for any pure logic you touch. Types are strict — the build
fails on type errors.

There is no CI yet, so please run all three locally before opening a PR.

## Conventions
Commits: Conventional Commits — e.g. feat(xyz): …, fix(xyz): …, docs: ….
Branches: branch off `main`, open your PR against `main`.
Style: match the surrounding code; comments explain the why, not the what. eslint settles formatting.
Keep PRs focused. For anything visual, a before/after screenshot is gold.

### A note on animation
Several past bugs came from the atmospheric backdrop, so it is deliberately
constrained: no `blur()`, `backdrop-filter` or `mix-blend-mode` anywhere, and the
page-sized layers never animate. Please keep it that way, and test any new motion
on a laptop with hybrid graphics before assuming it is free.

### Ideas & bugs
Open an issue.

Found a security issue? Please don't open a public issue — see SECURITY.md.

## Licensing
By contributing, you agree that your contributions are licensed under the project's LICENSE.