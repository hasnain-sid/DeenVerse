# Copilot Agent Instructions Index

This document is a quick reference of all Copilot customization currently active in this repository.

## 1. Workspace-Level Instruction

| File | Scope | Purpose |
|---|---|---|
| `.github/copilot-instructions.md` | Entire workspace | Core architecture, conventions, routing/auth patterns, design rules, and global constraints for DeenVerse |

## 2. On-Demand Instruction Files

These are loaded by the agent when your request matches the description.

| File | Trigger Keywords / Scenarios | What It Enforces |
|---|---|---|
| `.github/instructions/prototyping.instructions.md` | prototype, mockup, design exploration | 3-5 variants, `prototypes/` folder, `PrototypesViewer`, temporary route, frontend-only mocks |
| `.github/instructions/new-feature.instructions.md` | new feature, new page, scaffold feature | Feature folder structure, named page export, query hooks, route registration pattern |
| `.github/instructions/research.instructions.md` | research first, deep search, compare options, internet/github references | Deep web + GitHub + local codebase research before coding, with recommendation brief |
| `.github/instructions/api-endpoint.instructions.md` | new endpoint, backend route/controller/service | Route -> controller -> service -> model chain, ESM-only, AppError usage |
| `.github/instructions/debugging.instructions.md` | debug, fix bug, runtime/build/type errors | Reproduce -> diagnose -> minimal fix workflow with DeenVerse-specific issue map |
| `.github/instructions/refactoring.instructions.md` | refactor, split, extract, cleanup | Behavior-preserving refactor rules, extraction patterns, scope control |

## 3. Auto-Applied File Instruction

This instruction has `applyTo`, so it auto-attaches when editing matching files.

| File | applyTo | Purpose |
|---|---|---|
| `.github/instructions/react-component.instructions.md` | `frontend/src/**/*.tsx` | React component standards: named exports, typed props, `cn()`, lucide icons, responsive and accessible UI |

## 4. Prompt Commands (Slash Commands)

These are reusable command templates you can run via chat (`/`).

| Prompt File | Slash Command | Use For |
|---|---|---|
| `.github/prompts/prototype.prompt.md` | `/prototype` | Generate frontend prototype variants with a toggleable viewer and route |
| `.github/prompts/research.prompt.md` | `/research` | Deep research brief with options, trade-offs, and recommended implementation plan |
| `.github/prompts/new-feature.prompt.md` | `/new-feature` | Build a full-stack feature end-to-end |
| `.github/prompts/fix.prompt.md` | `/fix` | Debug and resolve a bug using minimal safe changes |
| `.github/prompts/explain.prompt.md` | `/explain` | Explain code flow, architecture, and gotchas |

## 5. Recommended Usage

- For prototypes: use `/prototype <feature + requirements>`.
- For pre-implementation research: use `/research <feature/problem statement>`.
- For implementation: use `/new-feature <feature description>`.
- For errors: use `/fix <error message + where it happens>`.
- For understanding code quickly: use `/explain <feature or file path>`.

### Strict Gate (Enabled)

For any request to create or integrate a new feature where research preference is not explicitly stated, the agent must ask:
`Do you want deep research first (internet + GitHub + local codebase), or should I implement directly?`

Implementation starts only after user confirmation.

## 6. Maintenance Rule

Whenever you add a new `.instructions.md` or `.prompt.md` file, update this index so the instruction system remains discoverable.
