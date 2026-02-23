---
description: Structured refactoring - analyze, identify code smells, propose, approve, refactor, verify
---

# ♻️ Refactor Workflow

Follow this structured process to safely refactor code without introducing regressions.

## Step 1: Analyze Current State
* Read the target code thoroughly.
* Understand the full dependency chain — what calls this code, and what does it call?
* Map out the component/module boundaries.
* Run existing tests to establish a green baseline.

## Step 2: Identify Code Smells
Look for these common issues:
- **Duplication** — Same logic in multiple places
- **God components/functions** — Doing too many things
- **Deep nesting** — Complex conditionals or callbacks
- **Poor naming** — Variables/functions that don't communicate intent
- **Tight coupling** — Components that know too much about each other
- **Dead code** — Unused functions, imports, variables
- **Magic numbers/strings** — Hardcoded values without context
- **Missing abstractions** — Repeated patterns that should be extracted

## Step 3: Propose Changes
* Create a clear proposal listing:
  - What smells were found
  - What refactoring is proposed for each
  - Which files will be affected
  - Risk level (low/medium/high)
* Present to the user for approval before making changes.

## Step 4: Refactor
* Make one refactoring change at a time — do not batch unrelated refactors.
* Preserve external behavior (inputs, outputs, side effects must remain identical).
* Follow existing project patterns and conventions.
* Update imports, references, and type definitions as needed.

## Step 5: Verify
* Run the full test suite — all tests must pass.
* Run type checking (`tsc --noEmit`) and linting.
* Manually verify UI if components were changed.
* Confirm no regressions by comparing behavior before/after.

## Step 6: Summary
* List what was refactored and why.
* Note any follow-up refactoring that could be done later.
