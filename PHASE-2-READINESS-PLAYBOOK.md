# Phase 2 Readiness Playbook - LMS Contract Fixes

> Copy-paste prompts for the post-audit remediation pass.
> Use this before starting Phase 3. The goal is to remove the contract drift and tooling gaps found in the Phase 2 audit.

---

## Recommended Copilot Pro Models

Use the strongest model available in your GitHub Copilot model picker for each task type.

| Best Fit | Use For | Why |
|----------|---------|-----|
| `GPT-5.4` | API contract alignment, debugging, end-to-end fix passes, tooling scripts | Best overall choice for cross-layer reasoning and finding backend/frontend mismatches |
| `Claude Opus 4.6` | Heavy backend refactors, validation layers, test updates | Strong for large backend edits with many moving parts |
| `Claude Sonnet 4.6` | Frontend hook/page alignment, UI wiring, type cleanup | Fast and reliable for page-level TypeScript work |

If you want to use one model for the whole playbook, use `GPT-5.4`.

---

## Timeline Overview

```text
Step 1      Contract + course response normalization
Step 2      Course frontend alignment
Step 3      Quiz response normalization
Step 4      Quiz frontend alignment
Step 5      Backend validation layer
Step 6      Integrity checker fix
Step 7      Final readiness verification
```

---

## Prerequisites

Do not begin Phase 3 yet.

Verify the readiness-fix tasks exist:

```bash
tick list --tag phase2
tick list --status backlog
```

Key findings this playbook resolves:

- Course detail response mismatch: frontend expects `enrollmentCount` top-level, backend returns it inside `course`
- Course progress response mismatch: frontend expects flat progress object, backend returns `{ enrollment }`
- Quiz start/submit response mismatch: frontend expects `attemptId` and nested `quiz`, backend returns a different shape
- Pagination mismatch: frontend expects `pages`, backend returns `totalPages`
- Missing backend validation for Phase 2 course/quiz writes
- Integrity checker false positives for typed Axios calls like `api.get<Foo>(...)`

---

## Step 1 - TASK-087

**Recommended model**: `GPT-5.4`

Claim first:

```bash
tick claim TASK-087 copilot
```

Prompt to send:

```text
TASK-087: Normalize Phase 2 course API response contracts.

Read first:
- frontend/src/features/courses/useCourses.ts
- frontend/src/features/courses/CourseDetailPage.tsx
- frontend/src/features/courses/CoursePlayerPage.tsx
- frontend/src/features/courses/MyTeachingPage.tsx
- frontend/src/features/courses/MyCoursesPage.tsx
- frontend/src/features/courses/AdminCourseReviewPage.tsx
- backend/services/courseService.js
- backend/controller/courseController.js

Goal:
Create one stable response contract for the course system and implement it consistently across backend and frontend-facing types.

Fix these mismatches:
1. Course detail: frontend currently expects top-level enrollmentCount but backend returns it inside course.
2. Course progress: frontend currently expects a flat object but backend returns { enrollment }.
3. Pagination: frontend uses pages while backend returns totalPages.

Do the following:
1. Pick one canonical response shape for each endpoint and apply it consistently.
2. Prefer changing the frontend types/hooks/pages to match existing backend shapes unless the backend shape is clearly worse.
3. Keep API responses consistent across browse, teaching, my-courses, admin-courses, detail, and progress endpoints.
4. Update any affected backend controller/service return values only if needed for consistency.
5. Preserve existing tests where possible and adjust/add targeted tests if the API shape changes.

After completing:
tick comment TASK-087 copilot --note "Course API response contracts normalized for detail, progress, and pagination. Backend/frontend shapes now consistent."
tick done TASK-087 copilot
```

---

## Step 2 - TASK-088

**Recommended model**: `Claude Sonnet 4.6` or `GPT-5.4`

Wait for: `TASK-087`

Claim first:

```bash
tick claim TASK-088 copilot
```

Prompt to send:

