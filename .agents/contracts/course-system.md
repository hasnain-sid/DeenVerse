# Feature Contract: Course System (Custom LMS)

> **Created by**: copilot (Opus 4.6)
> **Date**: 2026-03-05
> **Status**: ✅ Complete (2026-03-07)

---

## 1. Overview

**What**: Full course marketplace — scholars create structured courses (self-paced, instructor-led, hybrid) with modules, lessons, quizzes, progress tracking, and enrollment.
**Why**: Core value proposition — transforms DeenVerse from a social platform into an Islamic education ecosystem.
**Scope**: Backend (models, CRUD API, enrollment, quiz engine) + Frontend (discovery, detail, player, builder, admin review).
**Depends on**: Phase 1 (Scholar Role System + Payment System) must be complete — courses require scholar role and Stripe checkout.

| Layer | Required? | Owner Agent | Status |
|-------|-----------|-------------|--------|
| Shared (types/schemas) | Yes | copilot (Opus) | ✅ |
| Backend (API) | Yes | copilot (Opus) | ✅ |
| Frontend (UI) | Yes | antigravity (prototypes) → copilot-2 (integration) | ✅ |
| Mobile | No | — | — |

---

## 2. API Contract

### Course CRUD (Scholar/Admin)

```
POST   /api/v1/courses
  Request:  { title, description, shortDescription, thumbnail, category, level, language, type, pricing, modules, schedule?, requirements, learningOutcomes, tags, maxStudents, certificateOnCompletion }
  Response: { course }
  Auth:     Required (scholar or admin)
  Status:   ⬜ Not Implemented

GET    /api/v1/courses
  Request:  ?category=fiqh&level=beginner&type=self-paced&search=tajweed&page=1&limit=12&sort=popular
  Response: { courses: [...], pagination }
  Auth:     Public
  Status:   ⬜ Not Implemented

GET    /api/v1/courses/:slug
  Request:  —
  Response: { course, instructor: { name, username, avatar, scholarProfile }, enrollmentCount, isEnrolled }
  Auth:     Public (enrollment status requires auth)
  Status:   ⬜ Not Implemented

PUT    /api/v1/courses/:slug
  Request:  { ...partial course fields }
  Response: { course }
  Auth:     Required (course owner or admin)
  Status:   ⬜ Not Implemented

DELETE /api/v1/courses/:slug
  Request:  —
  Response: { message }
  Auth:     Required (course owner or admin)
  Status:   ⬜ Not Implemented

PUT    /api/v1/courses/:slug/publish
  Request:  —
  Response: { course }
  Auth:     Required (course owner) — sets status to 'pending-review'
  Status:   ⬜ Not Implemented

POST   /api/v1/courses/:slug/modules
  Request:  { title, description, order, lessons: [...] }
  Response: { course }
  Auth:     Required (course owner or admin)
  Status:   ⬜ Not Implemented

PUT    /api/v1/courses/:slug/modules/:moduleIndex
  Request:  { title?, description?, order?, lessons? }
  Response: { course }
  Auth:     Required (course owner or admin)
  Status:   ⬜ Not Implemented

DELETE /api/v1/courses/:slug/modules/:moduleIndex
  Request:  —
  Response: { course }
  Auth:     Required (course owner or admin)
  Status:   ⬜ Not Implemented
```

### Enrollment

```
POST   /api/v1/courses/:slug/enroll
  Request:  { paymentSessionId? } (optional — free courses auto-enroll)
  Response: { enrollment }
  Auth:     Required
  Status:   ⬜ Not Implemented

GET    /api/v1/courses/:slug/progress
  Request:  —
  Response: { enrollment: { progress, completedLessons, percentComplete, currentModule, currentLesson } }
  Auth:     Required (enrolled student)
  Status:   ⬜ Not Implemented

PUT    /api/v1/courses/:slug/progress
  Request:  { lessonId, completed: true }
  Response: { enrollment }
  Auth:     Required (enrolled student)
  Status:   ⬜ Not Implemented

GET    /api/v1/courses/:slug/lessons/:lessonId
  Request:  —
  Response: { lesson, nextLesson?, prevLesson? }
  Auth:     Required (enrolled student, or isFree preview)
  Status:   ⬜ Not Implemented
```

### Quiz

