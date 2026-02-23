# 🤖 Antigravity Agent Workflows — DeenVerse

> **Quick Reference:** Use any workflow by typing `/command-name` in chat (e.g., `/code-review`).

---

## 📋 All Available Workflows

| # | Command | Description | When to Use |
|---|---------|-------------|-------------|
| 1 | `/create-prototype` | Create a frontend prototype with mocked data | Visualizing a new feature or UI concept before coding |
| 2 | `/code-review` | Review code for bugs, security, performance & patterns | Before committing any significant changes |
| 3 | `/fix-and-verify` | Structured bug fixing: reproduce → root-cause → fix → test | When a bug is reported or discovered |
| 4 | `/new-feature` | End-to-end feature dev: research → plan → approve → implement → test | Starting any new feature from scratch |
| 5 | `/git-commit` | Stage, write conventional commit messages, optionally push | After completing a logical unit of work |
| 6 | `/document` | Generate or update docs (README, JSDoc, API, architecture) | When code changes need documentation updates |
| 7 | `/refactor` | Structured refactoring: analyze → propose → approve → refactor → verify | Cleaning up code smells or restructuring |
| 8 | `/add-tests` | Write unit & integration tests following project patterns | Adding test coverage to a module |
| 9 | `/deploy-check` | Pre-deploy verification: build, lint, type-check, tests | Before deploying to Vercel or any environment |
| 10 | `/research` | Deep research with structured comparison & recommendations | Evaluating APIs, libraries, or architecture decisions |
| 11 | `/daily-standup` | Summarize recent work, open TODOs, suggest next priorities | Starting a new coding session |

---

## 🏗️ Recommended Usage Patterns

### Starting a New Feature
```
/new-feature → /code-review → /add-tests → /git-commit → /deploy-check
```

### Fixing a Bug
```
/fix-and-verify → /code-review → /git-commit
```

### Daily Development Flow
```
/daily-standup → (work) → /code-review → /git-commit
```

### Exploring an Idea
```
/research → /create-prototype → /new-feature
```

---

## 📂 Workflow Files Location

All workflow definitions are stored in:
```
.agents/workflows/
├── create-prototype.md
├── code-review.md
├── fix-and-verify.md
├── new-feature.md
├── git-commit.md
├── document.md
├── refactor.md
├── add-tests.md
├── deploy-check.md
├── research.md
└── daily-standup.md
```

> **Customizing:** Edit any `.md` file above to adjust the agent's behavior for that workflow.