```text
TASK-088: Align course frontend consumers to the normalized contract.

Read first:
- frontend/src/features/courses/useCourses.ts
- frontend/src/features/courses/CourseDetailPage.tsx
- frontend/src/features/courses/CoursePlayerPage.tsx
- frontend/src/features/courses/MyTeachingPage.tsx
- frontend/src/features/courses/MyCoursesPage.tsx
- frontend/src/features/courses/AdminCourseReviewPage.tsx
- frontend/src/App.tsx

Goal:
Make the frontend course pages use the normalized Phase 2 course contract without runtime assumptions.

Do the following:
1. Update hook response types in useCourses.ts.
2. Fix CourseDetailPage so enrollmentCount and course metadata come from the correct fields.
3. Fix CoursePlayerPage so completed lessons and percentComplete read from the correct progress shape.
4. Fix pagination consumers to use the canonical pagination field name.
5. Verify there are no unsafe assumptions about optional fields in the course pages.

Validation:
- Run frontend lint after the edits.

After completing:
tick comment TASK-088 copilot --note "Course frontend consumers aligned with normalized response contracts. Detail, player, and pagination views updated."
tick done TASK-088 copilot
```

---

## Step 3 - TASK-089

**Recommended model**: `GPT-5.4`

Claim first:

```bash
tick claim TASK-089 copilot
```

Prompt to send:

```text
TASK-089: Normalize Phase 2 quiz API response contracts.

Read first:
- frontend/src/features/courses/useCourses.ts
- frontend/src/features/courses/QuizPlayerPage.tsx
- backend/services/quizService.js
- backend/controller/quizController.js
- backend/__tests__/quizService.test.js
- backend/__tests__/smoke/phase2.smoke.test.js

Goal:
Normalize quiz start/submit/results payloads so the frontend quiz player can rely on one stable response shape.

Fix these mismatches:
1. Frontend expects attemptId, nested quiz metadata, and startedAt in one shape.
2. Backend startQuiz currently returns attempt metadata and timer data in a different shape.
3. Frontend expects richer submit payload fields than the backend currently guarantees.

Do the following:
1. Decide the canonical response shape for start, submit, and results endpoints.
2. Make backend quiz services/controllers return that shape consistently.
3. Update or extend targeted backend tests to lock the contract.
4. Preserve server-side grading, time enforcement, and max-attempt rules.

After completing:
tick comment TASK-089 copilot --note "Quiz API response contracts normalized for start, submit, and results. Backend tests updated to lock the shape."
tick done TASK-089 copilot
```

---

## Step 4 - TASK-090

**Recommended model**: `Claude Sonnet 4.6` or `GPT-5.4`

Wait for: `TASK-089`

Claim first:

```bash
tick claim TASK-090 copilot
```

Prompt to send:

```text
TASK-090: Align the quiz frontend consumer to the normalized contract.

Read first:
- frontend/src/features/courses/useCourses.ts
- frontend/src/features/courses/QuizPlayerPage.tsx
- backend/services/quizService.js

Goal:
Make QuizPlayerPage use the final backend contract without relying on mismatched response fields.

Do the following:
1. Update quiz hook types in useCourses.ts.
2. Fix QuizPlayerPage to use the canonical attempt metadata, timer data, and results payload.
3. Ensure retry logic, attempt counting, countdown timer, and results rendering still work.
4. Remove any stale assumptions like top-level attemptId or nested quiz objects if they no longer apply.

Validation:
- Run frontend lint after the edits.

After completing:
tick comment TASK-090 copilot --note "Quiz frontend consumer aligned with normalized quiz API contract. Timer, attempts, submit, and results flow updated."
tick done TASK-090 copilot
```

---

## Step 5 - TASK-091

**Recommended model**: `Claude Opus 4.6` or `GPT-5.4`

Wait for: `TASK-087` and `TASK-089`

Claim first:

```bash
tick claim TASK-091 copilot
```

Prompt to send:

