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

Environment (optional)
Create a .env.local only if you want live scouting or the counter:
```
npm run lint      # eslint            (CI runs this)
npm run build     # types + prod build (CI runs this)
npm test          # vitest unit tests (in tests/)
```

Tests live in tests/ (vitest). Please add or adjust tests for scoring, parsing, or any pure logic you touch.
Types are strict — the build fails on type errors.

## Conventions
Commits: Conventional Commits — e.g. feat(xyz): …, fix(xyz): …, docs: ….
Branches: branch off master, open your PR against master.
Style: match the surrounding code; comments explain the why, not the what. eslint settles formatting.
Keep PRs focused. For anything visual, a before/after screenshot is gold.
Ideas & bugs
Open an issue (there are templates).

Found a security issue? Please don't open a public issue — see SECURITY.md.

## Licensing
By contributing, you agree that your contributions are licensed under the project's LICENSE.