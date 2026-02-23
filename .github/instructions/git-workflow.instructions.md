---
description: "Use when pushing code, committing changes, creating branches, opening PRs, or working alongside other agents. Covers commit conventions, branching strategy, and conflict avoidance for multi-agent workflows."
---

# Git Workflow & Multi-Agent Collaboration

> **This instruction applies to every agent working on DeenVerse** — GitHub Copilot, Antigravity, or any automated tool pushing code. Read it in full before making any commits.

---

## TL;DR for Agents

1. **Never push directly to `main` or `dev`.**
2. **One agent → one branch, scoped to one task.**
3. **Pull/rebase from `dev` before starting every session.**
4. **Commit small, commit often, with conventional commit messages.**
5. **Touch only the files your task requires. Never refactor unrelated code.**

---

## Branching Strategy

All agents use the same branch hierarchy:

```
main          ← production-ready, protected, never commit directly
  └── dev     ← integration branch, all agent branches merge here first
        ├── agent/<agent-id>/<short-task>      ← active agent work
        └── hotfix/<issue>                     ← urgent prod fixes only
```

### Branch Naming Convention

```
agent/<agent-id>/<kebab-case-task>

Examples:
  agent/copilot-1/add-hadith-feed-ui
  agent/copilot-2/fix-auth-refresh-race
  agent/antigravity/post-notifications-backend
  agent/copilot-1/quran-reader-page
```

**Rules:**
- `<agent-id>` identifies the agent uniquely (e.g., `copilot-1`, `copilot-2`, `antigravity`).
- `<short-task>` must be **specific** — never name a branch `fixes` or `updates`.
- One branch = one atomic task. Do not bundle multiple features into one branch.

---

## The Golden Rule: File Ownership Per Session

Before starting, **claim your files**. The fastest way to cause merge conflicts is two agents touching the same file with different goals.

### How to claim files

Before writing any code, check what other agents are touching:

```bash
# See all active agent branches
git branch -r | grep "agent/"

# Check which files a specific agent branch has changed
git diff --name-only dev..origin/agent/copilot-2/feature-name
```

**If a file you need is already modified on another agent's active branch:**
- Stop. Do not duplicate the change.
- Coordinate: wait for their branch to merge into `dev`, then rebase your branch.
- If urgent, flag it to the human owner to resolve the overlap.

### High-conflict files to be extra careful with

These files are touched often — treat changes to them as critical:

| File | Why it's high-risk |
|---|---|
| `frontend/src/App.tsx` | Route registrations — every feature adds a route here |
| `frontend/src/globals.css` | Design tokens — color/spacing changes affect all components |
| `frontend/src/stores/authStore.ts` | Auth state — one wrong change breaks login everywhere |
| `backend/index.js` | Middleware order and route registration |
| `packages/shared/src/schemas/` | Shared schemas used by both frontend and backend |
| `package.json` (root, frontend, backend) | Dependency conflicts are painful to untangle |

**Advice**: If your task requires touching a high-conflict file, make that change in its own commit, isolated from other changes, so it's easy to cherry-pick or rebase.

---

## Session Start Checklist (run before writing any code)

```bash
# 1. Fetch latest remote state (never skip this)
git fetch origin

# 2. Rebase your branch on top of the latest dev — do NOT merge dev into your branch
git rebase origin/dev

# 3. Resolve any conflicts now, before making new changes
# (If conflicts are complex, ask the human owner before proceeding)

# 4. Verify you're on the right branch
git branch --show-current
```

**Why rebase, not merge?**
- Merge creates a noisy "Merge branch 'dev' into agent/..." commit that pollutes history.
- Rebase keeps your commits on top of the latest `dev`, making the eventual merge clean and linear.

---

## Commit Message Convention

All commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short imperative description>

[optional body — explain WHY, not WHAT]