```text
TASK-091: Add backend validation for Phase 2 course and quiz write endpoints.

Read first:
- backend/controller/courseController.js
- backend/controller/quizController.js
- packages/shared/src/schemas/course.ts
- packages/shared/src/index.ts
- backend/utils/AppError.js

Goal:
Ensure Phase 2 backend write endpoints validate payloads before reaching services.

Target endpoints:
- POST /api/v1/courses
- PUT /api/v1/courses/:slug
- POST /api/v1/courses/:slug/modules
- PUT /api/v1/courses/:slug/modules/:moduleIndex
- POST /api/v1/courses/:slug/enroll
- PUT /api/v1/courses/:slug/progress
- PUT /api/v1/admin/courses/:slug/review
- Quiz create/update endpoints if payload validation is currently missing

Rules:
1. Use shared Zod schemas where practical.
2. If a shared schema is not a perfect fit, add a thin backend-side validation step instead of skipping validation.
3. Return clean AppError-based 400 responses for invalid input.
4. Do not move business logic into controllers.

After completing:
tick comment TASK-091 copilot --note "Validation added for Phase 2 course and quiz write endpoints using shared schemas/backend guards."
tick done TASK-091 copilot
```

---

## Step 6 - TASK-092

**Recommended model**: `GPT-5.4`

Claim first:

```bash
tick claim TASK-092 copilot
```

Prompt to send:

```text
TASK-092: Fix the feature integrity checker for typed API calls.

Read first:
- scripts/check-feature-integrity.js
- frontend/src/features/courses/useCourses.ts
- frontend/src/features/payments/usePayments.ts

Goal:
Reduce false positives in npm run check:integrity by teaching the checker to recognize typed Axios calls such as api.get<Foo>(...), api.post<Bar>(...), and multiline variants.

Do the following:
1. Update the frontend API call regex/parser logic so typed generic Axios calls are detected.
2. Keep support for plain api.get('/path') calls.
3. Re-run the integrity checker and verify the Course System routes are no longer incorrectly reported as unconsumed.
4. Leave intentionally backend-only routes untouched; only reduce false positives.

After completing:
tick comment TASK-092 copilot --note "Integrity checker updated to detect typed Axios calls. Course System false positives removed from readiness audit."
tick done TASK-092 copilot
```

---

## Step 7 - TASK-093

**Recommended model**: `GPT-5.4`

Wait for: `TASK-088`, `TASK-090`, `TASK-091`, `TASK-092`

Claim first:

```bash
tick claim TASK-093 copilot
```

Prompt to send:

```text
TASK-093: Run the final Phase 2 readiness verification and give the Phase 3 gate decision.

Read first:
- PHASE-2-READINESS-PLAYBOOK.md
- .agents/feature-board.md

Run and review:
1. cd frontend && npm run lint
2. cd backend && npm test -- --runInBand backend/__tests__/courseModel.test.js backend/__tests__/courseAccess.test.js backend/__tests__/courseService.test.js backend/__tests__/enrollmentService.test.js backend/__tests__/quizService.test.js backend/__tests__/smoke/phase2.smoke.test.js
3. cd .. && npm run check:integrity

Goal:
Produce a short go/no-go decision for Phase 3 after the remediation pass.

Success criteria:
- Frontend lint passes
- Phase 2 targeted backend tests pass
- No Phase 2 contract mismatches remain
- Integrity checker no longer falsely flags the Course System hooks

After completing:
tick comment TASK-093 copilot --note "Final Phase 2 readiness verification complete. Phase 3 gate decision recorded with lint, tests, and integrity results."
tick done TASK-093 copilot
```

---

## Suggested Execution Order

```text
TASK-087 -> TASK-088
TASK-089 -> TASK-090
TASK-087 + TASK-089 -> TASK-091
TASK-092 can run independently
TASK-088 + TASK-090 + TASK-091 + TASK-092 -> TASK-093
```

Best practical sequence with Copilot Pro:

1. Run `TASK-087` with `GPT-5.4`
2. Run `TASK-089` with `GPT-5.4`
3. Run `TASK-088` with `Claude Sonnet 4.6`
4. Run `TASK-090` with `Claude Sonnet 4.6`
5. Run `TASK-091` with `Claude Opus 4.6`
6. Run `TASK-092` with `GPT-5.4`
7. Run `TASK-093` with `GPT-5.4`

If you want minimum model switching, use `GPT-5.4` for all 7 tasks.
