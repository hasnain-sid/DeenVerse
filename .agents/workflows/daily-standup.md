---
description: Summarize recent changes, open TODOs, and suggest next priorities from ROADMAP
---

# ☀️ Daily Standup Workflow

Provide a quick summary to help the user pick up right where they left off.

## Step 1: Recent Changes
// turbo
* Run `git log --oneline -10` to see the last 10 commits.
* Summarize what was worked on recently in plain language.

## Step 2: Current State
// turbo
* Run `git status` to check for any uncommitted changes.
* Run `git branch` to identify the current branch.
* Note any work-in-progress that needs attention.

## Step 3: Open TODOs
* Check for any `task.md` artifacts from recent conversations.
* Look for `TODO`, `FIXME`, or `HACK` comments in recently modified files.
* Check for any open issues or pending items in documentation.

## Step 4: Next Priorities
* Read `ROADMAP.md` to identify the next milestones.
* Cross-reference with recent progress to suggest what to tackle next.
* Prioritize items that are:
  1. Blocking other work
  2. Nearly complete (quick wins)
  3. Next on the roadmap

## Step 5: Present Standup
Format the standup as:

### 🔙 Yesterday
- What was accomplished

### 📌 Today's Priorities
- Suggested tasks for today (ranked)

### ⚠️ Blockers
- Any unresolved issues or decisions needed
- Uncommitted work that needs attention
