# DeenVerse — Feature Board

> **Single source of truth** for feature completion across all layers.
> Every agent **must** update this file when starting or completing work on a feature.

---

## How to Read Status

| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🔵 | In Progress |
| ✅ | Complete |
| 🔴 | Blocked (see notes) |
| ⚠️ | Partial — needs attention |

---

## Active Features

<!-- 
  ADD NEW FEATURES HERE using this format:
  | Feature Name | Shared | Backend | Frontend | Mobile | Owner(s) | Contract | Notes |
-->

| Feature | Shared | Backend | Frontend | Mobile | Owner(s) | Contract | Notes |
|---------|--------|---------|----------|--------|----------|----------|-------|
| Global Islamic Courses Viewer | ⬜ | — | ✅ | ⬜ | antigravity | — | Frontend only |
| Auth (JWT + Refresh) | ✅ | ✅ | ✅ | ⬜ | copilot-1, copilot-2 | — | Mobile pending |
| Feed / Posts | ✅ | ✅ | ✅ | ⬜ | copilot-1, copilot-2 | — | — |
| Hadith Browse | ⬜ | ✅ | ✅ | ⬜ | copilot-1, copilot-2 | — | — |
| Live Streaming | ⬜ | ✅ | ✅ | ⬜ | copilot-2, antigravity | — | Uses AWS IVS |
| Chat / Messaging | ⬜ | ✅ | ✅ | ⬜ | copilot-1, copilot-2, antigravity | — | Socket.IO |
| Notifications | ⬜ | ✅ | ✅ | ⬜ | copilot-1, copilot-2 | — | Push + in-app |
| Collections / Saved | ⬜ | ✅ | ✅ | ⬜ | copilot-1, copilot-2 | — | — |
| Daily Learning | ⬜ | ✅ | ⚠️ | ⬜ | copilot-1, copilot-2 | — | Check UI status |
| Quran Reader | ⬜ | ✅ | ⚠️ | ⬜ | copilot-1, copilot-2 | — | Check UI status |
| Ruhani Hub | ⬜ | ✅ | ⚠️ | ⬜ | copilot-1, copilot-2 | — | Check UI status |
| Share to Feed | ✅ | ✅ | ✅ | ⬜ | copilot-1, copilot-2 | — | — |
| Moderation / Reports | ⬜ | ✅ | ⚠️ | ⬜ | copilot-2 | — | Admin panel needed |
| Analytics | ⬜ | ✅ | ⚠️ | ⬜ | copilot-2 | — | Dashboard needed |
| Browse by Topic (Quran Topics) | ⬜ | ✅ | ✅ | ⬜ | copilot | — | Netflix-style UI, code-reviewed TASK-023 |
| Scholar Role System | ✅ | ✅ | ✅ | ⬜ | copilot (backend), antigravity (prototypes), copilot-2 (integration) | [scholar-role-system.md](contracts/scholar-role-system.md) | Phase 1 complete — TASK-024→028 (backend), TASK-040→042 (frontend) |
| Payment System (Stripe) | ✅ | ✅ | ✅ | ⬜ | copilot (backend), antigravity (prototypes), copilot-2 (integration) | [payment-system.md](contracts/payment-system.md) | Phase 1 complete — TASK-029→034 (backend), TASK-040→042 (frontend) |
| Course System (LMS) | ⬜ | ⬜ | ⬜ | ⬜ | copilot (backend), antigravity (prototypes), copilot-2 (integration) | [course-system.md](contracts/course-system.md) | Phase 2 — TASK-045 to TASK-065. Depends on Phase 1 (Scholar + Payment) |
| Virtual Classroom (LiveKit + tldraw) | ⬜ | ⬜ | ⬜ | ⬜ | copilot (backend), antigravity (prototypes), copilot-2 (integration) | [virtual-classroom.md](contracts/virtual-classroom.md) | Phase 3 — TASK-066 to TASK-086. Depends on Phase 2 (Course System) |

---

## Ongoing / Pending Tasks

> **Live task queue.** Every agent updates this when they pick up, pause, or finish a task.
> Check here FIRST at session start to see what's in-flight and what's waiting.

### 🔵 In Progress (currently being worked on)

<!-- 
  Format: | Task | Agent | Branch | Started | Layer | Depends On | Notes |
  Move to ✅ Done Today section when finished, or back to ⏳ Pending if paused.
-->

| Task | Agent | Branch | Started | Layer | Depends On | Notes |
|------|-------|--------|---------|-------|------------|-------|
| — | — | — | — | — | — | *No tasks in progress* |

### ⏳ Pending (ready to pick up)