[optional footer — BREAKING CHANGE: or Closes #issue]
```

### Allowed types

| Type | When to use |
|---|---|
| `feat` | Adding new functionality |
| `fix` | Correcting a bug |
| `refactor` | Code restructuring without behaviour change |
| `style` | Formatting, whitespace, CSS tweaks — no logic change |
| `perf` | Performance improvement |
| `chore` | Tooling, config, dependency update — no production code |
| `docs` | Documentation only |
| `test` | Adding or fixing tests |
| `revert` | Reverting a previous commit |

### Scope = the feature area changed

Use the feature folder name, route name, or system name as scope:

```
feat(hadith-feed): add infinite scroll to feed
fix(auth): resolve refresh token race condition on concurrent requests
chore(deps): upgrade tanstack-query to v5.20
refactor(post-service): extract attachment upload into helper
style(globals): adjust primary color shade to match design brief
```

### Size rule — one commit = one logical change

**Good commit granularity:**
```
feat(quran-reader): add verse highlight on tap
feat(quran-reader): persist last-read position with zustand
fix(quran-reader): correct surah number off-by-one error
```

**Bad (do not do this):**
```
feat: lots of quran stuff and also fixed some bugs and updated deps
```

---

## Push & PR Rules

### Before pushing

```bash
# Run the linter — zero warnings policy
cd frontend && npm run lint

# Check TypeScript is clean — do not push type errors
npx tsc --noEmit

# Ensure the dev server starts without errors
npm run dev:web   # separate terminal, check no crash
npm run dev:backend
```

### Opening a PR

- PRs always target `dev`, never `main`.
- PR title must mirror the conventional commit format: `feat(scope): description`.
- PR description must include:
  - What changed and why.
  - Which files were intentionally modified.
  - Any migration steps if schema/APIs changed.
  - Screenshots for UI changes.
- Keep PRs small — aim for **under 400 lines changed**. Large PRs block other agents longer.

### After merge

```bash
# Delete your branch immediately after merge — do not leave stale branches
git push origin --delete agent/<agent-id>/<task>
git branch -d agent/<agent-id>/<task>
```

---

## Conflict Resolution Protocol

When you encounter a merge/rebase conflict:

1. **Understand both sides first** — read the incoming and current change fully before resolving.
2. **Never blindly accept "ours" or "theirs"** — the correct resolution is usually a combination.
3. **Never delete another agent's work** to resolve a conflict. Preserve both intents.
4. If a conflict is in a shared/critical file (`App.tsx`, `index.js`, schema files), **stop and flag it to the human owner** rather than self-resolving.
5. After resolving, always re-test the area you touched.

---

## Should Multiple Agents Work on the Same Branch? NO.

**Working on the same branch at the same time is the #1 cause of lost work and hard-to-debug conflicts.**

Here is exactly what goes wrong:
- Agent A pushes commit C1. Agent B, who started before C1 existed, pushes C2. B's push is now rejected because it doesn't include C1.
- B does `git pull` and creates a merge commit, but the merged result contains conflicting component state or partial feature code from both agents.
- The resulting code may pass linting but break at runtime because neither agent's feature is complete — they're interleaved.

### The correct model: isolated branches + `dev` as integration

```
dev (integration)
 ├── agent/copilot-1/feature-A   ← Copilot 1 works here alone
 ├── agent/copilot-2/feature-B   ← Copilot 2 works here alone
 └── agent/antigravity/feature-C ← Antigravity works here alone
```

Each agent:
1. Creates their branch from `dev`.
2. Works in isolation.
3. Merges/rebases `dev` into their branch to pick up others' completed work.
4. Opens a PR to `dev` when done.
5. `dev` gets merged to `main` only after integration testing.

---

## How Professional Teams Run Multiple Agents (Industry Best Practice)

Top engineering teams using multiple AI agents follow these principles:

### 1. Task decomposition before dispatch
The human architect breaks the work into **non-overlapping atomic tasks** before assigning agents. Each task has a clear input, output, and list of files it's allowed to touch. Agents are never assigned overlapping file ownership.

### 2. Trunk-based development with short-lived branches
Branches live for **hours, not days**. An agent's branch that diverges from `dev` for more than 24 hours is considered a risk. Small, frequent merges back to `dev` keep divergence minimal.

### 3. Feature flags for incomplete work
If an agent needs to merge code that isn't user-facing yet, it's wrapped in a feature flag. This allows merging without exposing broken UI, and multiple agents can build against the same feature safely.

### 4. Task contracts via shared types/schemas first
For features that span frontend and backend (e.g., a new API + its UI), the **shared Zod schema and TypeScript types are defined first** (in `packages/shared`), merged into `dev`, and then both agents build independently against the contract. This eliminates the most common integration conflicts.

### 5. Human review gate before `main`
No agent pushes to `main` unilaterally. A human (or a designated lead agent role) reviews `dev → main` PRs. This is the safety net.

---

## Agent Roster & Ownership Map

Every active agent is registered here. This is the **single source of truth** for who owns what. If you are a new agent, add yourself before starting work.

### copilot-1 (GitHub Copilot — instance 1)
- **Branch prefix**: `agent/copilot-1/`
- **Primary domain**: Frontend features — pages, components, hooks, routing (everything under `frontend/src/features/` and `frontend/src/components/`)
- **High-care files**: `frontend/src/App.tsx` (route registration), `frontend/src/globals.css`
- **Must not touch without coordination**: `backend/index.js`, any `packages/shared/src/schemas/`
- **Commit scope examples**: `feat(feed)`, `fix(auth-ui)`, `style(hadith-card)`

### copilot-2 (GitHub Copilot — instance 2)
- **Branch prefix**: `agent/copilot-2/`
- **Primary domain**: Backend features — routes, controllers, services, models (everything under `backend/routes/`, `backend/controller/`, `backend/services/`, `backend/models/`)
- **High-care files**: `backend/index.js` (middleware + route registration), `backend/middlewares/`
- **Must not touch without coordination**: `frontend/src/App.tsx`, `frontend/src/stores/`
- **Commit scope examples**: `feat(post-service)`, `fix(auth-controller)`, `chore(rate-limiter)`

### antigravityagent (Antigravity AI agent)
- **Branch prefix**: `agent/antigravity/`
- **Primary domain**: Shared layer, real-time, integrations — `packages/shared/`, `backend/socket/`, third-party integrations (AWS, IVS, push notifications), `packages/mobile/`
- **High-care files**: `packages/shared/src/schemas/` (changes here affect both frontend and backend), `backend/socket/index.js`
- **Must not touch without coordination**: any file already on an active copilot-1 or copilot-2 branch
- **Commit scope examples**: `feat(shared-schema)`, `fix(socket)`, `chore(aws-config)`, `feat(mobile)`
- **Extra rule**: When modifying a shared Zod schema, open the PR to `dev` and ping the other agents to rebase their branches before continuing

---

## Cross-Agent Coordination Table

Before starting work, check this table to know who to coordinate with:

| Area | Owner | Coordinate with |
|---|---|---|
| Frontend pages & components | copilot-1 | — |
| Frontend routing (`App.tsx`) | copilot-1 | Inform copilot-2, antigravityagent |
| Backend routes/controllers/services | copilot-2 | — |
| Backend entry (`backend/index.js`) | copilot-2 | Inform copilot-1 |
| Shared Zod schemas | antigravityagent | Both copilot-1 and copilot-2 must rebase after |
| Socket.IO | antigravityagent | copilot-2 if touching backend event handlers |
| Mobile app | antigravityagent | — |
| `package.json` (root/frontend/backend) | Any | Announce in PR description — all agents must re-run `npm install` |

---

## Quick Reference Card

```
START SESSION:
  git fetch origin
  git rebase origin/dev
  git branch --show-current   ← must be agent/<id>/<task>

COMMIT:
  git add <only files your task touches>
  git commit -m "feat(scope): imperative description"
  # Keep commits atomic — one logical change per commit

BEFORE PUSH:
  cd frontend && npm run lint
  npx tsc --noEmit
  git rebase origin/dev        ← rebase again right before push

PUSH:
  git push origin agent/<id>/<task>
  # Open PR → target: dev

AFTER MERGE:
  git push origin --delete agent/<id>/<task>
```