```
POST   /api/v1/quizzes/:quizId/start
  Request:  —
  Response: { attempt: { id, questions (without answers), timeLimit, startedAt } }
  Auth:     Required (enrolled student)
  Status:   ⬜ Not Implemented

POST   /api/v1/quizzes/:quizId/submit
  Request:  { attemptId, answers: [{ questionIndex, answer }] }
  Response: { score, passed, correctAnswers (if showCorrectAnswers), attempt }
  Auth:     Required
  Status:   ⬜ Not Implemented

GET    /api/v1/quizzes/:quizId/results
  Request:  ?attemptId=...
  Response: { attempts: [...], bestScore, passed }
  Auth:     Required
  Status:   ⬜ Not Implemented
```

### Discovery

```
GET    /api/v1/courses/featured
  Request:  —
  Response: { courses: [...] }
  Auth:     Public
  Status:   ⬜ Not Implemented

GET    /api/v1/courses/my-courses
  Request:  ?status=active&page=1&limit=10
  Response: { enrollments: [...], pagination }
  Auth:     Required
  Status:   ⬜ Not Implemented

GET    /api/v1/courses/teaching
  Request:  ?status=published&page=1&limit=10
  Response: { courses: [...], pagination }
  Auth:     Required (scholar)
  Status:   ⬜ Not Implemented
```

### Admin

```
GET    /api/v1/admin/courses
  Request:  ?status=pending-review&page=1&limit=10
  Response: { courses: [...], pagination }
  Auth:     Required (admin)
  Status:   ⬜ Not Implemented

PUT    /api/v1/admin/courses/:slug/review
  Request:  { decision: 'approved'|'rejected', reason? }
  Response: { course }
  Auth:     Required (admin)
  Status:   ⬜ Not Implemented
```

---

## 3. Data Model Changes

### New Models

#### courseSchema.js

```javascript
{
  instructor: { type: ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 200 },
  thumbnail: String,
  category: { type: String, enum: ['quran', 'hadith', 'fiqh', 'aqeedah', 'seerah', 'arabic', 'tajweed', 'tafseer', 'dawah', 'other'], required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  language: { type: String, default: 'en' },
  type: { type: String, enum: ['self-paced', 'instructor-led', 'hybrid'], required: true },

  pricing: {
    type: { type: String, enum: ['free', 'paid', 'subscription'], default: 'free' },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'usd' },
    stripePriceId: String
  },

  modules: [{
    title: { type: String, required: true },
    description: String,
    order: { type: Number, required: true },
    lessons: [{
      title: { type: String, required: true },
      type: { type: String, enum: ['video', 'text', 'quiz', 'live-session', 'assignment'], required: true },
      content: mongoose.Schema.Types.Mixed,
      duration: Number,
      order: { type: Number, required: true },
      isFree: { type: Boolean, default: false },
      resources: [{ name: String, url: String, type: String }]
    }]
  }],

  schedule: {
    startDate: Date,
    endDate: Date,
    recurrence: { type: String, enum: ['daily', 'weekly', 'biweekly', 'custom'] },
    sessions: [{ date: Date, duration: Number, topic: String }],
    timezone: String
  },

  requirements: [String],
  learningOutcomes: [String],
  tags: [String],
  status: { type: String, enum: ['draft', 'pending-review', 'published', 'archived'], default: 'draft' },
  enrollmentCount: { type: Number, default: 0 },
  rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },

  maxStudents: { type: Number, default: 0 },
  certificateOnCompletion: { type: Boolean, default: false },
  autoEnroll: { type: Boolean, default: false },

  reviewedBy: { type: ObjectId, ref: 'User' },
  reviewedAt: Date,
  rejectionReason: String
}
// Indexes: { slug: 1 }, { instructor: 1 }, { status: 1, category: 1 }, { tags: 1 }
// Timestamps: true
```

#### enrollmentSchema.js

```javascript
{
  student: { type: ObjectId, ref: 'User', required: true },
  course: { type: ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['active', 'completed', 'dropped', 'suspended'], default: 'active' },
  progress: {
    completedLessons: [String],
    currentModule: { type: Number, default: 0 },
    currentLesson: { type: Number, default: 0 },
    percentComplete: { type: Number, default: 0 },
    lastAccessedAt: Date
  },
  payment: {
    stripePaymentId: String,
    amount: Number,
    paidAt: Date
  },
  certificate: {
    issued: { type: Boolean, default: false },
    issuedAt: Date,
    certificateId: String
  },
  notes: [{ lessonId: String, content: String, createdAt: { type: Date, default: Date.now } }],
  enrolledAt: { type: Date, default: Date.now },
  completedAt: Date
}
// Indexes: { student: 1, course: 1 } (compound unique), { course: 1, status: 1 }
// Timestamps: true
```

