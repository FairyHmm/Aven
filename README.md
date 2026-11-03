# Aven

Working-space app: spaces, boards, columns and markdown cards, with chat and calls.

## Layout

- `src/` — SPA (React + Vite + TypeScript) → Firebase Hosting
  - `app/`, `routes/` — wiring only
  - `features/<name>/` — `components/`, `hooks/` (public API), `stores/` (internal Zustand)
  - `shared/` — code used by more than one feature (`components/`, `hooks/`, `lib/`)
- `worker/` — Cloudflare Worker issuing short-lived TURN credentials
- `common/` — types shared between `src/` and `worker/`
- Firebase config at the root: `firebase.json`, `firestore.rules`, `database.rules.json`

## Scripts

`pnpm dev` · `pnpm check` (typecheck + lint + format check + tests; run before pushing) · `pnpm test` · `pnpm typecheck` · `pnpm lint` · `pnpm format` · `pnpm emulators` · `pnpm worker:dev`
