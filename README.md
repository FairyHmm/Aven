# Aven

Working-space app: spaces, boards, columns and markdown cards, shared by the people in a space (owners, editors and viewers). A new account starts with a short guide board.

## Layout

- `src/` — SPA (React + Vite + TypeScript) → Firebase Hosting
  - `app/`, `routes/` — wiring only
  - `features/<name>/` — `components/`, `hooks/` (public API), `stores/` (internal Zustand); features: `auth`, `space`, `board`, `editor`, `welcome`
  - `shared/` — code used by more than one feature (`components/`, `hooks/`, `lib/`)
- `worker/` — Cloudflare Worker issuing short-lived TURN credentials (unused while calls are out of scope)
- `common/` — types shared between `src/` and `worker/`
- Firebase config at the root: `firebase.json`, `firestore.rules`, `storage.rules`, `database.rules.json`
- Documentation: `../../Docs/` (`Handoff.md` first, then `notes/`; the original specs are in `spec/`)

## Running it

`pnpm dev` runs in **local mode** by default: data and accounts stay in the browser, nothing to set up (or use "Try without an account").
For real accounts set `VITE_STORAGE_BACKEND=firebase` (and the `VITE_FIREBASE_*` values in `.env`). For Firebase without the cloud, run `pnpm emulators` and start the dev server with `VITE_USE_EMULATORS=true NODE_ENV=development`.

## Scripts

`pnpm dev` · `pnpm check` (typecheck + lint + format check + tests; run before pushing) · `pnpm test` · `pnpm typecheck` · `pnpm lint` · `pnpm format` · `pnpm emulators` · `pnpm worker:dev`
