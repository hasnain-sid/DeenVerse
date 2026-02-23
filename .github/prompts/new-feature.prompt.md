---
description: "Use when the user asks to create a full-stack feature end-to-end — backend API plus frontend UI wired together."
agent: "agent"
argument-hint: "Feature name and what it should do (e.g. 'bookmark system — users can save posts to named collections')"
---

Build a full-stack feature end-to-end following the project conventions:

**Feature**: {{input}}

Steps:
1. Read the existing codebase patterns: check a similar route/controller/service chain and a similar frontend feature/hook/page.
2. **Backend**: Create route → controller → service (→ model if new collection). ESM only, use AppError for errors.
3. **Frontend**: Create feature folder with Page component (named export), TanStack Query hook, and any sub-components.
4. Register the route in `App.tsx` (lazy-loaded).
5. Wire everything together — frontend hook calls the backend endpoint via `api` instance.
6. Handle loading, error, and empty states in the UI.
