# Phase 2 Playbook — Course System (Custom LMS)

> **Copy-paste prompts for each agent, in exact execution order.**
> Work through this document top to bottom. Each step tells you which tool/agent to use,
> what to wait for before moving on, and the exact prompt text to send.

---

## Agent Legend

| Symbol | Agent | Tool | Model |
|--------|-------|------|-------|
| 🔵 **OPUS** | `copilot` | GitHub Copilot | Claude Opus 4.6 |
| 🟡 **ANTIGRAVITY** | `antigravity` | Antigravity tool | Gemini 3.1 Pro |
| 🟢 **SONNET** | `copilot-2` | GitHub Copilot | Claude Sonnet 4.6 |

---

## Prerequisites

Phase 1 (Scholar Roles + Payment System) **must be complete** before starting Phase 2.
Verify with:
```
tick list --tag scholar --status done
tick list --tag payment --status done
```

Key Phase 1 artifacts Phase 2 depends on:
- `backend/middlewares/admin.js` — `isScholar`, `isScholarOrAdmin` middleware
- `backend/services/stripeService.js` — `createCheckoutSession` for paid courses
- `backend/models/paymentSchema.js` — payment records
- `backend/routes/webhookRoute.js` — Stripe webhooks (enrollment on payment)
- `packages/shared/src/schemas/` — barrel exports pattern
- `backend/models/userSchema.js` — `scholarProfile.totalStudents`, `totalCourses` fields

---

## Timeline Overview

```
Day 1       [OPUS]         Stage 1: Shared schemas
Day 1–2     [OPUS]         Stage 2: Backend models + courseAccess middleware
Day 2–5     [OPUS]         Stage 3: All backend APIs (4 parallel-eligible tasks)
            [ANTIGRAVITY]  Stage 3: All 5 prototype sets (parallel — start same day as Stage 3)
Day 5–6     [YOU]          Review all prototypes, pick 1 winner per set
Day 6–9     [SONNET]       Stage 4: Integrate chosen prototypes (6 tasks)
            [OPUS]         Stage 4: Write unit + smoke tests (3 tasks)
Day 9–10    [SONNET]       Stage 5: Docs, feature board, final commit
```

---

## STAGE 1 — Shared Schemas

> **OPUS only. No parallel work yet.**

---

### STEP 1 · TASK-045
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: Phase 1 complete (all Phase 1 tasks done)
**TICK before starting**:
```
tick claim TASK-045 copilot
```

---

**PROMPT TO SEND:**

```
You are working on DeenVerse (Islamic social platform). Read the contract before coding:
- .agents/contracts/course-system.md (full file — especially Section 5: Shared Schemas)

TASK-045: Create shared Zod schemas for the Course System (Phase 2).

Create packages/shared/src/schemas/course.ts with these exports:

1. Enums:
   - courseCategoryEnum: z.enum(['quran', 'hadith', 'fiqh', 'aqeedah', 'seerah', 'arabic', 'tajweed', 'tafseer', 'dawah', 'other'])
   - courseLevelEnum: z.enum(['beginner', 'intermediate', 'advanced'])
   - courseTypeEnum: z.enum(['self-paced', 'instructor-led', 'hybrid'])
   - courseStatusEnum: z.enum(['draft', 'pending-review', 'published', 'archived'])
   - lessonTypeEnum: z.enum(['video', 'text', 'quiz', 'live-session', 'assignment'])

2. Sub-schemas:
   - coursePricingSchema: z.object({ type: z.enum(['free','paid','subscription']), amount: z.number().min(0).optional(), currency: z.string().default('usd').optional() })
   - courseLessonSchema: z.object({ title: z.string().min(1), type: lessonTypeEnum, content: z.any().optional(), duration: z.number().min(0).optional(), order: z.number().min(0), isFree: z.boolean().optional(), resources: z.array(z.object({ name: z.string(), url: z.string(), type: z.string() })).optional() })
   - courseModuleSchema: z.object({ title: z.string().min(1), description: z.string().optional(), order: z.number().min(0), lessons: z.array(courseLessonSchema) })

3. Main schemas:
   - createCourseSchema: z.object({ title: z.string().min(3).max(200), description: z.string().min(20), shortDescription: z.string().max(200).optional(), category: courseCategoryEnum, level: courseLevelEnum, language: z.string().default('en'), type: courseTypeEnum, pricing: coursePricingSchema, modules: z.array(courseModuleSchema).optional(), requirements: z.array(z.string()).optional(), learningOutcomes: z.array(z.string()).optional(), tags: z.array(z.string()).optional(), maxStudents: z.number().min(0).optional(), certificateOnCompletion: z.boolean().optional() })
   - updateCourseSchema: createCourseSchema.partial()
   - enrollCourseSchema: z.object({ paymentSessionId: z.string().optional() })
   - quizAnswerSchema: z.object({ questionIndex: z.number(), answer: z.any() })
   - submitQuizSchema: z.object({ attemptId: z.string(), answers: z.array(quizAnswerSchema) })
   - courseReviewSchema: z.object({ decision: z.enum(['approved','rejected']), reason: z.string().optional() })
   - courseFiltersSchema: z.object({ category: courseCategoryEnum.optional(), level: courseLevelEnum.optional(), type: courseTypeEnum.optional(), search: z.string().optional(), sort: z.enum(['popular','newest','rating','price-low','price-high']).optional(), page: z.coerce.number().min(1).optional(), limit: z.coerce.number().min(1).max(50).optional() })

4. Export inferred types for all schemas (e.g., export type CreateCourse = z.infer<typeof createCourseSchema>).

5. Update packages/shared/src/schemas/index.ts to export from './course'.
6. Update packages/shared/src/index.ts if needed.

After completing:
tick comment TASK-045 copilot --note "Shared Zod schemas created for course system: enums, pricing, lesson, module, create/update course, enrollment, quiz, filters, review schemas + types."
tick done TASK-045 copilot
```

---

## STAGE 2 — Backend Models + Middleware

> **OPUS only. Builds the data foundation.**

---

### STEP 2 · TASK-046
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: STEP 1 (TASK-045) done
**TICK before starting**:
```
tick claim TASK-046 copilot
```

---

**PROMPT TO SEND:**