#### quizSchema.js

```javascript
{
  course: { type: ObjectId, ref: 'Course', required: true },
  lesson: String,
  title: { type: String, required: true },
  type: { type: String, enum: ['quiz', 'exam', 'certification-exam'], default: 'quiz' },
  timeLimit: { type: Number, default: 0 },
  passingScore: { type: Number, required: true },
  maxAttempts: { type: Number, default: 3 },
  questions: [{
    text: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'true-false', 'short-answer', 'essay', 'quran-recitation'], required: true },
    options: [{ text: String, isCorrect: Boolean }],
    points: { type: Number, default: 1 },
    explanation: String,
    ayahRef: String
  }],
  shuffleQuestions: { type: Boolean, default: true },
  showCorrectAnswers: { type: Boolean, default: true }
}
// Indexes: { course: 1 }, { course: 1, lesson: 1 }
// Timestamps: true
```

#### quizAttemptSchema.js

```javascript
{
  student: { type: ObjectId, ref: 'User', required: true },
  quiz: { type: ObjectId, ref: 'Quiz', required: true },
  answers: [{ questionIndex: Number, answer: mongoose.Schema.Types.Mixed, isCorrect: Boolean }],
  score: Number,
  passed: Boolean,
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  attempt: { type: Number, required: true }
}
// Indexes: { student: 1, quiz: 1 }, { quiz: 1, passed: 1 }
// Timestamps: true
```

### Existing Model Changes

#### userSchema.js
- Add `scholarProfile.totalCourses` (already exists from Phase 1 — increment on course publish)
- Add `scholarProfile.totalStudents` (already exists — increment on enrollment)

---

## 4. Frontend Requirements

### New Pages

| Page | Route | Auth | Description |
|------|-------|------|-------------|
| Course Discovery | `/courses` | Public | Browse, filter, search courses |
| Course Detail | `/courses/:slug` | Public | Syllabus, enroll CTA, instructor info |
| Course Player | `/courses/:slug/learn` | AuthGuard + enrolled | Lesson viewer, sidebar, progress |
| Quiz Player | `/courses/:slug/quiz/:quizId` | AuthGuard + enrolled | Timed quiz interface |
| My Courses | `/my-courses` | AuthGuard | Student's enrolled courses with progress |
| Course Builder | `/scholar/courses/new` | AuthGuard + scholar | Multi-step course creation form |
| Edit Course | `/scholar/courses/:slug/edit` | AuthGuard + course owner | Edit existing course |
| My Teaching | `/scholar/courses` | AuthGuard + scholar | Scholar's created courses |
| Admin Course Review | `/admin/courses` | AuthGuard + admin | Review pending courses |

### New Hooks (useCourses.ts)

```typescript
// Discovery
useCourses(filters): GET /api/v1/courses
useCourseDetail(slug): GET /api/v1/courses/:slug
useFeaturedCourses(): GET /api/v1/courses/featured
useMyCourses(status, page): GET /api/v1/courses/my-courses
useMyTeaching(status, page): GET /api/v1/courses/teaching

// CRUD
useCreateCourse(): useMutation → POST /api/v1/courses
useUpdateCourse(): useMutation → PUT /api/v1/courses/:slug
useDeleteCourse(): useMutation → DELETE /api/v1/courses/:slug
usePublishCourse(): useMutation → PUT /api/v1/courses/:slug/publish
useAddModule(): useMutation → POST /api/v1/courses/:slug/modules
useUpdateModule(): useMutation → PUT /api/v1/courses/:slug/modules/:idx
useDeleteModule(): useMutation → DELETE /api/v1/courses/:slug/modules/:idx

// Enrollment
useEnrollCourse(): useMutation → POST /api/v1/courses/:slug/enroll
useCourseProgress(slug): GET /api/v1/courses/:slug/progress
useUpdateProgress(): useMutation → PUT /api/v1/courses/:slug/progress
useLessonContent(slug, lessonId): GET /api/v1/courses/:slug/lessons/:lessonId

// Quiz
useStartQuiz(): useMutation → POST /api/v1/quizzes/:id/start
useSubmitQuiz(): useMutation → POST /api/v1/quizzes/:id/submit
useQuizResults(quizId): GET /api/v1/quizzes/:id/results

// Admin
useAdminCourses(status, page): GET /api/v1/admin/courses
useReviewCourse(): useMutation → PUT /api/v1/admin/courses/:slug/review
```

### Prototype Sets Needed

