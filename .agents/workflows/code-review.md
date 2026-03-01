---
description: Review code for bugs, security, performance, and adherence to project patterns before committing
---

# 🔍 Code Review Workflow

Perform a thorough code review on the specified files or the most recent changes. Act as a senior developer reviewing a pull request.

## Step 1: Identify the Scope
* If the user specifies files, review those files.
* If no files are specified, identify recently modified files using `git diff` or `git diff --staged`.

## Step 1.5: Cross-Check Feature Board
* Check `.agents/feature-board.md` to understand the context of changes:
  - Does this code belong to a tracked feature? Is the feature board up to date?
  - If new API calls were added — does the corresponding backend route exist? Run `npm run check:integrity`.
  - If a layer was completed — was the feature board updated? Was a handover note left?

## Step 2: Review Checklist
For each file, evaluate the following categories:

### Correctness & Bugs
- [ ] Logic errors or off-by-one mistakes
- [ ] Null/undefined checks and edge cases handled
- [ ] Proper error handling (try/catch, error boundaries)
- [ ] Async/await used correctly, no unhandled promises

### Security
- [ ] No hardcoded secrets, API keys, or credentials
- [ ] User input is validated and sanitized (XSS, injection)
- [ ] Authentication/authorization checks in place where needed
- [ ] No sensitive data logged or exposed to the client

### Performance
- [ ] No unnecessary re-renders (React: missing `useMemo`, `useCallback`, dependency arrays)
- [ ] No N+1 queries or redundant API calls
- [ ] Large lists are virtualized if applicable
- [ ] No memory leaks (event listeners, subscriptions cleaned up)

### Code Quality & Patterns
- [ ] Follows existing project conventions and file structure
- [ ] No code duplication — reuses existing utilities/components
- [ ] Proper TypeScript types (no `any` unless justified)
- [ ] Meaningful variable/function names
- [ ] Components are focused and not overly complex

### Multi-Agent Coordination
- [ ] Feature board (`.agents/feature-board.md`) reflects current state of this feature
- [ ] No orphan frontend API calls (run `npm run check:integrity`)
- [ ] If multi-layer feature: contract exists in `.agents/contracts/`
- [ ] Handover notes left if other agents need to build on this

### Readability
- [ ] Complex logic has comments explaining "why"
- [ ] No dead/commented-out code left behind
- [ ] Functions are small and do one thing

## Step 3: Report Findings
Present findings in a structured format:
- **🔴 Critical** — Must fix before commit (bugs, security issues)
- **🟡 Warning** — Should fix (performance, code smells)
- **🟢 Suggestion** — Nice to have (style, minor improvements)
- **✅ Looks Good** — If nothing found

## Step 4: Offer to Fix
After presenting findings, offer to auto-fix any issues the user approves.