```
TASK-046: Create Course, Enrollment, Quiz, and QuizAttempt models + courseAccess middleware.

Read first:
- .agents/contracts/course-system.md (Section 3: Data Model Changes — full schemas)
- backend/models/postSchema.js (for code style reference — indexes, timestamps pattern)
- backend/models/paymentSchema.js (Phase 1 model for reference)
- backend/middlewares/admin.js (middleware pattern reference)

Create these files:

1. backend/models/courseSchema.js
   Full schema from the contract. Key details:
   - instructor: ObjectId ref User, required
   - slug: String, unique, lowercase (auto-generated from title via slugify in pre-save hook)
   - pricing subdocument with type/amount/currency/stripePriceId
   - modules array with nested lessons array (each lesson has type enum, content Mixed, order, isFree)
   - schedule subdocument for instructor-led courses
   - status enum: ['draft','pending-review','published','archived'], default 'draft'
   - rating: { average: Number default 0, count: Number default 0 }
   - enrollmentCount: Number default 0
   - reviewedBy, reviewedAt, rejectionReason for admin review
   - Indexes: { slug: 1 } unique, { instructor: 1 }, { status: 1, category: 1 }, { tags: 1 }
   - timestamps: true
   Install slugify if not already installed: npm install slugify --workspace=backend

2. backend/models/enrollmentSchema.js
   - student: ObjectId ref User, required
   - course: ObjectId ref Course, required
   - status enum: ['active','completed','dropped','suspended'], default 'active'
   - progress: { completedLessons: [String], currentModule: Number default 0, currentLesson: Number default 0, percentComplete: Number default 0, lastAccessedAt: Date }
   - payment: { stripePaymentId: String, amount: Number, paidAt: Date }
   - certificate: { issued: Boolean default false, issuedAt: Date, certificateId: String }
   - notes: [{ lessonId: String, content: String, createdAt: Date }]
   - enrolledAt: Date default Date.now, completedAt: Date
   - Compound unique index: { student: 1, course: 1 }
   - Additional index: { course: 1, status: 1 }
   - timestamps: true

3. backend/models/quizSchema.js
   - course: ObjectId ref Course, required
   - lesson: String (lesson identifier within course)
   - title: String required
   - type enum: ['quiz','exam','certification-exam'], default 'quiz'
   - timeLimit: Number default 0 (minutes, 0 = unlimited)
   - passingScore: Number required (percentage 0-100)
   - maxAttempts: Number default 3
   - questions array: [{ text: String required, type: enum ['mcq','true-false','short-answer','essay','quran-recitation'] required, options: [{ text: String, isCorrect: Boolean }], points: Number default 1, explanation: String, ayahRef: String }]
   - shuffleQuestions: Boolean default true
   - showCorrectAnswers: Boolean default true
   - Indexes: { course: 1 }, { course: 1, lesson: 1 }
   - timestamps: true

4. backend/models/quizAttemptSchema.js
   - student: ObjectId ref User, required
   - quiz: ObjectId ref Quiz, required
   - answers: [{ questionIndex: Number, answer: Mixed, isCorrect: Boolean }]
   - score: Number
   - passed: Boolean
   - startedAt: Date default Date.now
   - submittedAt: Date
   - attempt: Number required
   - Indexes: { student: 1, quiz: 1 }, { quiz: 1, passed: 1 }
   - timestamps: true

5. backend/middlewares/courseAccess.js
   Export: isEnrolled middleware
   - Extracts course slug from req.params.slug
   - Looks up Enrollment for req.user._id + course._id with status 'active'
   - If enrolled: attach enrollment to req.enrollment, call next()
   - If not enrolled: check if current lesson is a free preview (isFree: true) — if so, allow through
   - Otherwise: throw AppError(403, 'You must be enrolled in this course')
   Follow same pattern as isScholar middleware.

After completing:
tick comment TASK-046 copilot --note "Course, Enrollment, Quiz, QuizAttempt models created. courseAccess middleware with isEnrolled added. slugify installed."
tick done TASK-046 copilot
```

---

## STAGE 3 — Backend APIs + Prototypes (Run in Parallel)

> **Start OPUS on backend APIs AND start ANTIGRAVITY on all prototypes at the same time.**
> **Prototypes use only mocked data — fully independent from backend work.**

---

### STEP 3A · TASK-047 (OPUS — Course CRUD API)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: STEP 2 (TASK-046) done
**TICK before starting**:
```
tick claim TASK-047 copilot
```

---

**PROMPT TO SEND:**

```
TASK-047: Build the Course CRUD API (routes → controller → service).

Read first:
- .agents/contracts/course-system.md (Section 2: API Contract — Course CRUD + Module management)
- backend/routes/scholarRoute.js (for route pattern reference)
- backend/controller/scholarController.js (for controller code style)
- backend/services/scholarService.js (for service code style)
- backend/models/courseSchema.js (just created in TASK-046)
- backend/index.js (to understand route mounting)
- backend/utils/AppError.js

Create these files following route → controller → service pattern:

1. backend/routes/courseRoute.js
   Mount at /api/v1/courses in backend/index.js
   Routes:
   - POST   /                    → isAuthenticated, isScholar → courseController.createCourse
   - GET    /                    → public → courseController.browseCourses
   - GET    /featured            → public → courseController.getFeaturedCourses
   - GET    /my-courses          → isAuthenticated → courseController.getMyCourses
   - GET    /teaching            → isAuthenticated, isScholar → courseController.getMyTeaching
   - GET    /:slug               → public → courseController.getCourseBySlug
   - PUT    /:slug               → isAuthenticated → courseController.updateCourse (ownership check in service)
   - DELETE /:slug               → isAuthenticated → courseController.deleteCourse (ownership check in service)
   - PUT    /:slug/publish       → isAuthenticated → courseController.publishCourse (ownership check)
   - POST   /:slug/modules       → isAuthenticated → courseController.addModule (ownership check)
   - PUT    /:slug/modules/:moduleIndex → isAuthenticated → courseController.updateModule (ownership check)
   - DELETE /:slug/modules/:moduleIndex → isAuthenticated → courseController.deleteModule (ownership check)

   IMPORTANT: Place /featured, /my-courses, /teaching BEFORE /:slug to avoid slug collision.

2. backend/controller/courseController.js
   Thin controller — validates input using createCourseSchema/updateCourseSchema patterns (express-validator or manual validation since backend is JS), calls service, sends response.
   For browse: extract query params (category, level, type, search, sort, page, limit) and pass to service.

3. backend/services/courseService.js
   Implement:
   - createCourse(userId, data): create course with instructor=userId, auto-generate slug from title using slugify. Verify user is scholar/admin.
   - browseCourses(filters): paginated query on published courses. Support: category filter, level filter, type filter, text search ($regex on title+description or $text if text index), sort (popular=enrollmentCount desc, newest=createdAt desc, rating=rating.average desc, price-low/high). Return { courses, pagination: { page, limit, total, totalPages } }.
   - getCourseBySlug(slug, userId): return course with instructor populated (name, username, avatar, scholarProfile). If userId provided, also check enrollment status (isEnrolled boolean).
   - getFeaturedCourses(): top 8 published courses by (enrollmentCount * 0.7 + rating.average * 0.3), cached in Redis for 1 hour if cacheService exists.
   - getMyCourses(userId, status, page, limit): paginated Enrollment query for student.
   - getMyTeaching(userId, status, page, limit): paginated Course query where instructor=userId.
   - updateCourse(userId, slug, data): verify ownership (instructor === userId OR user is admin), update fields. Cannot update a published course's pricing.type.
   - deleteCourse(userId, slug): verify ownership, soft-delete (set status='archived') if has enrollments, hard-delete if no enrollments.
   - publishCourse(userId, slug): verify ownership, check at least 1 module with 1 lesson, set status='pending-review'.
   - addModule(userId, slug, moduleData): verify ownership, push module to course.modules, set module.order = modules.length.
   - updateModule(userId, slug, moduleIndex, data): verify ownership, update specific module.
   - deleteModule(userId, slug, moduleIndex): verify ownership, splice module, re-order remaining.

   Use AppError for all error cases. Use .lean() for read queries. Populate instructor on browse/detail.

After completing:
tick comment TASK-047 copilot --note "Course CRUD API complete: create, browse, detail, update, delete, publish, module management. Slug auto-generation. Ownership checks. Pagination + filtering."
tick done TASK-047 copilot
```

---

### STEP 3B · TASK-048 (OPUS — Enrollment API)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-046 done (can run right after TASK-047, or in parallel if on different service file)
**TICK before starting**:
```
tick claim TASK-048 copilot
```

---

**PROMPT TO SEND:**

