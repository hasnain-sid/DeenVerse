---
description: Stage changes, write conventional commit messages, and optionally push
---

# 📦 Git Commit Workflow

Create clean, conventional commits with meaningful messages.

## Step 1: Review Changes
// turbo
* Run `git status` and `git diff` to review all pending changes.
* Understand what was changed and why.

## Step 2: Group Related Changes
* If there are multiple unrelated changes, suggest splitting into separate commits.
* Each commit should represent one logical unit of work.

## Step 3: Stage Files
* Stage only the files that belong to the current logical change.
* Use `git add <specific-files>` instead of `git add .` when possible.

## Step 4: Write Commit Message
Follow the **Conventional Commits** format:

```
<type>(<scope>): <short description>

<optional body explaining why, not what>
```

**Types:**
| Type | When to Use |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `docs` | Documentation only changes |
| `style` | Formatting, whitespace (no logic change) |
| `refactor` | Code restructure without behavior change |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build, config, tooling changes |

**Scope** = area affected (e.g., `quran`, `habits`, `auth`, `ui`)

**Examples:**
- `feat(quran): add daily ayah reflection component`
- `fix(habits): resolve timer not pausing on app background`
- `docs: update ROADMAP with quran learning milestones`

## Step 5: Commit & Optionally Push
* Run `git commit -m "<message>"`.
* Ask the user if they want to push to remote.
* If yes, run `git push origin <current-branch>`.
