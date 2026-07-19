# Phase 2.5 Playbook — Bug Fixes, Security Hardening & Phase 3 Gate

> **Fix all Phase 2 code-review findings before starting Phase 3.**
> Work through this document top to bottom. Each stage groups related fixes.
> All prompts target 🔵 **OPUS** (`copilot`) unless noted otherwise.

---

## Agent Legend

| Symbol | Agent | Tool | Model |
|--------|-------|------|-------|
| 🔵 **OPUS** | `copilot` | GitHub Copilot | Claude Opus 4.6 |

---

## Prerequisites

- Phase 2 tasks all done (`tick list --tag course --status done`)
- Code review completed (findings documented below)
- LoginPage.tsx `registerForm` initialization bug **already fixed** (hook reordered)

---

## Timeline Overview

```
Step 1      [OPUS]  Stage 1: Critical security fixes (2 tasks)
Step 2      [OPUS]  Stage 2: Data integrity & concurrency fixes (3 tasks)
Step 3      [OPUS]  Stage 3: Architecture & code quality (3 tasks)
Step 4      [OPUS]  Stage 4: Test gap coverage (1 task)
Step 5      [YOU]   Verify: lint, tests, dev server, integrity check
```

---

## STAGE 1 — Critical Security Fixes

> **Must fix before any new feature work. Security holes.**

---

### STEP 1 · TASK-094 — Payment User Verification + Module Route Guard
**Agent**: 🔵 OPUS
**Priority**: 🔴 Critical
**TICK before starting**:
```
tick add "Fix: payment user verification + module route isScholar guard" --priority urgent --tags "phase2,security,backend,fix" --description "1. enrollInCourse payment lookup must verify payment.user === userId to prevent enrollment theft. 2. Module management routes (POST/PUT/DELETE /:slug/modules) missing isScholar middleware — add defense-in-depth."
tick claim TASK-094 copilot
```

---

**PROMPT TO SEND:**

```
You are working on DeenVerse. This is a Phase 2 security fix from code review.

TASK-094: Fix two critical security issues in the course system.

## Fix 1 — Payment user not verified (enrollment theft)

File: backend/services/courseService.js — enrollInCourse function (~line 476)

Current code:
const payment = await Payment.findOne({
  stripeSessionId: paymentSessionId,
  status: "completed",
  course: course._id,
});

Problem: Any user can enroll using another user's paymentSessionId. No check that the payment belongs to the enrolling user.

Fix: Add `user: userId` to the Payment query filter:
const payment = await Payment.findOne({
  stripeSessionId: paymentSessionId,
  status: "completed",
  course: course._id,
  user: userId,
});

Verify the Payment model (backend/models/paymentSchema.js) has a `user` field. If the field is named differently (e.g., `userId`, `student`, `payer`), use the correct field name.

## Fix 2 — Module management routes missing isScholar middleware

File: backend/routes/courseRoute.js (~line 51-53)

Current:
router.post("/:slug/modules", isAuthenticated, addModuleHandler);
router.put("/:slug/modules/:moduleIndex", isAuthenticated, updateModuleHandler);
router.delete("/:slug/modules/:moduleIndex", isAuthenticated, deleteModuleHandler);

Fix: Add isScholar middleware (already imported in the file):
router.post("/:slug/modules", isAuthenticated, isScholar, addModuleHandler);
router.put("/:slug/modules/:moduleIndex", isAuthenticated, isScholar, updateModuleHandler);
router.delete("/:slug/modules/:moduleIndex", isAuthenticated, isScholar, deleteModuleHandler);

This matches the pattern used for POST / (course create) and POST /:slug/quizzes.

After completing both fixes:
tick comment TASK-094 copilot --note "Payment lookup now verifies user ownership. Module routes guarded with isScholar middleware."
tick done TASK-094 copilot
```

---

## STAGE 2 — Data Integrity & Concurrency Fixes

> **Prevent race conditions and counter corruption.**

---

