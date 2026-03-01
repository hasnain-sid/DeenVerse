---
description: Generate or update documentation for a module - README, JSDoc, API docs, architecture notes
---

# 📝 Documentation Workflow

Generate or update documentation to keep it in sync with the codebase.

## Step 1: Identify What to Document
* If the user specifies a module/feature, document that.
* If unspecified, scan for recently changed files lacking documentation.
* Determine the documentation type needed:
  - **README** — Module overview, setup, usage
  - **Inline Docs** — JSDoc/TSDoc comments on functions, types, interfaces
  - **API Docs** — Endpoint documentation (method, path, request/response)
  - **Architecture Notes** — System design, data flow, component relationships

## Step 2: Read the Code
* Thoroughly read the source code to understand behavior, inputs, outputs, and edge cases.
* Check existing documentation for staleness or inaccuracies.
* Review tests for usage examples and expected behaviors.

## Step 3: Write Documentation
Follow these principles:
* **Explain "why", not just "what"** — The code shows what; docs should explain intent and decisions.
* **Include examples** — Code snippets, usage patterns, or screenshots for UI components.
* **Document edge cases** — What happens with empty data, errors, or extreme inputs?
* **Keep it scannable** — Use headings, bullet points, tables, and code blocks.
* **Stay DRY** — Don't duplicate what TypeScript types already communicate.

## Step 4: Place Documentation Correctly
* Module README → Inside the module directory (e.g., `features/quran/README.md`)
* Project-level docs → Inside `docs/` directory
* Inline docs → Directly in the source files
* Architecture updates → Update `ARCHITECTURE.md`

## Step 5: Verify Links & Accuracy
* Ensure all file links and references are valid.
* Verify code examples compile/run correctly.
* Cross-check with actual behavior if possible.

## Step 6: Update Feature Board (if applicable)
* If documenting a feature, check that `.agents/feature-board.md` reflects the current state.
* If documenting API endpoints, verify they match the feature contract in `.agents/contracts/`.
* If the documentation reveals incomplete features (endpoints documented but not built), flag them as ⚠️ on the board.