<!-- 
  Tasks that are defined and ready to start. An agent should claim one by
  moving it to "In Progress" and filling in their agent-id + branch.
-->

| # | Task | Priority | Layer | Blocked By | Suggested Agent | Notes |
|---|------|----------|-------|------------|-----------------|-------|
| 1 | Daily Learning — complete frontend UI | High | Frontend | — | copilot-1 | Backend ✅, UI partially done |
| 2 | Quran Reader — complete frontend UI | High | Frontend | — | copilot-1 | Backend ✅, UI partially done |
| 3 | Ruhani Hub — build frontend pages | High | Frontend | — | copilot-1 | Backend ✅, 13 routes unconsumed |
| 4 | Moderation — build admin panel UI | Medium | Frontend | — | copilot-1 | Backend ✅, 7 admin routes ready |
| 5 | Analytics — build dashboard UI | Medium | Frontend | — | copilot-1 | Backend ✅, 3 routes ready |
| 6 | Email Verification flow | High | Full-stack | Contract needed | copilot-2 | Backend + frontend |
| 7 | Google OAuth login | Medium | Full-stack | Contract needed | copilot-2 | Passport.js + frontend button |
| 8 | Fix orphan: `POST /user/:param` | Low | Frontend | — | copilot-1 | Detected by integrity check |
| 9 | Mobile App — Expo scaffold | High | Mobile | Contract needed | antigravity | — |

### ✅ Done Today

<!-- 
  Move completed tasks here with the date. Clears at the start of each day/session.
  Keeps a running log so the human owner can review progress.
-->

| Task | Agent | Completed | Notes |
|------|-------|-----------|-------|
| Global Islamic Courses Viewer UI | antigravity | 2026-03-01 | Added new route and navigation for viewing courses database |
| Scholar Role System — Phase 1 complete | copilot + copilot-2 | 2026-03-06 | Shared schemas, backend API, frontend pages (application, admin review, earnings, badge) |
| Payment System (Stripe) — Phase 1 complete | copilot + copilot-2 | 2026-03-06 | Stripe Connect, checkout, webhooks, subscription management, earnings dashboard |

### How to Use This Section

**Picking up a task:**
1. Choose a task from **⏳ Pending** (highest priority first, or one matching your domain)
2. Move it to **🔵 In Progress** — fill in your agent-id, branch name, and date
3. If the task says "Contract needed", create the contract first

**Pausing work:**
1. Move the task back to **⏳ Pending** with a note on what's done so far
2. Or leave it in **🔵 In Progress** with a "paused" note if you'll resume soon

**Finishing a task:**
1. Move from **🔵 In Progress** → **✅ Done Today**
2. Update the Feature Board table above (layer status → ✅)
3. Follow the [handover protocol](.agents/workflows/feature-handover.md) if other layers depend on this

---

## Upcoming Features (Contract Required Before Starting)

<!-- 
  Features planned but not yet started. 
  A contract MUST be created in .agents/contracts/<feature>.md before any agent begins work.
-->

| Feature | Priority | Contract Created | Assigned To | Target |
|---------|----------|-----------------|-------------|--------|
| Email Verification | High | ⬜ | — | — |
| Course System (LMS) | High | ⬜ | — | Phase 2 — depends on Scholar Roles + Payments |
| Virtual Classroom (LiveKit + tldraw) | High | ⬜ | — | Phase 3 — depends on Course System |
| Interactive Quran Teaching | Medium | ⬜ | — | Phase 4 — depends on Virtual Classroom |
| Certification System | Medium | ⬜ | — | Phase 5 — depends on Course System |
| Dawah & Q&A Platform | Medium | ⬜ | — | Phase 6 — depends on Scholar Roles |
| Google OAuth | Medium | ⬜ | — | — |
| Mobile App (Expo) | High | ⬜ | antigravity | — |

---

## Completed Features Archive

<!-- Move features here once ALL layers (shared + backend + frontend) are confirmed working -->

---

## Rules

1. **Every new feature MUST have a contract** in `.agents/contracts/<feature-name>.md` before any agent starts coding.
2. **Update this board** when you start (`⬜ → 🔵`) or finish (`🔵 → ✅`) a layer.
3. **A feature is NOT done** until all required layers show ✅.
4. If a feature is frontend-only (prototype), mark Backend as `—` (not applicable).
5. If you discover a feature with mismatched layers (e.g., frontend ✅ but backend ⬜), flag it immediately by setting the status to ⚠️ and adding a note.
6. Run `node scripts/check-feature-integrity.js` periodically to catch orphan API calls.
