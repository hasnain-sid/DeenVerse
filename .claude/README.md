# .claude/ — Session Context for Claude Code

Generated 2026-07-19 from a full repo audit. Load only what the task needs:

| Task type | Load |
|---|---|
| Any task (orientation) | PROJECT_CONTEXT.md |
| Writing/reviewing code | ARCHITECTURE.md, CONVENTIONS.md |
| "Where were we?" / resuming | CURRENT_STATUS.md, SESSION_NOTES.md |
| Planning work | ROADMAP.md, FEATURES.md, KNOWN_ISSUES.md |
| Running/building/testing | COMMANDS.md |
| API/backend work | API_REFERENCE.md, DATABASE.md |
| Adding deps / env setup | DEPENDENCIES.md |
| "Why is it like this?" | DECISIONS.md |
| Unfamiliar terms | GLOSSARY.md |

Deep-dive documents live in the repo at `docs/audits/` (codebase-audit, git-history-audit, deep-code-review, project-state-and-roadmap). These files are the condensed layer on top.

Maintenance: update CURRENT_STATUS.md and SESSION_NOTES.md every session; others only when facts change. This folder is gitignored — local only.
