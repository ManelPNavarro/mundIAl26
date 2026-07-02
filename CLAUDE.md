# mundIAl26

Nuxt 3 + Supabase app for a World Cup 2026 prediction pool ("porra"). Nuxt UI v3 for components, Postgres (via Supabase) for data.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npx nuxt typecheck` — type-check the whole project

## Worktrees: always run `npm install` after creating one

New worktrees do **not** reliably inherit a working `node_modules`. Node resolves missing local packages by walking up to whatever `node_modules` exists in an ancestor directory — which for a worktree under `.claude/worktrees/` is the main checkout's `node_modules`. That only works by coincidence: it breaks as soon as a worktree's branch depends on a package the main checkout's currently-checked-out branch doesn't have (since the main checkout's `node_modules` reflects *its own* branch, not yours).

Symptom: Vite errors like `Failed to resolve import "some-package"` even though it's listed in `package.json`.

Fix: run `npm install` inside the worktree itself right after creating it (or as soon as you hit this error). This gives the worktree its own complete `node_modules` matching its own `package.json`/`package-lock.json`, independent of whatever the main checkout is on.
