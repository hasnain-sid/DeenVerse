# Key Decisions & Rationale

Inferred from code, playbooks, and root ARCHITECTURE.md. "Why is it like this?"

1. **Backend stayed plain JavaScript** — the v2 plan called for TS but only the frontend migrated; backend TS never happened. Don't assume types server-side; shared Zod schemas bridge the gap.
2. **Dual-token JWT (15min access in memory / 7d refresh in httpOnly cookie)** — chosen over sessions for statelessness. Consequence: no revocation (accepted debt, now a known issue).
3. **Redis as optional optimization layer** — every Redis consumer (cache, rate limit) no-ops or falls back in-memory so the app runs with zero infra. Chosen for dev simplicity over consistency.
4. **Zod schemas in `packages/shared`** — single source of validation truth for backend + frontend (+ future mobile). Built with plain tsc, consumed as `file:` dep / Jest moduleNameMapper — no publishing.
5. **Vercel for frontend hosting** despite a full S3/CloudFront CI pipeline existing — Vercel won for preview deploys; the CI deploy jobs were never removed.
6. **LiveKit for classrooms, AWS IVS for public streams** — two realtime video stacks intentionally: IVS = broadcast/HLS scale, LiveKit = interactive rooms + egress recordings.
7. **Stripe webhooks mounted before express.json** — raw body needed for signature verification. Never reorder.
8. **Multi-agent development via Tick + contracts** — features get a `.agents/contracts/<name>.md` before coding; board + tracker auto-commit with `[tick]` prefix. Lesson learned: tracker "done" ≠ committed (verify with git).
9. **Feature-folder frontend with lazy named-export pages** — every route page follows `lazy(() => import(...).then(m => ({default: m.X})))`; follow the pattern.
10. **Blanket XSS input sanitization middleware** — chosen early for safety; now considered the wrong layer (see KNOWN_ISSUES) but still active — beware it mutates request bodies.
11. **Admin via ADMIN_IDS env allowlist** — predates the `role` enum; both exist, allowlist wins. Consolidation pending.
12. **PWA autoUpdate + never-cache-auth** — service worker skipWaiting/clientsClaim with auth endpoints regex-excluded after a stale-session bug; `vite:preloadError` triggers a one-shot reload for stale chunks.