```
TASK-048: Build the Enrollment API with progress tracking.

Read first:
- .agents/contracts/course-system.md (Section 2: Enrollment endpoints)
- backend/models/enrollmentSchema.js (just created)
- backend/models/courseSchema.js (for course lookup + enrollmentCount)
- backend/middlewares/courseAccess.js (isEnrolled middleware)
- backend/services/stripeService.js (for payment verification if needed)

Add these routes to backend/routes/courseRoute.js (extend the existing file):
- POST   /:slug/enroll          → isAuthenticated → courseController.enrollInCourse
- GET    /:slug/progress        → isAuthenticated, isEnrolled → courseController.getCourseProgress
- PUT    /:slug/progress        → isAuthenticated, isEnrolled → courseController.updateProgress
- GET    /:slug/lessons/:lessonId → isAuthenticated → courseController.getLessonContent (isEnrolled OR isFree check in service)

Add to backend/controller/courseController.js:
- enrollInCourse, getCourseProgress, updateProgress, getLessonContent

Add to backend/services/courseService.js (extend):
- enrollInCourse(userId, slug, paymentSessionId?):
  1. Look up course by slug. 404 if not found or not published.
  2. Check if already enrolled (Enrollment exists with active status) → 400 'Already enrolled'.
  3. If course.pricing.type === 'free' (or course.autoEnroll): create Enrollment directly.
  4. If course.pricing.type === 'paid': verify paymentSessionId exists, look up Payment record by stripeSessionId, verify it's completed and matches this course. If not verified → 402 'Payment required'.
  5. Create Enrollment with status='active'. Increment course.enrollmentCount. Increment instructor.scholarProfile.totalStudents.
  6. Return enrollment.

- getCourseProgress(enrollmentFromReq): return enrollment progress fields from req.enrollment (attached by isEnrolled middleware).

- updateProgress(userId, slug, lessonId):
  1. Get enrollment from req or look up.
  2. Add lessonId to completedLessons (if not already there).
  3. Count total lessons across all modules in the course.
  4. Recalculate percentComplete = (completedLessons.length / totalLessons) * 100.
  5. Update lastAccessedAt.
  6. If percentComplete === 100: set status='completed', completedAt=Date.now().
  7. Save and return updated enrollment.

- getLessonContent(userId, slug, lessonId):
  1. Look up course by slug.
  2. Find the lesson in modules[].lessons[] matching lessonId (by _id or order).
  3. If lesson.isFree: return content (no enrollment needed).
  4. Else: check enrollment exists → 403 if not enrolled.
  5. Return lesson content + nextLesson + prevLesson navigation info.

After completing:
tick comment TASK-048 copilot --note "Enrollment API complete: enroll (free/paid), progress tracking, lesson completion with percentComplete recalc, lesson content serving."
tick done TASK-048 copilot
```

---

### STEP 3C · TASK-049 (OPUS — Quiz Engine API)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-046 done (can run after TASK-048 or in parallel)
**TICK before starting**:
```
tick claim TASK-049 copilot
```

---

**PROMPT TO SEND:**

```
TASK-049: Build the Quiz Engine API.

Read first:
- .agents/contracts/course-system.md (Section 2: Quiz endpoints, Section 6: Security — quiz integrity)
- backend/models/quizSchema.js
- backend/models/quizAttemptSchema.js
- backend/models/courseSchema.js (lessons can be type 'quiz', linking to Quiz documents)

Create backend/routes/quizRoute.js mounted at /api/v1/quizzes in backend/index.js:
- POST   /:quizId/start    → isAuthenticated → quizController.startQuiz
- POST   /:quizId/submit   → isAuthenticated → quizController.submitQuiz
- GET    /:quizId/results   → isAuthenticated → quizController.getQuizResults

Scholar quiz management (add to courseRoute.js or keep in quizRoute.js):
- POST   /api/v1/courses/:slug/quizzes        → isAuthenticated, isScholar → quizController.createQuiz (ownership check)
- PUT    /api/v1/quizzes/:quizId               → isAuthenticated, isScholar → quizController.updateQuiz (ownership check)
- DELETE /api/v1/quizzes/:quizId               → isAuthenticated, isScholar → quizController.deleteQuiz (ownership check)

Create backend/controller/quizController.js and backend/services/quizService.js:

- createQuiz(userId, slug, quizData): verify user owns the course, create Quiz document linked to course + optional lesson.
- updateQuiz(userId, quizId, data): verify ownership (quiz.course.instructor === userId), update.
- deleteQuiz(userId, quizId): verify ownership, delete.

- startQuiz(userId, quizId):
  1. Look up quiz. Find enrollment for user + quiz.course → 403 if not enrolled.
  2. Count existing QuizAttempts for this user+quiz. If >= quiz.maxAttempts → 400 'Maximum attempts reached'.
  3. Create QuizAttempt with attempt = existingCount + 1, startedAt = now.
  4. Return questions with correct answers STRIPPED (remove isCorrect from MCQ options, remove explanation). Include timeLimit + startedAt so client can show countdown.

- submitQuiz(userId, quizId, attemptId, answers):
  1. Look up QuizAttempt by attemptId. Verify it belongs to userId. 404 if not found.
  2. Verify not already submitted (submittedAt is null).
  3. If quiz.timeLimit > 0: check (now - startedAt) <= (timeLimit * 60 + 30) seconds. If exceeded → 400 'Time limit exceeded'.
  4. Grade each answer:
     - MCQ: compare selected option index to isCorrect
     - true-false: exact match
     - short-answer: case-insensitive string comparison (basic — scholar can review later)
     - essay/quran-recitation: mark as 'pending-review', don't auto-grade
  5. Calculate score: sum of points for correct answers / total points * 100.
  6. Set passed = score >= quiz.passingScore.
  7. Save answer results, score, passed, submittedAt to QuizAttempt.
  8. If quiz.showCorrectAnswers: include correct answers + explanations in response.
  9. Return { score, passed, attempt }.

- getQuizResults(userId, quizId):
  1. Get all QuizAttempts for user+quiz.
  2. Return { attempts, bestScore: max(scores), passed: any attempt.passed }.

After completing:
tick comment TASK-049 copilot --note "Quiz engine API complete: CRUD for scholars, start/submit/results for students. Server-side grading, time enforcement, max attempts, answer stripping."
tick done TASK-049 copilot
```

---

### STEP 3D · TASK-050 (OPUS — Discovery + Admin Review API)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-047 done
**TICK before starting**:
```
tick claim TASK-050 copilot
```

---

**PROMPT TO SEND:**

```
TASK-050: Build Discovery endpoints and Admin Course Review API.

Read first:
- .agents/contracts/course-system.md (Section 2: Discovery + Admin endpoints)
- backend/services/courseService.js (already has getFeaturedCourses, extend it)
- backend/routes/courseRoute.js (already has GET /featured)

Add admin routes — either extend courseRoute.js or create a dedicated section:
- GET    /api/v1/admin/courses                → isAuthenticated, isAdmin → courseController.getAdminCourses
- PUT    /api/v1/admin/courses/:slug/review   → isAuthenticated, isAdmin → courseController.reviewCourse

Add to backend/controller/courseController.js:
- getAdminCourses, reviewCourse

Add to backend/services/courseService.js:
- getAdminCourses(status, page, limit): paginated courses filtered by status (default 'pending-review'). Include instructor info (name, avatar). Sort by createdAt desc.
- reviewCourse(adminId, slug, decision, reason):
  1. Look up course by slug. 404 if not found.
  2. Verify status === 'pending-review'. 400 if not.
  3. If decision === 'approved': set status='published', reviewedBy=adminId, reviewedAt=now. Increment instructor.scholarProfile.totalCourses.
  4. If decision === 'rejected': set status='draft', rejectionReason=reason, reviewedBy=adminId, reviewedAt=now.
  5. Send notification to instructor (use notificationService if it exists — 'Your course X has been approved/rejected').
  6. Return updated course.

After completing:
tick comment TASK-050 copilot --note "Admin course review API complete: list pending courses, approve/reject with notifications. Featured endpoint enhanced."
tick done TASK-050 copilot
```

---

### STEP 3E-1 · TASK-051 (ANTIGRAVITY — Course Discovery Prototypes)
**Agent**: 🟡 ANTIGRAVITY
**Wait for**: TASK-045 (shared schemas done — contract exists)
**Start in parallel with**: TASK-047, 048, 049, 050

---

**PROMPT TO SEND TO ANTIGRAVITY:**

