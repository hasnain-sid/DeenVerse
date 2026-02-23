---
description: Pre-deployment verification - run build, lint, type-check, and tests before deploying
---

# 🚢 Deploy Check Workflow

Run all checks before deploying to ensure nothing is broken.

// turbo-all

## Step 1: Type Check
* Run `npx tsc --noEmit` in the frontend directory.
* Fix any type errors before proceeding.

## Step 2: Lint
* Run `npm run lint` in the frontend directory.
* Fix any lint errors (warnings are acceptable but note them).

## Step 3: Build
* Run `npm run build` in the frontend directory.
* Ensure the build completes without errors.
* Check the build output size — flag if any chunk exceeds 500KB.

## Step 4: Test
* Run the test suite if tests exist.
* Ensure all tests pass.

## Step 5: Environment Check
* Verify `.env` or environment variables are configured for the target environment.
* Check `vercel.json` or deployment config for correctness.
* Ensure API URLs point to the correct environment (not localhost).

## Step 6: Report
Present a deployment readiness report:

| Check | Status |
|-------|--------|
| TypeScript | ✅ / ❌ |
| Lint | ✅ / ❌ |
| Build | ✅ / ❌ |
| Tests | ✅ / ❌ / ⏭️ (skipped) |
| Env Config | ✅ / ❌ |

* If all pass → **Ready to deploy** ✅
* If any fail → List issues and offer to fix them
