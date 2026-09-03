# 09 — Technical Debt

> The debt register, organized by theme, with a recommended paydown order at the end. Individual findings are numbered against [08_Code_Review.md](08_Code_Review.md) where applicable.

## Theme 1: Security debt (the expensive kind)

These overlap with the Critical review findings and are treated as a single "security sprint" in [12_Improvement_Plan.md](12_Improvement_Plan.md):

- Cookie-auth CSRF exposure (#1), irrevocable refresh tokens (#2), unenforced bans (#3), untriaged npm vulnerabilities (#4), NoSQL-operator injection on legacy routes (#6).
- Backend CSP still allows `'unsafe-inline'` scripts (#9); the Vercel-hosted frontend ships **no** security headers at all (#8).
- Password policy is weak: 6-char minimum, no email verification, no account lockout (#11).

## Theme 2: Test debt

- **Coverage is phase-shaped** (#14): the 392 backend tests exhaustively cover the *newest* code (courses, quizzes, classrooms, scholars, Stripe) and completely ignore the *oldest and most-used* code — auth, users, posts, feed, chat, streams, notifications. Any refactor of the social core is currently flying blind.
- **The frontend has zero tests** — no Vitest, no RTL, nothing. The only gates are `tsc --noEmit` and ESLint.
- No E2E/smoke coverage of the deployed app.
- **Critical dependency advisories: triaged, none runtime-reachable.** GitHub reports 5 critical on
  the default branch; `npm audit` against the committed lockfile shows 3 distinct critical advisories.
  The gap is unreconciled — Dependabot appears to count per-manifest across the 4 workspaces, but
  that was not verified, so **2 critical alerts remain unaccounted for** and someone with access to
  the Security tab should confirm they are duplicates before this is closed.

  | Package | Path | Scope | Reachable here? | Fix |
  |---|---|---|---|---|
  | `fast-xml-parser` 5.3.4 | `backend` → `@aws-sdk/client-ivs` → `@aws-sdk/core` → `@aws-sdk/xml-builder` | **runtime** | **No.** Every advisory needs attacker-controlled XML. The app parses none: body parsers are `express.json` + `express.urlencoded` only, and the sole XML in the backend is the *generated* sitemap (`seoMeta.js`, string-built, never parsed). This parser only ever sees AWS API responses, so exploiting it means controlling AWS's responses. | Transitive bump, non-breaking |
  | `shell-quote` 1.8.3 | `packages/mobile` → `react-native` → `react-devtools-core` | dev | No. Dev tooling for the mobile package, which CI never builds. Absent from backend and frontend runtime. | Transitive bump, non-breaking |
  | `tar` 6.2.1 | `packages/mobile` → `expo` → `@expo/cli` (and → `cacache`) | dev | No. Expo build tooling only. | **Breaking:** needs `expo` 52 → 57 (`isSemVerMajor`) |

  Nothing here is an emergency, which is why it is filed rather than fixed. Priority order when it is
  picked up: the two non-breaking transitive bumps first, then decide whether `packages/mobile` is
  alive at all — an unbuilt, CI-excluded workspace is carrying the only breaking upgrade and most of
  the alert volume. Retiring or refreshing it would close more of this register than patching it.

- **`mongodb-memory-server` startup timeout is too short for slower machines.** Six suites
  (`scholarEarnings`, `ruhaniSession`, `ruhaniPractice`, and all three `smoke/*`) fail with
  `Instance failed to start within 10000ms` — 135 occurrences in one run. It is not worker
  contention: running `--runInBand` rescued only `phase2.smoke`. It is the library's 10s default
  being too tight when the mongod binary starts cold from a synced/scanned directory.
  `MONGOMS_INSTANCE_STARTUP_TIMEOUT=60000` turns them green with no code change. **Fix:** set
  `instanceStartupTimeout` (or that env var) in `backend/jest.config.cjs` so the suite is
  reproducible off CI. Until then a local "full green" run needs that variable exported, which
  makes it easy to mistake an environmental failure for a regression.

## Theme 3: Scale debt

Nothing here hurts today at small scale; all of it detonates on the first growth spurt:

- **In-memory realtime state** (#5): presence, hand-raise queues, whiteboard throttles, rate-limit fallback — one-instance-only architecture with no Socket.IO Redis adapter.
- **Embedded social graph** (#12): follower/following arrays on the user document, plus a `getOtherUsersProfiles` that returns all users unpaginated. Needs a `Follow` collection and paginated queries *before* user counts grow.
- Redundant query patterns in hot paths (#23).

## Theme 4: Consistency debt (two generations of code)

The codebase has a visible seam between v2-era code (courses onward) and legacy code (social core):

- **Validation**: Zod on new routes; express-validator or nothing on old ones.
- **Authorization**: `ADMIN_IDS` env allowlist (live) vs `role` enum (dead) — two sources of truth (#7).
- **Sanitization**: a blanket string-mutating `sanitizeInput` middleware (#10) that predates the Zod approach and can corrupt legitimate content.
- **Error handling**: Mongoose validation/cast errors fall through as 500s because the specific handling is commented out (#19).

## Theme 5: Tooling & process debt

- **No DB migrations** (#15) — adopt migrate-mongo before the next schema change.
- **No backend lint/format tooling** — plain-JS backend style is enforced only by convention.
- **Dead CI deploy pipeline** (#16) — S3/CloudFront jobs keyed to a deleted branch, misleading anyone reading the workflow.
- **Tracker trust**: the Tick workflow has marked uncommitted work "done" (see [13_Git_History_Summary.md](13_Git_History_Summary.md)); 17 stale tasks pollute the queue.
- **No OpenAPI docs** (#27).

## Theme 6: Code-shape debt

- **10 oversized frontend pages** (#13), worst offender `ClassroomLivePage.tsx` at 71KB — unreviewable and slow to iterate on.
- Untyped `user.saved` string ids (#24); stray `console.log`s (#25); brittle `manualChunks` entry (#22); auth-UI flash from persisted `isAuthenticated` (#21).
- Accessibility near-absent (#20).

## Theme 7: Documentation & repo hygiene debt

- Root `README.md` describes the v1 app; root `ROADMAP.md` overstates completion; no LICENSE despite the MIT claim (#26, #28). *(This docs/ series is the corrective.)*
- Repo litter: untracked debug logs in `frontend/`, stale vite timestamp files, 5 dead branches, 2 v1-era stashes, a leftover registered worktree.

## Recommended paydown order

1. **Test backfill** for the untested legacy surface (auth/users/posts/feed) — this unlocks safe refactoring of everything else, which is why it outranks flashier items.
2. **Decompose the oversized pages**, starting with ClassroomLivePage.
3. **Consolidate admin authz on `role`**; delete the ADMIN_IDS duality.
4. **Env/migrations**: keep `.env.example` honest, add migrate-mongo, keep the replica-set requirement documented.
5. **Replace blanket `sanitizeInput`** with per-field Zod validation route by route.
6. **Docs refresh**: rewrite the root README for v2, mark ROADMAP.md phases honestly, add the LICENSE file.
7. **Repo cleanup**: delete dead branches/stashes/worktree, purge debug litter, retire stale Tick tasks.

(Security debt is deliberately excluded from this list — it goes first, before any of it, as its own sprint. See [12_Improvement_Plan.md](12_Improvement_Plan.md).)