```
Task: Create 5 distinct frontend prototype variants for the Course Discovery/Browse page.

Context: DeenVerse is an Islamic education platform. Users browse and discover courses created by verified scholars. Read the contract first: .agents/contracts/course-system.md (Section 4: Frontend Requirements).

Create in: frontend/src/features/courses/prototypes/
Files to create:
- DiscoveryPrototype1.tsx through DiscoveryPrototype5.tsx (5 distinct designs)
- PrototypesViewer.tsx (toolbar to switch between prototypes)
Temp route: /prototypes/course-discovery

Mock data (use for all prototypes):
- 12 courses across categories (Quran, Hadith, Fiqh, Arabic, Tajweed, Tafseer)
- Mix of free and paid ($29-$99), self-paced and instructor-led
- 3 levels: beginner, intermediate, advanced
- Each course: title, instructor name+avatar, thumbnail placeholder, rating (3.5-5.0), enrollmentCount (12-850), category badge, level badge, pricing

Explore these 5 distinct approaches:
1. Grid + Filter Sidebar (Udemy-style): left sidebar with category/level/type/price checkboxes, right grid of course cards, search bar on top
2. Netflix-style Carousels: horizontal scroll rows per category ("Popular Fiqh", "New Tajweed", "Free Courses"), hero banner for featured course
3. Search-first: prominent search bar, instant result cards below, category tag cloud, recent/popular tabs
4. Masonry Cards: Pinterest-style varying-height cards, infinite scroll feel, filter pills on top, category color-coding
5. Hub Page: hero section with stats (500+ courses, 120 scholars), category icon grid (click → filtered view), trending row, "Start Learning" CTA

Each design must include:
- Course card: thumbnail, title, instructor name, rating stars, enrollment count, price badge, level pill
- Category filter mechanism
- Search input
- Responsive design (mobile-first)
- Islamic design touches (green/gold accents, subtle geometric patterns or calligraphy)

Rules:
- Frontend only — all data mocked inline (no API calls)
- Use existing design system: shadcn/ui, Tailwind CSS v4, Lucide React, Framer Motion
- Show empty state and loading skeleton state
```

---

### STEP 3E-2 · TASK-052 (ANTIGRAVITY — Course Detail Prototypes)
**Agent**: 🟡 ANTIGRAVITY
**Wait for**: TASK-045 done
**Start in parallel with**: STEP 3E-1 or after

---

**PROMPT TO SEND TO ANTIGRAVITY:**

```
Task: Create 5 distinct frontend prototype variants for the Course Detail page.

Context: This page shows full information about a single course — users decide whether to enroll here. Read: .agents/contracts/course-system.md

Create in: frontend/src/features/courses/prototypes/
Files: DetailPrototype1.tsx through DetailPrototype5.tsx
Add to PrototypesViewer.tsx with a toggle to switch between "Discovery" and "Detail" prototypes.
Temp route: /prototypes/course-detail

Mock data for one course:
- Title: "Tafseer Al-Baqarah: Understanding the Longest Surah"
- Instructor: Sheikh Ahmad Al-Farooqi (verified scholar, 4.8 rating, 1200 students, Tafseer specialist)
- Category: Tafseer, Level: Intermediate, Type: Self-Paced
- Price: $49.99
- Thumbnail: placeholder image
- 5 modules with 3-4 lessons each (mix of video/text/quiz types), total 18 lessons, ~12 hours
- Requirements: ["Basic Arabic reading", "Familiarity with Quran"]
- Learning outcomes: ["Understand themes of Al-Baqarah", "Apply tafseer methodology", "Connect ayahs to daily life"]
- Rating: 4.8 (234 reviews), 856 enrolled
- Tags: ["tafseer", "quran", "al-baqarah"]

Explore these 5 distinct approaches:
1. Long-scroll Landing Page (Udemy-style): hero with thumbnail+title+price+enroll CTA, then what you'll learn, course content accordion, instructor section, reviews, related courses
2. Tabbed Layout: sticky header (title+price+enroll), tabs: Overview | Syllabus | Reviews | Instructor
3. Split Panel: left side = course info + enroll card (sticky), right side = scrollable syllabus + reviews
4. Video Hero: large video/thumbnail header with play button, floating enroll card overlapping hero, content below
5. Minimalist Single-Column: clean typography, generous whitespace, inline module expansion, bottom fixed enroll bar (mobile-friendly)

Each design must include:
- Enroll CTA button (shows "Enroll Free" or "Enroll — $49.99" or "Continue Learning" based on mock state)
- Module/lesson list (expandable, shows lesson type icon + duration)
- Instructor card (avatar, name, badge, specialties, rating)
- Rating display + review snippets
- Requirements + learning outcomes lists
- Course metadata (duration, lessons count, level, language)

Rules: frontend only, all mocked, existing design system (shadcn/ui, Tailwind, Lucide, Framer Motion).
```

---

### STEP 3E-3 · TASK-053 (ANTIGRAVITY — Course Player Prototypes)
**Agent**: 🟡 ANTIGRAVITY
**Wait for**: TASK-045 done

---

**PROMPT TO SEND TO ANTIGRAVITY:**

```
Task: Create 5 distinct prototype variants for the Course Player (lesson viewer).

Context: After enrolling, students access lessons through this player interface. It shows video/text content, module navigation, and progress. Read: .agents/contracts/course-system.md

Create in: frontend/src/features/courses/prototypes/
Files: PlayerPrototype1.tsx through PlayerPrototype5.tsx
Add to PrototypesViewer.tsx. Temp route: /prototypes/course-player

Mock data:
- Course: "Tajweed Fundamentals" with 4 modules, 16 lessons
- Current lesson: Module 2, Lesson 3 "Rules of Noon Sakinah" (video type, 18 min)
- Progress: 7/16 lessons complete (43%)
- Modules: Introduction (4 lessons ✅), Noon Sakinah Rules (4 lessons, 2 ✅), Meem Rules (4 lessons), Review (4 lessons)
- Mix of lesson types: video (placeholder), text (markdown), quiz (link)
- Student notes for current lesson (2 mocked notes)

Explore these 5 distinct approaches:
1. Sidebar + Main (Coursera-style): collapsible left sidebar with module tree (checkmarks for completed), main area shows video/text content, bottom bar with prev/next + complete button
2. Collapsible Drawer: full-width content area, floating drawer from left edge (drag to expand) shows module list + progress ring, top bar with course title + progress percentage
3. Full-Width Video Focus: video takes 70% height, below: lesson title + description + notes, module list as bottom sheet (mobile) or right panel (desktop), minimal chrome
4. Split View: top half = video/content, bottom half = tabbed panel (Notes | Discussion | Resources), sidebar collapses to icon rail
5. Focus Mode: single-column, no sidebar by default, "Show Modules" button reveals overlay, emphasis on content readability, auto-play next with countdown toast

Each prototype must include:
- Video player placeholder (16:9 with play button overlay)
- Text lesson rendering area
- Module sidebar/navigation with progress indicators (checkmarks, progress bar)
- Lesson completion button ("Mark as Complete")
- Previous/Next lesson navigation
- Progress indicator (percentage or ring)
- Notes section (add/view notes for current lesson)

Rules: frontend only, mocked data, existing design system. Responsive — should work on mobile.
```

---

### STEP 3E-4 · TASK-054 (ANTIGRAVITY — Course Builder Prototypes)
**Agent**: 🟡 ANTIGRAVITY
**Wait for**: TASK-045 done

---

**PROMPT TO SEND TO ANTIGRAVITY:**

