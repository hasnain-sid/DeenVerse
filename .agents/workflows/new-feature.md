---
description: End-to-end feature development - research, plan, approve, implement, test, walkthrough
---

# 🚀 New Feature Workflow

Follow this structured process for any new feature development. Never jump straight into coding.

## Step 1: Research & Understand
* Fully understand the user's requirements — ask clarifying questions if ambiguous.
* Study the existing codebase architecture (`ARCHITECTURE.md`, `ROADMAP.md`).
* Check existing patterns for similar features in the project.
* Research external dependencies, APIs, or libraries if needed.

## Step 2: Create Implementation Plan
* Create a detailed `implementation_plan.md` artifact that includes:
  - Problem statement and goals
  - Technical approach and design decisions
  - File-by-file breakdown of changes (new, modified, deleted)
  - Data models or API contracts if applicable
  - Verification plan (how to test)
* Flag any breaking changes, trade-offs, or decisions that need user input.

## Step 3: Get User Approval
* Present the plan to the user via `notify_user`.
* Wait for approval before writing any code.
* If the user requests changes, update the plan and re-submit.

## Step 4: Implement
* Follow the approved plan step by step.
* Commit to the project's code style, naming conventions, and folder structure.
* Create small, focused changes — don't mix unrelated modifications.
* Add inline comments for any complex or non-obvious logic.

## Step 5: Test & Verify
* Run linting and type checks (`npm run lint`, `tsc`).
* Run existing tests to ensure no regressions.
* Write new tests for the feature if applicable.
* Manually verify the feature works as expected (browser testing for UI).

## Step 6: Walkthrough
* Create a `walkthrough.md` artifact summarizing:
  - What was built
  - Key files changed
  - How to test/demo the feature
  - Screenshots or recordings for UI changes