| Set | Folder | Route | Variants |
|-----|--------|-------|----------|
| Course Discovery Page | `features/courses/prototypes/` | `/prototypes/course-discovery` | 5 |
| Course Detail Page | `features/courses/prototypes/` | `/prototypes/course-detail` | 5 |
| Course Player | `features/courses/prototypes/` | `/prototypes/course-player` | 5 |
| Course Builder (Scholar) | `features/courses/prototypes/` | `/prototypes/course-builder` | 5 |
| Quiz Player | `features/courses/prototypes/` | `/prototypes/quiz-player` | 3 |

---

## 5. Shared Schemas (packages/shared)

### New Schemas (course.ts)

```typescript
// Category enum
courseCategoryEnum = z.enum(['quran', 'hadith', 'fiqh', 'aqeedah', 'seerah', 'arabic', 'tajweed', 'tafseer', 'dawah', 'other'])

// Level enum
courseLevelEnum = z.enum(['beginner', 'intermediate', 'advanced'])

// Type enum
courseTypeEnum = z.enum(['self-paced', 'instructor-led', 'hybrid'])

// Status enum
courseStatusEnum = z.enum(['draft', 'pending-review', 'published', 'archived'])

// Pricing
coursePricingSchema = z.object({
  type: z.enum(['free', 'paid', 'subscription']),
  amount: z.number().min(0).optional(),
  currency: z.string().default('usd').optional()
})

// Lesson
courseLessonSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['video', 'text', 'quiz', 'live-session', 'assignment']),
  content: z.any().optional(),
  duration: z.number().min(0).optional(),
  order: z.number().min(0),
  isFree: z.boolean().optional(),
  resources: z.array(z.object({ name: z.string(), url: z.string(), type: z.string() })).optional()
})

// Module
courseModuleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().min(0),
  lessons: z.array(courseLessonSchema)
})

// Create course
createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(20),
  shortDescription: z.string().max(200).optional(),
  category: courseCategoryEnum,
  level: courseLevelEnum,
  language: z.string().default('en'),
  type: courseTypeEnum,
  pricing: coursePricingSchema,
  modules: z.array(courseModuleSchema).optional(),
  requirements: z.array(z.string()).optional(),
  learningOutcomes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  maxStudents: z.number().min(0).optional(),
  certificateOnCompletion: z.boolean().optional()
})

// Update course (partial)
updateCourseSchema = createCourseSchema.partial()

// Enrollment request
enrollCourseSchema = z.object({
  paymentSessionId: z.string().optional()
})

// Quiz answer
quizAnswerSchema = z.object({
  questionIndex: z.number(),
  answer: z.any()
})

// Quiz submit
submitQuizSchema = z.object({
  attemptId: z.string(),
  answers: z.array(quizAnswerSchema)
})

// Course review (admin)
courseReviewSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  reason: z.string().optional()
})

// Course filters (query params)
courseFiltersSchema = z.object({
  category: courseCategoryEnum.optional(),
  level: courseLevelEnum.optional(),
  type: courseTypeEnum.optional(),
  search: z.string().optional(),
  sort: z.enum(['popular', 'newest', 'rating', 'price-low', 'price-high']).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(50).optional()
})
```

---

## 6. Security Considerations

- **Course Access Middleware** (`courseAccess.js`): verify enrollment before serving paid lesson content. Free preview lessons (`isFree: true`) are public.
- **Ownership Check**: only the course instructor (or admin) can update/delete a course.
- **Quiz Integrity**: server-side timer — reject submissions after `timeLimit + 30s` grace. Strip correct answers from questions sent to client during quiz start.
- **Slug Injection**: sanitize slug generation (use `slugify` library, alphanumeric + hyphens only).
- **File Upload**: course thumbnails and lesson resources go through existing upload service with size + type validation.
- **Rate Limiting**: enrollment endpoint should be rate-limited (prevent bulk enrollment abuse).
- **Payment Verification**: for paid courses, verify Stripe payment completion before creating enrollment (or handle via webhook).

---

## 7. Environment Variables

No new env vars needed for Phase 2. Stripe keys from Phase 1 are reused for course payments.

---

## 8. Dependencies

### Backend
- `slugify` — URL-friendly slug generation (or use existing solution)

### Frontend
- No new dependencies — uses existing shadcn/ui, TanStack Query, React Router

---

## 9. Handover Log

| Date | Agent | Action | Notes |
|------|-------|--------|-------|
| 2026-03-05 | copilot | Contract created | Phase 2 planning — awaiting Phase 1 completion |