```
Task: Create 5 distinct prototype variants for the Course Builder (scholar creates courses).

Context: Verified scholars use this interface to create and structure their courses. It's the most complex form in the platform — needs to handle course info, modules with nested lessons, pricing, and preview. Read: .agents/contracts/course-system.md

Create in: frontend/src/features/courses/prototypes/
Files: BuilderPrototype1.tsx through BuilderPrototype5.tsx
Add to PrototypesViewer.tsx. Temp route: /prototypes/course-builder

Mock initial state: empty course creation form. Also show a "editing existing course" state with pre-filled data.

Explore these 5 distinct approaches:
1. Multi-Step Wizard (4 steps): Step 1: Basic Info (title, description, category, level, thumbnail) → Step 2: Modules & Lessons (drag-drop builder) → Step 3: Pricing & Settings → Step 4: Preview & Publish. Progress bar, back/next/save draft buttons.
2. Single-Page Sections: all sections visible, scrollspy nav on left, fill sections top-down, inline validation, floating "Save Draft" and "Submit for Review" buttons
3. Drag-Drop Module Builder: left panel = module list (draggable), right panel = selected module detail with draggable lesson cards, top = course info in collapsible header, bottom = pricing bar
4. Notion-Style Editor: markdown/block-based content creation, type "/" for commands (add module, add quiz, add video), inline WYSIWYG, minimal UI chrome, AI-assisted description generation placeholder
5. Template-Based Quick Start: start by choosing a template (e.g., "4-Week Quran Course", "Self-Paced Fiqh Series", "Blank Course"), template pre-fills structure, scholar fills in content. Dashboard-style editing.

Each prototype must include:
- Course info fields: title, description (rich text or textarea), short description, category dropdown, level dropdown, type selector, language
- Thumbnail upload area (placeholder, drag-drop zone)
- Module list with add/remove/reorder
- Lesson list within each module with add/remove/reorder + type selection (video/text/quiz/assignment)
- Pricing configuration: free/paid toggle, price input, currency
- Settings: maxStudents, certificateOnCompletion toggle
- Requirements and learning outcomes (dynamic list - add/remove items)
- Tags input
- Action buttons: Save Draft, Submit for Review, Preview
- Validation feedback (required field indicators)

Rules: frontend only, mocked data, existing design system (shadcn/ui, Tailwind, Lucide, Framer Motion). Handle both create and edit states.
```

---

### STEP 3E-5 · TASK-055 (ANTIGRAVITY — Quiz Player Prototypes)
**Agent**: 🟡 ANTIGRAVITY
**Wait for**: TASK-045 done

---

**PROMPT TO SEND TO ANTIGRAVITY:**

```
Task: Create 3 distinct prototype variants for the Quiz/Assessment Player.

Context: Students take quizzes after lessons or as module/course assessments. Quizzes can be timed. Read: .agents/contracts/course-system.md

Create in: frontend/src/features/courses/prototypes/
Files: QuizPrototype1.tsx through QuizPrototype3.tsx
Add to PrototypesViewer.tsx. Temp route: /prototypes/quiz-player

Mock data:
- Quiz: "Noon Sakinah Rules Assessment" — 10 questions, 15 min time limit, passing score 70%
- Questions mix: 6 MCQ (4 options each), 2 true/false, 1 short-answer, 1 Quran reference (which rule applies to this ayah?)
- Show both "in-progress" state and "results" state

Explore these 3 distinct approaches:
1. One-at-a-Time: single question per page, progress bar on top, countdown timer, nav dots to jump between questions, "Mark for Review" flag, submit confirmation dialog, results page with score breakdown
2. All-Visible Scroll: all questions visible in a scrollable list, floating timer card in corner, question nav sidebar (jump to #), auto-save answers, submit button at bottom, results below each question after submission
3. Exam Mode: full-screen focus, no distractions, prominent countdown timer, question number in large font, focus-lock warning if user tries to leave tab, final review screen before submit, detailed results page with correct answers + explanations

Each must include:
- MCQ rendering (radio buttons, 4 options, select one)
- True/false rendering (two buttons)
- Short-answer rendering (text input)
- Timer display (countdown from timeLimit)
- Progress indicator (X of Y answered)
- Submit button with confirmation
- Results page: score percentage, pass/fail badge, per-question result (correct/wrong with explanation)
- Attempt info: "Attempt 1 of 3"

Rules: frontend only, mocked data, existing design system. Show question transitions with Framer Motion.
```

---

## STAGE 3 → STAGE 4 GATE: Your Review

> **You must do this before any SONNET integration steps.**
> Open each prototype set at these routes and pick ONE winner per set:

| Route | Pick from | For Task |
|-------|-----------|----------|
| `/prototypes/course-discovery` | DiscoveryPrototype 1–5 | TASK-056 |
| `/prototypes/course-detail` | DetailPrototype 1–5 | TASK-057 |
| `/prototypes/course-player` | PlayerPrototype 1–5 | TASK-058 |
| `/prototypes/course-builder` | BuilderPrototype 1–5 | TASK-059 |
| `/prototypes/quiz-player` | QuizPrototype 1–3 | TASK-060 |

Note your choices (e.g., "Discovery: 2, Detail: 4, Player: 1, Builder: 3, Quiz: 2") before proceeding.

---

## STAGE 4 — Frontend Integration (Sonnet) + Testing (Opus)

> **Run SONNET integration and OPUS tests in parallel.**
> **SONNET handles 6 frontend integration tasks. OPUS handles 3 testing tasks.**

---

### STEP 4A · TASK-056 (SONNET — Integrate Course Discovery Page)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-047 done + TASK-051 done + you've picked a prototype
**TICK before starting**:
```
tick claim TASK-056 copilot-2
```

---

**PROMPT TO SEND (fill in `[N]` with your chosen prototype number):**

```
TASK-056: Promote Course Discovery Prototype [N] to production.

Read first:
- .agents/contracts/course-system.md (Section 4: Frontend Requirements)
- frontend/src/features/courses/prototypes/DiscoveryPrototype[N].tsx (the chosen prototype)
- frontend/src/lib/api.ts (Axios instance for API calls)
- frontend/src/stores/authStore.ts (user/auth shape)

Do the following:

1. Create frontend/src/features/courses/CoursesPage.tsx
   Promote the chosen prototype design. Replace all mocked data + fake handlers with real hooks.

2. Create frontend/src/features/courses/useCourses.ts with TanStack Query hooks:
   - useCourses(filters): GET /api/v1/courses?category=...&level=...&search=...&page=...
   - useFeaturedCourses(): GET /api/v1/courses/featured
   Use types from @deenverse/shared (CourseCategory, CourseLevel, CourseType, CourseFilters).

3. Register route in frontend router: /courses → CoursesPage (lazy-loaded, public — no AuthGuard needed)

4. Add a "Courses" or "Learn" link in the main navigation/sidebar (find the right place by reading existing nav components).

5. Delete DiscoveryPrototype files from prototypes folder (keep other prototype files).

After completing:
tick comment TASK-056 copilot-2 --note "Course Discovery page integrated. useCourses hook created with filters + featured. Route /courses live. Nav link added."
tick done TASK-056 copilot-2
```

---

### STEP 4B · TASK-057 (SONNET — Integrate Course Detail Page)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-047 done + TASK-052 done + you've picked a prototype
**TICK before starting**:
```
tick claim TASK-057 copilot-2
```

---

**PROMPT TO SEND (fill in `[N]`):**

