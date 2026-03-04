---
description: "Use when managing tasks, creating tasks from research, claiming work, updating task progress, or coordinating parallel agent work. Covers the TICK.md multi-agent task coordination protocol."
applyTo: "TICK.md"
---

# Task Management — TICK.md Protocol

DeenVerse uses [tick-md](https://tick.md) for multi-agent task coordination. All tasks live in the root `TICK.md` file — a Git-backed, human-readable, LLM-native markdown file.

---

## Registered Agents

| Agent | Type | Roles |
|-------|------|-------|
| `hasna` | human | owner, architect — creates tasks, reviews, approves |
| `copilot` | bot | developer, researcher — primary Copilot agent |
| `copilot-2` | bot | developer, reviewer — secondary Copilot for parallel work |
| `antigravity` | bot | developer, researcher — Antigravity agent |

---

## Core Workflow

### 1. Creating Tasks (from research or user request)

After researching a feature or receiving a user request, break work into **parallelizable tasks** with clear dependencies:

```bash
# Add a task
tick add "Task title" --priority high --tags "backend,auth" --description "Detailed spec..."

# Add a task that depends on another
tick add "Build API endpoints" --priority high --tags "backend" --depends-on TASK-001

# Add a task assigned to a specific agent
tick add "Research OAuth options" --priority medium --tags "research" --assigned-to copilot
```

**Decomposition rules:**
- Each task should touch **different files/directories** (prevents merge conflicts)
- Tag tasks by layer: `shared`, `backend`, `frontend`, `mobile`, `research`, `devops`
- Set dependencies: contract/schema tasks → backend/frontend tasks → integration tasks
- Keep tasks small enough for a single agent session (1-3 hours of work)

### 2. Claiming a Task

Before starting work, **always claim the task first**:

```bash
tick claim TASK-001 copilot
```

This atomically:
- Sets the task status to `in_progress`
- Records who claimed it and when
- Shows the agent as "working" in the status board
- Prevents other agents from claiming the same task

### 3. Progress Updates

Add comments as you work to maintain handoff context:

```bash
tick comment TASK-001 copilot --note "Contract created. Zod schemas defined for request/response."
```

### 4. Completing a Task

When done:

```bash
tick done TASK-001 copilot
```

This auto-unblocks any tasks that depended on this one (e.g., TASK-002 and TASK-003 become claimable).

### 5. Releasing (if you can't finish)

If you need to hand off mid-task:

```bash
tick release TASK-001 copilot
```

Add a comment BEFORE releasing explaining where you left off.

### 6. Viewing Status

```bash
# Full project overview
tick status

# Filter by tag
tick list --tag frontend
tick list --tag backend

# See dependency graph
tick graph

# Mermaid diagram (paste into GitHub/Notion)
tick graph --format mermaid

# See what's ready to work on (unblocked tasks)
tick list --status todo
tick list --status backlog
```

### 7. Archiving Completed Tasks

When tasks pile up, archive completed ones:

```bash
tick archive
```

Completed tasks move to `ARCHIVE.md` — history preserved, `TICK.md` stays clean.

---

## Parallel Work Pattern

When a user says "work on these tasks in parallel" or multiple agents are active:

```
TASK-001 (contract/schema) → claimed by copilot
    ├── TASK-002 (backend) → blocked until TASK-001 done → then claim by antigravity
    └── TASK-003 (frontend) → blocked until TASK-001 done → then claim by copilot-2

TASK-004 (independent) → can be claimed immediately by any idle agent
TASK-005 (independent) → can be claimed immediately by any idle agent
```

**Key rule:** Tasks with no dependencies and tasks in different file scopes can run in parallel.

---

## Creating Tasks from Research Output

When you complete research (via the research workflow), convert findings into tasks:

1. Summarize the research decision
2. Break implementation into layer-scoped tasks
3. Set dependencies (contract first → parallel backend/frontend → integration)
4. Add each task with `tick add`

Example flow after researching "Email Verification":

```bash
tick add "Create Email Verification contract and shared schemas" --priority high --tags "shared,auth" --description "..."
tick add "Build verification backend endpoints" --priority high --tags "backend,auth" --depends-on TASK-001
tick add "Build verification frontend UI" --priority high --tags "frontend,auth" --depends-on TASK-001
tick add "Integration test email verification flow" --priority medium --tags "testing" --depends-on TASK-002,TASK-003
```

---

## Integration with Feature Board

The `TICK.md` file handles **granular task tracking**. The `.agents/feature-board.md` handles **high-level feature status** across layers. Both should stay in sync:

- When all tasks for a feature are done in TICK.md → update the feature's layer status in the feature board
- When adding a new feature to the board → create corresponding tasks in TICK.md

---

## Git Workflow

tick-md auto-commits changes when `git.auto_commit: true` in `.tick/config.yml`. Each task action (create, claim, done, comment) creates a commit with `[tick]` prefix. To commit manually:

```bash
tick sync
```

---

## Command Quick Reference

| Action | Command |
|--------|---------|
| Add task | `tick add "Title" --priority high --tags "tag1,tag2" --description "..."` |
| Add with dependency | `tick add "Title" --depends-on TASK-001,TASK-002` |
| Claim task | `tick claim TASK-001 agentname` |
| Progress comment | `tick comment TASK-001 agentname --note "Update..."` |
| Complete task | `tick done TASK-001 agentname` |
| Release task | `tick release TASK-001 agentname` |
| View status | `tick status` |
| Filter by tag | `tick list --tag frontend` |
| Dependency graph | `tick graph` |
| Archive done tasks | `tick archive` |
| Validate file | `tick validate` |
| Undo last action | `tick undo` |
