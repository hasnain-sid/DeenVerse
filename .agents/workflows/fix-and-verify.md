---
description: Structured bug fixing - reproduce, root-cause, fix, test, and verify
---

# 🐛 Fix and Verify Workflow

When a bug is reported, follow this structured debugging process. Never jump straight to changing code.

## Step 1: Reproduce the Bug
* Understand the reported behavior vs expected behavior.
* Attempt to reproduce the issue by:
  - Reading the relevant source code.
  - Running the application if needed.
  - Checking browser console, terminal logs, or error traces.
* **If unable to reproduce**, ask the user for more details (steps, environment, screenshots).

## Step 2: Root-Cause Analysis
* Trace the code path from the user-facing symptom to the underlying cause.
* Identify the exact file(s) and line(s) causing the issue.
* Check if this is a regression (was it working before? check git log).
* Document the root cause clearly before proceeding.

## Step 3: Implement the Fix
* Make the minimal change necessary to fix the bug.
* Do not refactor unrelated code in the same fix.
* If the fix requires a design change, flag it and discuss with the user first.

## Step 4: Write or Update Tests
* Write a test that would have caught this bug.
* If a test already exists but didn't catch it, update the test.
* Ensure the test fails without the fix and passes with it.

## Step 5: Verify
* Run the existing test suite to ensure no regressions.
* Manually verify the fix if it's a UI/UX issue.
* Confirm the original bug no longer reproduces.
* Check for related areas that might have the same issue.

## Step 6: Summary
Present a brief summary:
- **Root Cause:** What caused the bug
- **Fix:** What was changed and why
- **Tests:** What test coverage was added
- **Verification:** How it was verified