```
TASK-057: Promote Course Detail Prototype [N] to production.

Read first:
- .agents/contracts/course-system.md
- frontend/src/features/courses/prototypes/DetailPrototype[N].tsx
- frontend/src/features/courses/useCourses.ts (already created in TASK-056)
- frontend/src/features/payments/usePayments.ts (useCreateCheckout from Phase 1)

Do the following:

1. Create frontend/src/features/courses/CourseDetailPage.tsx
   Promote chosen prototype. Replace mocked data with real hooks.

2. Add to useCourses.ts:
   - useCourseDetail(slug): GET /api/v1/courses/:slug — returns course + instructor + isEnrolled
   - useEnrollCourse(): useMutation → POST /api/v1/courses/:slug/enroll
     On success for free courses: invalidate queries, redirect to /courses/:slug/learn
     On success for paid courses: integrate with useCreateCheckout (redirect to Stripe)

3. Register route: /courses/:slug → CourseDetailPage (lazy-loaded, public)
   Course cards in CoursesPage should link to /courses/:slug.

4. Enroll CTA logic:
   - Not logged in: show "Sign Up to Enroll" → redirect to /login
   - Logged in + not enrolled + free: show "Enroll Free" → call useEnrollCourse
   - Logged in + not enrolled + paid: show "Enroll — $49.99" → call useCreateCheckout with courseSlug
   - Logged in + enrolled: show "Continue Learning" → navigate to /courses/:slug/learn

5. Delete DetailPrototype files.

After completing:
tick comment TASK-057 copilot-2 --note "Course Detail page integrated. Enroll CTA handles free/paid/enrolled states. Route /courses/:slug live."
tick done TASK-057 copilot-2
```

---

### STEP 4C · TASK-058 (SONNET — Integrate Course Player + Progress)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-048 done + TASK-053 done + you've picked a prototype
**TICK before starting**:
```
tick claim TASK-058 copilot-2
```

---

**PROMPT TO SEND (fill in `[N]`):**

```
TASK-058: Promote Course Player Prototype [N] to production.

Read first:
- .agents/contracts/course-system.md
- frontend/src/features/courses/prototypes/PlayerPrototype[N].tsx
- frontend/src/features/courses/useCourses.ts (extend)

Do the following:

1. Create frontend/src/features/courses/CoursePlayerPage.tsx
   Promote chosen prototype. Replace mocked data.

2. Add to useCourses.ts:
   - useCourseProgress(slug): GET /api/v1/courses/:slug/progress — returns enrollment with progress
   - useUpdateProgress(): useMutation → PUT /api/v1/courses/:slug/progress { lessonId, completed: true }
     On success: invalidate progress query (percentComplete updates)
   - useLessonContent(slug, lessonId): GET /api/v1/courses/:slug/lessons/:lessonId
     Returns lesson content + nextLesson + prevLesson

3. Register route: /courses/:slug/learn → CoursePlayerPage (lazy-loaded, AuthGuard)
   The "Continue Learning" link from CourseDetailPage navigates here.

4. Implement:
   - Module sidebar uses useCourseProgress to show checkmarks on completed lessons
   - "Mark as Complete" button calls useUpdateProgress
   - Auto-navigate to next lesson after completion (with toast notification)
   - Progress bar uses percentComplete from API
   - Lesson content area renders video embed or text/markdown based on lesson.type
   - Notes section: store locally for now (no API) using state/localStorage

5. Delete PlayerPrototype files.

After completing:
tick comment TASK-058 copilot-2 --note "Course Player integrated. Progress tracking, lesson completion, module sidebar with checkmarks. Route /courses/:slug/learn live."
tick done TASK-058 copilot-2
```

---

### STEP 4D · TASK-059 (SONNET — Integrate Course Builder)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-047 done + TASK-054 done + you've picked a prototype
**TICK before starting**:
```
tick claim TASK-059 copilot-2
```

---

**PROMPT TO SEND (fill in `[N]`):**

```
TASK-059: Promote Course Builder Prototype [N] to production.

Read first:
- .agents/contracts/course-system.md
- frontend/src/features/courses/prototypes/BuilderPrototype[N].tsx
- frontend/src/features/courses/useCourses.ts (extend)

Do the following:

1. Create frontend/src/features/courses/CreateCoursePage.tsx — new course creation
2. Create frontend/src/features/courses/EditCoursePage.tsx — edit existing course (pre-fills form with existing data)
3. Create frontend/src/features/courses/MyTeachingPage.tsx — scholar's course list with status badges + edit/delete/publish actions

4. Add to useCourses.ts:
   - useCreateCourse(): useMutation → POST /api/v1/courses
   - useUpdateCourse(): useMutation → PUT /api/v1/courses/:slug
   - useDeleteCourse(): useMutation → DELETE /api/v1/courses/:slug (confirm dialog before)
   - usePublishCourse(): useMutation → PUT /api/v1/courses/:slug/publish
   - useAddModule(): useMutation → POST /api/v1/courses/:slug/modules
   - useUpdateModule(): useMutation → PUT /api/v1/courses/:slug/modules/:idx
   - useDeleteModule(): useMutation → DELETE /api/v1/courses/:slug/modules/:idx
   - useMyTeaching(status, page): GET /api/v1/courses/teaching?status=...&page=...

5. Routes:
   /scholar/courses → MyTeachingPage (AuthGuard + scholar role check in component)
   /scholar/courses/new → CreateCoursePage (AuthGuard + scholar)
   /scholar/courses/:slug/edit → EditCoursePage (AuthGuard + scholar)

6. Add "My Courses" or "Teaching" link to scholar dashboard/nav (only visible if user.role === 'scholar').

7. Form validation: use createCourseSchema from @deenverse/shared with React Hook Form + zod resolver.

8. Delete BuilderPrototype files.

After completing:
tick comment TASK-059 copilot-2 --note "Course Builder integrated: create, edit, my teaching list, module management. Scholar routes live."
tick done TASK-059 copilot-2
```

---

### STEP 4E · TASK-060 (SONNET — Integrate Quiz Player + My Courses)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-049 done + TASK-055 done + you've picked a prototype
**TICK before starting**:
```
tick claim TASK-060 copilot-2
```

---

**PROMPT TO SEND (fill in `[N]`):**

```
TASK-060: Promote Quiz Player Prototype [N] + build My Courses page.

Read first:
- .agents/contracts/course-system.md
- frontend/src/features/courses/prototypes/QuizPrototype[N].tsx
- frontend/src/features/courses/useCourses.ts (extend)

Do the following:

1. Create frontend/src/features/courses/QuizPlayerPage.tsx
   Promote chosen quiz prototype. Wire to real hooks.

2. Create frontend/src/features/courses/MyCoursesPage.tsx
   Show enrolled courses with progress bars, continue button, completion status.

3. Add to useCourses.ts:
   - useStartQuiz(): useMutation → POST /api/v1/quizzes/:quizId/start
     Returns questions (no answers), timeLimit, startedAt. Start local countdown timer.
   - useSubmitQuiz(): useMutation → POST /api/v1/quizzes/:quizId/submit { attemptId, answers }
     Returns score, passed, correctAnswers (if available).
   - useQuizResults(quizId): GET /api/v1/quizzes/:quizId/results — all attempts + best score.
   - useMyCourses(status, page): GET /api/v1/courses/my-courses?status=...&page=...

4. Routes:
   /courses/:slug/quiz/:quizId → QuizPlayerPage (AuthGuard)
   /my-courses → MyCoursesPage (AuthGuard)

5. Quiz Player features:
   - Timer countdown (visible at all times, warning color at < 2 min)
   - Question rendering by type (MCQ radio, true/false buttons, short-answer input)
   - Navigation between questions
   - Submit with confirmation dialog
   - Results view: score, pass/fail, per-question breakdown with explanations
   - "Try Again" button if attempts remain

6. My Courses features:
   - Course cards with progress ring/bar
   - "Continue Learning" button navigates to last lesson
   - Filter by status (active, completed)
   - Empty state: "You haven't enrolled in any courses yet" with CTA to /courses

7. Delete QuizPrototype files.

After completing:
tick comment TASK-060 copilot-2 --note "Quiz Player and My Courses page integrated. Timer, grading, results display. Routes live."
tick done TASK-060 copilot-2
```

---

### STEP 4F · TASK-061 (SONNET — Integrate Admin Course Review)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-050 done
**TICK before starting**:
```
tick claim TASK-061 copilot-2
```

---

**PROMPT TO SEND:**