### STEP 2 · TASK-095 — Atomic maxStudents Check + Enrollment Transaction
**Agent**: 🔵 OPUS
**Priority**: 🔴 Critical
**Wait for**: TASK-094 done
**TICK before starting**:
```
tick add "Fix: atomic enrollment with maxStudents + MongoDB transaction" --priority urgent --tags "phase2,backend,fix,concurrency" --description "enrollInCourse has check-then-act race on maxStudents and three non-atomic writes. Wrap in transaction + use atomic findOneAndUpdate for capacity check."
tick claim TASK-095 copilot
```

---

**PROMPT TO SEND:**

```
TASK-095: Fix enrollment race conditions in courseService.js.

Read first:
- backend/services/courseService.js — enrollInCourse function
- backend/models/courseSchema.js (enrollmentCount, maxStudents fields)
- backend/models/enrollmentSchema.js

## Problem 1 — maxStudents race condition
Current code checks `course.enrollmentCount >= course.maxStudents` then later does `$inc: { enrollmentCount: 1 }` — two concurrent enrollments can both pass the check.

## Problem 2 — Non-atomic writes
Three separate writes (Enrollment.create, Course.updateOne, User.updateOne) — server crash between them corrupts counters.

## Fix — Wrap in MongoDB transaction + atomic capacity check

Replace the enrollment section of enrollInCourse() with:

1. Import mongoose at top if not already imported.

2. Use a MongoDB session/transaction:
```js
const session = await mongoose.startSession();
session.startTransaction();
try {
  // Atomic capacity check + increment
  const capacityUpdate = await Course.findOneAndUpdate(
    {
      _id: course._id,
      ...(course.maxStudents > 0
        ? { $expr: { $lt: ['$enrollmentCount', '$maxStudents'] } }
        : {}),
    },
    { $inc: { enrollmentCount: 1 } },
    { new: true, session }
  );
  if (!capacityUpdate) {
    await session.abortTransaction();
    throw new AppError('This course has reached its maximum number of students', 400);
  }

  const enrollment = await Enrollment.create([enrollmentData], { session });

  await User.updateOne(
    { _id: course.instructor },
    { $inc: { 'scholarProfile.totalStudents': 1 } },
    { session }
  );

  await session.commitTransaction();
  return { enrollment: enrollment[0] };
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```

Remove the old separate Course.updateOne and User.updateOne calls that were after Enrollment.create.

Make sure the existing "already enrolled" check and "payment required" check remain BEFORE the transaction (they don't need to be inside it).

After completing:
tick comment TASK-095 copilot --note "enrollInCourse now uses MongoDB transaction. Atomic capacity check prevents maxStudents race. Counter corruption eliminated."
tick done TASK-095 copilot
```

---

### STEP 3 · TASK-096 — Atomic Progress Updates
**Agent**: 🔵 OPUS
**Priority**: 🟡 Warning
**Wait for**: TASK-095 done
**TICK before starting**:
```
tick add "Fix: atomic progress update with $addToSet" --priority high --tags "phase2,backend,fix,concurrency" --description "updateProgress uses .save() which races on concurrent lesson completions. Switch to atomic $addToSet + $set."
tick claim TASK-096 copilot
```

---

**PROMPT TO SEND:**

```
TASK-096: Fix race condition in updateProgress (courseService.js).

Read: backend/services/courseService.js — updateProgress function

## Problem
Two concurrent lesson completions by the same student: both read completedLessons array, both push, one .save() overwrites the other. Second lesson completion is lost.

## Additional Problem
The function could re-activate a manually "dropped" or "suspended" enrollment when un-completing a lesson. Add a guard.

## Fix

1. Add a guard at the top of updateProgress — reject if enrollment status is not 'active' or 'completed':
```js
if (!['active', 'completed'].includes(enrollmentDoc.status)) {
  throw new AppError('Cannot update progress on a dropped or suspended enrollment', 400);
}
```

2. Replace the .push()/.filter() + .save() pattern with atomic MongoDB operations:

For marking a lesson complete (completed === true):
```js
await Enrollment.updateOne(
  { _id: enrollment._id },
  { $addToSet: { 'progress.completedLessons': lessonId }, $set: { 'progress.lastAccessedAt': new Date() } }
);
```

For un-completing (completed === false):
```js
await Enrollment.updateOne(
  { _id: enrollment._id },
  { $pull: { 'progress.completedLessons': lessonId }, $set: { 'progress.lastAccessedAt': new Date() } }
);
```

3. After the atomic update, re-fetch the enrollment to recalculate percentComplete:
```js
const updated = await Enrollment.findById(enrollment._id);
// Count total lessons
let totalLessons = 0;
for (const mod of courseDoc.modules || []) {
  totalLessons += (mod.lessons || []).length;
}
updated.progress.percentComplete = totalLessons > 0
  ? Math.round((updated.progress.completedLessons.length / totalLessons) * 100)
  : 0;

// Auto-complete / reactivate logic
if (updated.progress.percentComplete === 100 && updated.status !== 'completed') {
  updated.status = 'completed';
  updated.completedAt = new Date();
} else if (updated.progress.percentComplete < 100 && updated.status === 'completed') {
  updated.status = 'active';
  updated.completedAt = undefined;
}
await updated.save();
return { enrollment: updated.toObject() };
```

After completing:
tick comment TASK-096 copilot --note "updateProgress uses atomic $addToSet/$pull. Status guard prevents reactivating dropped enrollments."
tick done TASK-096 copilot
```

---

## STAGE 3 — Architecture, Validation & Code Quality

> **Model validators, missing indexes, and notification content.**

---

### STEP 4 · TASK-097 — Model Validators + Missing Indexes
**Agent**: 🔵 OPUS
**Priority**: 🟡 Warning
**Wait for**: TASK-096 done
**TICK before starting**:
```
tick add "Fix: add min/max validators to models + missing enrollment index" --priority high --tags "phase2,backend,fix,models" --description "Multiple schemas lack min/max validators on numeric fields. Enrollment missing {student:1,status:1} index for getMyCourses query."
tick claim TASK-097 copilot
```

---

**PROMPT TO SEND:**

```
TASK-097: Add missing model validators and indexes.

Read these files:
- backend/models/courseSchema.js
- backend/models/enrollmentSchema.js
- backend/models/quizSchema.js
- backend/models/quizAttemptSchema.js

## Fix 1 — courseSchema.js validators
Add these validators (do not change any existing fields, just add min/max):
- pricing.amount: add `min: 0`
- rating.average: add `min: 0, max: 5`
- rating.count: add `min: 0`
- enrollmentCount: add `min: 0`
- maxStudents: add `min: 0`

## Fix 2 — enrollmentSchema.js
Add validator:
- progress.percentComplete: add `min: 0, max: 100`

Add missing index for getMyCourses performance:
```js
enrollmentSchema.index({ student: 1, status: 1 });
```

## Fix 3 — quizSchema.js validators
- passingScore: add `min: 0, max: 100`
- maxAttempts: add `min: 1`
- timeLimit: add `min: 0`
- questions[].points: add `min: 1`

## Fix 4 — quizAttemptSchema.js validators
- score: add `min: 0, max: 100`
- attempt: add `min: 1`

After completing:
tick comment TASK-097 copilot --note "Added min/max validators to course, enrollment, quiz, quizAttempt models. Added {student:1,status:1} index to enrollment."
tick done TASK-097 copilot
```

---

### STEP 5 · TASK-098 — Quiz Soft-Delete + ADMIN_IDS Cache + Notification Content
**Agent**: 🔵 OPUS
**Priority**: 🟡 Warning
**Wait for**: TASK-097 done
**TICK before starting**:
```
tick add "Fix: quiz soft-delete, ADMIN_IDS cache, review notification content" --priority high --tags "phase2,backend,fix" --description "1. deleteQuiz hard-deletes student attempts — switch to soft-archive. 2. ADMIN_IDS parsed on every request — cache at module scope. 3. reviewCourse notification has no content."
tick claim TASK-098 copilot
```

---

**PROMPT TO SEND:**

```
TASK-098: Three backend quality fixes.

## Fix 1 — Quiz soft-delete (quizService.js — deleteQuiz function)

Current code hard-deletes quiz and all student attempts:
```js
await QuizAttempt.deleteMany({ quiz: quiz._id });
await quiz.deleteOne();
```

Problem: Destroys student grade history with no audit trail.

Fix: Check if quiz has any submitted attempts. If yes, soft-archive instead:
```js
const hasAttempts = await QuizAttempt.exists({ quiz: quiz._id, submittedAt: { $ne: null } });
if (hasAttempts) {
  quiz.status = 'archived';
  await quiz.save();
  return { message: 'Quiz archived (has existing student attempts)' };
}
// No attempts — safe to hard delete
await QuizAttempt.deleteMany({ quiz: quiz._id });
await quiz.deleteOne();
return { message: 'Quiz deleted successfully' };
```

Note: quizSchema.js doesn't have a `status` field yet. Add one:
- status: { type: String, enum: ['active', 'archived'], default: 'active' }

Also ensure browseQuizzes / startQuiz queries filter by `status: 'active'` so archived quizzes are hidden.

## Fix 2 — Cache ADMIN_IDS (courseService.js + quizService.js)

Both files parse ADMIN_IDS from env on every request. Cache at module scope.

In both files, replace the `getAdminIds()` pattern or inline parsing with:
```js
let _cachedAdminIds = null;
function getAdminIds() {
  if (!_cachedAdminIds) {
    _cachedAdminIds = (process.env.ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  }
  return _cachedAdminIds;
}
```

In courseService.js, the parsing is inline inside `verifyCourseOwnership`. Extract to a helper function with caching. In quizService.js, the `ADMIN_IDS_CACHE` variable is declared as `null` but never used — fix it to actually cache.

## Fix 3 — Review notification content (courseService.js — reviewCourse function)

Current notification:
```js
await createAndEmitNotification({
  recipientId: course.instructor,
  senderId: adminId,
  type: 'system',
});
```

Problem: No message content — instructor gets empty notification.

Fix: Add a `message` field (check createAndEmitNotification signature for the correct field name):
```js
const statusText = decision === 'approved' ? 'approved and published' : 'returned for revisions';
await createAndEmitNotification({
  recipientId: course.instructor,
  senderId: adminId,
  type: 'system',
  message: `Your course "${course.title}" has been ${statusText}.`,
  link: `/courses/${course.slug}`,
});
```

Verify the notification service accepts `message` and `link` fields by reading backend/services/notificationService.js first.

After completing:
tick comment TASK-098 copilot --note "Quiz soft-delete preserves student attempts. ADMIN_IDS cached. Review notification includes course title and decision."
tick done TASK-098 copilot
```

---

### STEP 6 · TASK-099 — Frontend Component Extraction (Largest Files)
**Agent**: 🔵 OPUS (or 🟢 SONNET)
**Priority**: 🟡 Warning
**Wait for**: TASK-098 done
**TICK before starting**:
```
tick add "Refactor: extract sub-components from large course pages" --priority high --tags "phase2,frontend,refactor" --description "CreateCoursePage (1200 lines), QuizPlayerPage (900 lines), useCourses (900 lines) violate 300-line limit. Extract sub-components and split hooks."
tick claim TASK-099 copilot
```

---

**PROMPT TO SEND:**

```
TASK-099: Refactor oversized frontend course components.

Read the refactoring instructions: .github/instructions/refactoring.instructions.md

These files exceed the 300-line component limit and need extraction:

## 1. frontend/src/features/courses/useCourses.ts (~900 lines)
Split into 3 files:
- useCourses.ts — keep types + course browse/detail/CRUD hooks (useCoursesQuery, useCourseDetail, useCreateCourse, useUpdateCourse, useDeleteCourse, usePublishCourse, useFeaturedCourses)
- useCourseEnrollment.ts — enrollment + progress hooks (useEnrollInCourse, useCourseProgress, useUpdateProgress, useMyEnrolledCourses, useLessonContent)
- useCourseQuiz.ts — quiz hooks (useCreateQuiz, useStartQuiz, useSubmitQuiz, useQuizResults)
- useCourseAdmin.ts — admin hooks (useAdminCourses, useReviewCourse)

Re-export all hooks from a barrel file (useCourses.ts or index.ts) so existing imports don't break.

## 2. frontend/src/features/courses/CreateCoursePage.tsx (~1200 lines)
Extract into a components/ subdirectory:
- frontend/src/features/courses/components/ModuleEditor.tsx — module add/edit/delete UI
- frontend/src/features/courses/components/LessonEditor.tsx — lesson row with type selector, content, resources
- frontend/src/features/courses/components/PricingForm.tsx — pricing type + amount + currency fields
Keep CreateCoursePage.tsx as the orchestrator that imports these.

## 3. frontend/src/features/courses/QuizPlayerPage.tsx (~900 lines)
Extract:
- frontend/src/features/courses/components/QuestionBlock.tsx — renders single question (MCQ, true-false, short-answer)
- frontend/src/features/courses/components/QuizResultsScreen.tsx — post-submission results display

## Rules:
- All new files must have proper TypeScript types (no `any`)
- Existing imports throughout the codebase must still work — update import paths if needed
- Run `cd frontend && npm run lint` after to verify zero warnings
- Components should accept props, not reach into global state directly

After completing:
tick comment TASK-099 copilot --note "Extracted ModuleEditor, LessonEditor, PricingForm, QuestionBlock, QuizResultsScreen. Split useCourses into 4 focused hook files. All imports updated."
tick done TASK-099 copilot
```

---

## STAGE 4 — Test Coverage Gaps

> **Cover the critical paths that are untested.**

---

### STEP 7 · TASK-100 — Fill Test Gaps
**Agent**: 🔵 OPUS
**Priority**: 🟢 Suggestion
**Wait for**: TASK-099 done
**TICK before starting**:
```
tick add "Test: fill Phase 2 test coverage gaps" --priority medium --tags "phase2,backend,testing" --description "Add tests for maxStudents enforcement, quiz short-answer/essay grading, slug collision retry, archived course visibility."
tick claim TASK-100 copilot
```

---

**PROMPT TO SEND:**

```
TASK-100: Fill Phase 2 test coverage gaps identified in code review.

Read existing tests:
- backend/__tests__/courseService.test.js
- backend/__tests__/enrollmentService.test.js
- backend/__tests__/quizService.test.js
- backend/__tests__/smoke/phase2.smoke.test.js

Add these missing test cases:

## 1. backend/__tests__/enrollmentService.test.js — add:
- enrollInCourse rejects when maxStudents reached (400)
- enrollInCourse rejects when payment.user doesn't match enrolling user (402) — tests the TASK-094 fix
- updateProgress rejects on dropped/suspended enrollment (400) — tests the TASK-096 fix

## 2. backend/__tests__/quizService.test.js — add:
- submitQuiz grades short-answer correctly (case-insensitive match)
- submitQuiz marks essay/quran-recitation as isCorrect=false (manual grading needed)
- deleteQuiz soft-archives when attempts exist (TASK-098 fix)
- deleteQuiz hard-deletes when no attempts exist
- startQuiz ignores archived quizzes (status='active' filter)

## 3. backend/__tests__/courseService.test.js — add:
- Slug collision: two courses with same title get different slugs
- deleteCourse: archived course not visible in browseCourses (status filter)

## 4. backend/__tests__/smoke/phase2.smoke.test.js — add:
- maxStudents enforcement end-to-end
- Payment user mismatch rejection end-to-end

Follow existing test patterns (jest.mock for unit tests, mongodb-memory-server for smoke tests).

After completing:
tick comment TASK-100 copilot --note "Added tests: maxStudents enforcement, payment user verification, progress status guard, quiz grading edge cases, soft-delete, slug collision."
tick done TASK-100 copilot
```

---

## STAGE 5 — Final Verification & Phase 3 Gate

> **All fixes applied. Run verification before moving to Phase 3.**

---

### STEP 8 · TASK-101 — Final Verification
**Agent**: 🔵 OPUS
**Priority**: 🔴 Critical
**Wait for**: ALL previous tasks done
**TICK before starting**:
```
tick add "Verify: Phase 2.5 final check + Phase 3 gate" --priority urgent --tags "phase2,verification" --description "Run lint, tests, dev server, integrity check. Confirm all code-review findings fixed."
tick claim TASK-101 copilot
```

---

**PROMPT TO SEND:**

```
TASK-101: Final verification — confirm all Phase 2.5 fixes are clean and Phase 3 is ready.

Run these checks in order:

1. Frontend lint:
   cd frontend && npm run lint
   Must be zero warnings.

2. Frontend dev server:
   cd frontend && npm run dev
   Verify it starts without errors (check for the LoginPage registerForm fix specifically).

3. Backend tests:
   cd backend && npm test -- --runInBand
   All tests must pass including the new ones from TASK-100.

4. Integrity check:
   npm run check:integrity
   No orphan API calls or unconsumed routes.

5. Verify each fix from code review:
   - [ ] Payment query includes user filter (TASK-094)
   - [ ] Module routes have isScholar (TASK-094)
   - [ ] enrollInCourse uses transaction (TASK-095)
   - [ ] updateProgress uses $addToSet (TASK-096)
   - [ ] Model validators present (TASK-097)
   - [ ] Enrollment has student+status index (TASK-097)
   - [ ] Quiz soft-delete works (TASK-098)
   - [ ] ADMIN_IDS cached (TASK-098)
   - [ ] Review notification has content (TASK-098)
   - [ ] Large components extracted (TASK-099)

6. If all green, update the feature board:
   Edit .agents/feature-board.md — mark Phase 2.5 fixes as complete.

After completing:
tick comment TASK-101 copilot --note "All Phase 2.5 fixes verified. Lint clean, tests pass, integrity check green. Phase 3 gate open."
tick done TASK-101 copilot
```

---

## Summary of All Fixes

| # | Task | Severity | What |
|---|------|----------|------|
| 1 | TASK-094 | 🔴 Critical | Payment user verification + module route `isScholar` guard |
| 2 | TASK-095 | 🔴 Critical | Atomic enrollment with MongoDB transaction + maxStudents race fix |
| 3 | TASK-096 | 🟡 Warning | Atomic progress updates + dropped enrollment guard |
| 4 | TASK-097 | 🟡 Warning | Model min/max validators + missing enrollment index |
| 5 | TASK-098 | 🟡 Warning | Quiz soft-delete + ADMIN_IDS cache + notification content |
| 6 | TASK-099 | 🟡 Warning | Frontend component extraction (6 files too large) |
| 7 | TASK-100 | 🟢 Suggestion | Test coverage gaps (maxStudents, payment user, quiz grading) |
| 8 | TASK-101 | 🔴 Gate | Final verification — all checks green before Phase 3 |

### Already Fixed (Pre-Playbook)
- ✅ `LoginPage.tsx` — `registerForm` used before initialization (hook reordered)

### Deferred (Nice-to-Have, Not Blocking Phase 3)
- Slug uniqueness race condition (unique index catches it; add friendly retry later)
- Quiz route split inconsistency (cosmetic, works as-is)
- getLessonContent O(n) loop (fine at current scale)
- Frontend error boundaries on course pages (can add during Phase 3)

---

## After This Playbook

Once TASK-101 passes, proceed to **PHASE-3-PLAYBOOK.md** (Virtual Classroom with LiveKit + tldraw).