```
TASK-061: Build Admin Course Review panel.

Read first:
- .agents/contracts/course-system.md (admin endpoints)
- frontend/src/features/courses/useCourses.ts (extend)
- Any existing admin pages (read frontend/src/features/ to find admin patterns)

Do the following:

1. Create frontend/src/features/courses/AdminCourseReviewPage.tsx
   Simple admin interface for reviewing pending courses. Design should match existing admin page patterns (look at AdminScholarReviewPage from Phase 1 if it exists, or use a clean table/card layout).

2. Add to useCourses.ts:
   - useAdminCourses(status, page): GET /api/v1/admin/courses?status=...&page=...
   - useReviewCourse(): useMutation → PUT /api/v1/admin/courses/:slug/review { decision, reason }
     On success: invalidate admin courses query, show toast.

3. Route: /admin/courses → AdminCourseReviewPage (AuthGuard + admin role check)

4. Features:
   - List of pending-review courses (title, instructor, category, level, created date)
   - Click to expand detail (or modal/slide-over)
   - Approve button (green) → confirm dialog → calls review with decision='approved'
   - Reject button (red) → shows rejection reason textarea → calls review with decision='rejected'
   - Status tabs: Pending Review | Published | All

5. Add to admin navigation if an admin nav/sidebar exists.

After completing:
tick comment TASK-061 copilot-2 --note "Admin Course Review panel live at /admin/courses. Approve/reject with reason."
tick done TASK-061 copilot-2
```

---

### STEP 4G · TASK-062 (OPUS — Unit Tests: Course Service)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-047 done
**Start in parallel with**: STEP 4A–4F
**TICK before starting**:
```
tick claim TASK-062 copilot
```

---

**PROMPT TO SEND:**

```
TASK-062: Write unit tests for Course models and service.

Read first:
- backend/models/courseSchema.js
- backend/models/enrollmentSchema.js
- backend/services/courseService.js
- backend/middlewares/courseAccess.js
- backend/__tests__/ (check existing test setup from Phase 1)

Write unit tests in backend/__tests__/:

1. Course Model (courseModel.test.js):
   - Required fields validation (title, description, category, level, type)
   - Enum validation (invalid category, level, type rejected)
   - Default values (status='draft', enrollmentCount=0, pricing.type='free')
   - Slug auto-generation from title

2. courseAccess Middleware (courseAccess.test.js):
   - isEnrolled: allows enrolled student, blocks non-enrolled user (403)
   - isEnrolled: allows access to free preview lesson without enrollment
   - Handles missing course (404)

3. Course Service (courseService.test.js):
   - createCourse: success with valid data, generates slug, sets instructor
   - createCourse: duplicate slug handling (appends number)
   - browseCourses: filters by category, level, type; search works; pagination correct
   - getCourseBySlug: returns course with instructor populated, includes isEnrolled flag
   - updateCourse: ownership check passes for owner, fails for non-owner (403)
   - updateCourse: admin can update any course
   - deleteCourse: soft-delete (archive) when enrollments exist, hard-delete when none
   - publishCourse: requires at least 1 module with 1 lesson, sets status 'pending-review'
   - publishCourse: rejects if already published (400)
   - Module operations: addModule, updateModule, deleteModule with ownership checks

Use jest.mock() to mock mongoose models. Do not hit a real database.

After completing:
tick comment TASK-062 copilot --note "Unit tests for course model, courseAccess middleware, and courseService. All passing."
tick done TASK-062 copilot
```

---

### STEP 4H · TASK-063 (OPUS — Unit Tests: Enrollment + Quiz)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-048 + TASK-049 done
**TICK before starting**:
```
tick claim TASK-063 copilot
```

---

**PROMPT TO SEND:**

```
TASK-063: Write unit tests for Enrollment and Quiz engine.

Read first:
- backend/services/courseService.js (enrollment functions)
- backend/services/quizService.js
- backend/models/enrollmentSchema.js
- backend/models/quizSchema.js
- backend/models/quizAttemptSchema.js

Write unit tests in backend/__tests__/:

1. Enrollment Service (enrollmentService.test.js):
   - enrollInCourse (free): creates enrollment successfully, increments enrollmentCount + totalStudents
   - enrollInCourse (free): rejects duplicate enrollment (400)
   - enrollInCourse (paid): rejects without payment session (402)
   - enrollInCourse (paid): succeeds with valid payment session
   - updateProgress: adds lesson to completedLessons, recalculates percentComplete correctly
   - updateProgress: does not duplicate lesson if already completed
   - updateProgress: marks enrollment as completed when 100%
   - getLessonContent: serves free preview to non-enrolled user
   - getLessonContent: blocks paid lesson for non-enrolled user (403)
   - getLessonContent: serves paid lesson to enrolled user

2. Quiz Service (quizService.test.js):
   - startQuiz: creates attempt, strips correct answers from response
   - startQuiz: rejects when maxAttempts reached (400)
   - startQuiz: rejects for non-enrolled student (403)
   - submitQuiz: grades MCQ correctly (correct + wrong cases)
   - submitQuiz: grades true/false correctly
   - submitQuiz: enforces time limit (rejects late submission, 400)
   - submitQuiz: rejects already-submitted attempt
   - submitQuiz: calculates score correctly
   - submitQuiz: marks passed/failed based on passingScore
   - getQuizResults: returns all attempts + bestScore + passed flag

Mock mongoose models and Quiz lookups.

After completing:
tick comment TASK-063 copilot --note "Unit tests for enrollment service (free/paid enrollment, progress, lesson access) and quiz engine (start/submit/grade/timer). All passing."
tick done TASK-063 copilot
```

---

### STEP 4I · TASK-064 (OPUS — Smoke Tests)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-062 + TASK-063 both done
**TICK before starting**:
```
tick claim TASK-064 copilot
```

---

**PROMPT TO SEND:**

```
TASK-064: Write smoke/integration tests for all Phase 2 Course API endpoints.

Read first:
- All Phase 2 route files (courseRoute.js, quizRoute.js)
- backend/index.js (app setup)
- backend/__tests__/ (existing test setup)

Use supertest + mongodb-memory-server (same approach as Phase 1 smoke tests in TASK-042).

Write backend/__tests__/smoke/phase2.smoke.test.js covering:

COURSE CRUD:
1. Unauthenticated POST /api/v1/courses → 401
2. Authenticated non-scholar POST /api/v1/courses → 403
3. Scholar POST /api/v1/courses with valid body → 201, returns course with generated slug
4. GET /api/v1/courses → 200, returns paginated courses
5. GET /api/v1/courses?category=fiqh → 200, only fiqh courses
6. GET /api/v1/courses/:slug → 200, includes instructor info
7. Scholar PUT /api/v1/courses/:slug → 200, update succeeds for owner
8. Different scholar PUT /api/v1/courses/:slug → 403 (not owner)
9. Scholar PUT /api/v1/courses/:slug/publish → 200, status becomes 'pending-review'
10. Scholar PUT /api/v1/courses/:slug/publish (no modules) → 400

ENROLLMENT:
11. Authenticated POST /api/v1/courses/:slug/enroll (free course) → 200
12. POST /api/v1/courses/:slug/enroll again → 400 (already enrolled)
13. GET /api/v1/courses/:slug/progress → 200, percentComplete=0
14. PUT /api/v1/courses/:slug/progress { lessonId, completed: true } → 200, percentComplete updated
15. GET /api/v1/courses/:slug/lessons/:lessonId (enrolled) → 200
16. GET /api/v1/courses/:slug/lessons/:lessonId (not enrolled, paid lesson) → 403
17. GET /api/v1/courses/:slug/lessons/:lessonId (not enrolled, free preview) → 200

QUIZ:
18. POST /api/v1/quizzes/:id/start (enrolled) → 200, questions without answers
19. POST /api/v1/quizzes/:id/submit → 200, scored and graded
20. GET /api/v1/quizzes/:id/results → 200, attempts list

ADMIN:
21. Admin PUT /api/v1/admin/courses/:slug/review decision=approved → 200, status=published
22. Non-admin PUT /api/v1/admin/courses/:slug/review → 403

DISCOVERY:
23. GET /api/v1/courses/featured → 200
24. GET /api/v1/courses/my-courses (enrolled student) → 200
25. GET /api/v1/courses/teaching (scholar) → 200

Mock Stripe calls. Use mongodb-memory-server for database.

After completing:
tick comment TASK-064 copilot --note "All 25 smoke tests passing. Phase 2 Course API fully verified."
tick done TASK-064 copilot
```

---

## STAGE 5 — Documentation + Final Commit

---

### STEP 5 · TASK-065 (SONNET — Docs, Feature Board, Commit)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: ALL of TASK-056, 057, 058, 059, 060, 061 done
**TICK before starting**:
```
tick claim TASK-065 copilot-2
```

---

**PROMPT TO SEND:**

```
TASK-065: Update all documentation, mark features complete, run lint, and do the final commit.

Do the following in order:

1. Run frontend lint: cd frontend && npm run lint
   Fix any lint errors introduced by Phase 2 code (unused imports, type errors, etc.) before committing.

2. Update .agents/feature-board.md:
   - Add Course System (LMS) row: Shared ✅, Backend ✅, Frontend ✅
   - Move it from "Upcoming" to "Active Features" table

3. Update .agents/contracts/course-system.md:
   - Set Status to ✅ Complete
   - Add handover log entry with today's date and "Phase 2 implementation complete"

4. Update ROADMAP.md (if it exists): add Phase 2 completion note.

5. Commit all Phase 2 code with conventional commits:
   git add .
   git commit -m "feat(courses): add course, enrollment, quiz, quizAttempt models + courseAccess middleware"
   git commit -m "feat(courses): add course CRUD, enrollment, quiz engine, discovery, admin review APIs"
   git commit -m "feat(frontend): integrate course discovery, detail, player, builder, quiz player, my courses"
   git commit -m "test(phase2): add unit + smoke tests for course, enrollment, and quiz APIs"
   git commit -m "docs: update feature board and contracts for Phase 2 completion"

After completing:
tick comment TASK-065 copilot-2 --note "Phase 2 complete. Lint clean. Feature board updated. All commits pushed."
tick done TASK-065 copilot-2
```

---

## Quick Reference: Phase 2 Checklist

```
STAGE 1 — Shared Schemas
  [ ] STEP 1 · TASK-045 · OPUS   · Shared Zod schemas (course, enrollment, quiz)

STAGE 2 — Backend Models
  [ ] STEP 2 · TASK-046 · OPUS   · Course + Enrollment + Quiz + QuizAttempt models + courseAccess

STAGE 3 — Backend APIs + Prototypes (parallel)
  [ ] STEP 3A · TASK-047 · OPUS        · Course CRUD API
  [ ] STEP 3B · TASK-048 · OPUS        · Enrollment API + progress tracking
  [ ] STEP 3C · TASK-049 · OPUS        · Quiz engine API
  [ ] STEP 3D · TASK-050 · OPUS        · Discovery + Admin course review API
  [ ] STEP 3E-1 · TASK-051 · ANTIGRAV  · Course Discovery prototypes (5 variants)
  [ ] STEP 3E-2 · TASK-052 · ANTIGRAV  · Course Detail prototypes (5 variants)
  [ ] STEP 3E-3 · TASK-053 · ANTIGRAV  · Course Player prototypes (5 variants)
  [ ] STEP 3E-4 · TASK-054 · ANTIGRAV  · Course Builder prototypes (5 variants)
  [ ] STEP 3E-5 · TASK-055 · ANTIGRAV  · Quiz Player prototypes (3 variants)

⭐ REVIEW GATE — YOU pick 1 winner per prototype set

STAGE 4 — Integration + Testing (parallel)
  [ ] STEP 4A · TASK-056 · SONNET · Integrate Course Discovery page
  [ ] STEP 4B · TASK-057 · SONNET · Integrate Course Detail page
  [ ] STEP 4C · TASK-058 · SONNET · Integrate Course Player + progress
  [ ] STEP 4D · TASK-059 · SONNET · Integrate Course Builder (Scholar)
  [ ] STEP 4E · TASK-060 · SONNET · Integrate Quiz Player + My Courses
  [ ] STEP 4F · TASK-061 · SONNET · Integrate Admin Course Review
  [ ] STEP 4G · TASK-062 · OPUS   · Unit tests: Course models + service
  [ ] STEP 4H · TASK-063 · OPUS   · Unit tests: Enrollment + Quiz engine
  [ ] STEP 4I · TASK-064 · OPUS   · Smoke tests: All Course APIs

STAGE 5 — Finalize
  [ ] STEP 5 · TASK-065 · SONNET · Docs + Feature board + Final commit
```

---

## Parallel Execution Map

```
                   STAGE 1         STAGE 2         STAGE 3                      GATE    STAGE 4                     STAGE 5
                   ┌──────┐       ┌──────┐       ┌───────────────────┐          │      ┌──────────────────────┐     ┌──────┐
  OPUS:            │T-045 │──────▶│T-046 │──────▶│T-047 → T-048     │          │      │T-062 → T-063 → T-064 │     │      │
                   │schema│       │models│       │T-049   T-050     │          │      │(tests — parallel w/  │     │      │
                   └──────┘       └──────┘       └───────────────────┘          │      │ Sonnet integration)  │     │      │
                                                                                │      └──────────────────────┘     │      │
  ANTIGRAVITY:       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─▶│T-051, T-052, T-053│          │         ─ ─ ─ ─ (done) ─ ─ ─     │      │
                                                 │T-054, T-055       │          │                                   │      │
                                                 └───────────────────┘          │                                   │      │
                                                                                │                                   │      │
  YOU:                ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ▶│◀ PICK │                           │      │
                                                                                │      │                           │      │
  SONNET:             ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─▶│T-056, T-057, T-058  │────▶│T-065 │
                                                                                │      │T-059, T-060, T-061  │     │      │
                                                                                │      └──────────────────────┘     └──────┘
```

### What Can Run in Parallel (within each stage)

**Stage 3 — OPUS backend tasks:**
- TASK-047 (Course CRUD) and TASK-048 (Enrollment) and TASK-049 (Quiz) can all start after TASK-046. They touch different services but share courseService.js. **Safest**: run 047 first (creates service file), then 048 + 049 in parallel (they extend it).
- TASK-050 depends on TASK-047 (extends existing endpoints).

**Stage 3 — ANTIGRAVITY prototypes:**
- ALL five prototype tasks (051-055) are fully independent. Run all in the same Antigravity session or sequentially — they only create files in `prototypes/` folder.

**Stage 4 — SONNET integration:**
- TASK-056, 057, 058, 059, 060, 061 can be done sequentially (easiest) or partially in parallel:
  - 056 first (creates useCourses.ts), then 057-061 in any order (all extend useCourses.ts)
  - 061 has no prototype dependency — can start as soon as TASK-050 is done

**Stage 4 — OPUS tests:**
- TASK-062 can start as soon as TASK-047 is done (parallel with Sonnet)
- TASK-063 can start as soon as TASK-048 + 049 done
- TASK-064 depends on 062 + 063

---

## Notes

- **TICK.md is the source of truth** — always claim before starting, always done after finishing
- **Contract is at** `.agents/contracts/course-system.md` — every agent reads it before coding
- **Never skip the review gate** — Sonnet integration must wait for you to pick a prototype
- **Opus runs tests independently** — no need to wait for frontend to finish
- **Phase 1 must be complete** — Course system depends on scholar roles and Stripe payments
- **Phase 3** (Virtual Classroom with LiveKit) planning begins only after TASK-065 is done and you confirm satisfaction
