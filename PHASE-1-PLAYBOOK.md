# Phase 1 Playbook — Scholar Roles + Payment System

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

## Timeline Overview

```
Day 1–2   [OPUS]       Stage 1: Shared schemas + userSchema + middleware
Day 2–5   [OPUS]       Stage 2: All backend APIs (parallel track)
          [ANTIGRAVITY] Stage 2: All 5 prototype sets (parallel track — start same day as Stage 2)
Day 5–6   [YOU]        Review all prototypes, pick 1 winner per set
Day 6–8   [SONNET]     Stage 3: Integrate chosen prototypes
          [OPUS]       Stage 3: Write unit + smoke tests
Day 8–9   [SONNET]     Stage 4: Docs, feature board, final commit
```

---

## STAGE 1 — Foundation Schemas & Models

> **OPUS only. No parallel work yet.**

---

### STEP 1 · TASK-024
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: Nothing — this is the very first task
**TICK before starting**:
```
tick claim TASK-024 copilot
```

---

**PROMPT TO SEND:**

```
You are working on DeenVerse (Islamic social platform). Read the contracts before coding:
- .agents/contracts/scholar-role-system.md
- .agents/contracts/payment-system.md

TASK-024: Create shared Zod schemas for Phase 1 features.

Create the following files in packages/shared/src/schemas/:

1. scholar.ts — Export these schemas:
   - scholarSpecialtiesEnum: z.enum(['tafseer', 'hadith', 'fiqh', 'arabic', 'tajweed', 'aqeedah', 'seerah', 'dawah'])
   - scholarCredentialSchema: z.object({ title, institution, year, documentUrl (optional) })
   - scholarApplicationSchema: z.object({ credentials: array of scholarCredentialSchema, specialties: array of specialties, bio, teachingLanguages: array of strings, videoIntroUrl (optional) })
   - scholarProfileSchema: z.object({ specialties, bio, teachingLanguages, rating: { average, count }, totalStudents, totalCourses, verifiedAt (optional date string), applicationStatus: z.enum(['none','pending','approved','rejected']) })
   - scholarReviewSchema: z.object({ decision: z.enum(['approved','rejected']), rejectionReason: optional string, specialties: optional array })

2. payment.ts — Export these schemas:
   - subscriptionPlanEnum: z.enum(['student', 'premium'])
   - checkoutRequestSchema: z.object({ courseSlug: string, successUrl: optional string, cancelUrl: optional string })
   - subscriptionRequestSchema: z.object({ planId: subscriptionPlanEnum })
   - earningsPeriodEnum: z.enum(['month', 'quarter', 'year'])
   - paymentStatusEnum: z.enum(['pending', 'completed', 'refunded', 'failed'])

3. Update packages/shared/src/schemas/index.ts to export from both new files.
4. Update packages/shared/src/index.ts if needed.

Follow TypeScript strict mode. Export inferred types (e.g., export type ScholarApplication = z.infer<typeof scholarApplicationSchema>).

After completing:
tick comment TASK-024 copilot --note "Shared Zod schemas created for scholar and payment features."
tick done TASK-024 copilot
```

---

### STEP 2 · TASK-025
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: STEP 1 (TASK-024) to be marked done
**TICK before starting**:
```
tick claim TASK-025 copilot
```

---

**PROMPT TO SEND:**

```
TASK-025: Extend userSchema and add scholar middleware.

Read first:
- .agents/contracts/scholar-role-system.md (section 3: Data Model Changes)
- backend/models/userSchema.js (read the full file to understand current structure)
- backend/middlewares/admin.js (read to match the existing pattern)

Do the following:

1. In backend/models/userSchema.js:
   - Add 'scholar' to the role enum: ['user', 'scholar', 'moderator', 'admin']
   - Add a scholarProfile subdocument with these fields:
     verifiedAt (Date), verifiedBy (ObjectId ref User), specialties ([String]),
     credentials ([{ title, institution, year, documentUrl }]),
     bio (String), teachingLanguages ([String]),
     rating: { average: Number default 0, count: Number default 0 },
     totalStudents: { type: Number, default: 0 },
     totalCourses: { type: Number, default: 0 },
     stripeConnectId: String,
     payoutSchedule: { type: String, enum: ['weekly','biweekly','monthly'], default: 'monthly' },
     applicationStatus: { type: String, enum: ['none','pending','approved','rejected'], default: 'none' },
     applicationDate: Date,
     rejectionReason: String
   - Ensure all new fields have sensible defaults so existing users are unaffected.

2. In backend/middlewares/admin.js — add two new exported middleware functions AFTER the existing isAdmin:
   - isScholar: allows role === 'scholar' OR role === 'admin'
   - isScholarOrAdmin: alias for isScholar (same logic, different semantic name)
   Follow the exact same pattern as isAdmin (try/catch, AppError, lean() query).

After completing:
tick comment TASK-025 copilot --note "userSchema extended with scholarProfile subdoc + 'scholar' role. isScholar and isScholarOrAdmin middleware added."
tick done TASK-025 copilot
```

---

## STAGE 2 — Backend APIs + Prototypes (Run in Parallel)

> **Start OPUS on backend AND start ANTIGRAVITY on all prototypes at the same time.
> These two tracks are fully independent — prototypes use only mocked data.**

---

### STEP 3A · TASK-026 (OPUS — Scholar API)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: STEP 2 (TASK-025) done
**TICK before starting**:
```
tick claim TASK-026 copilot
```

---

**PROMPT TO SEND:**

```
TASK-026: Build the Scholar Application API.

Read first:
- .agents/contracts/scholar-role-system.md (full file)
- backend/routes/ (list to see naming conventions)
- backend/controller/userController.js (for code style reference)
- backend/utils/AppError.js

Create these files following the route → controller → service pattern:

1. backend/routes/scholarRoute.js
   Mount at /api/v1/scholars in backend/index.js
   Routes:
   - POST   /apply               → isAuthenticated → scholarController.applyForScholar
   - GET    /application-status  → isAuthenticated → scholarController.getApplicationStatus
   - GET    /:id/profile         → public → scholarController.getScholarProfile
   - POST   /stripe/connect      → isAuthenticated, isScholar → scholarController.stripeConnectOnboard (stub — returns 501 for now, Stripe work is TASK-027)
   - GET    /stripe/dashboard    → isAuthenticated, isScholar → scholarController.stripeExpressDashboard (stub)
   - GET    /stripe/status       → isAuthenticated, isScholar → scholarController.stripeStatus (stub)
   Admin routes (mount under /api/v1/admin/scholars or add to scholarRoute with isAdmin guard):
   - GET    /admin/scholars/applications  → isAuthenticated, isAdmin → scholarController.listApplications
   - PUT    /admin/scholars/applications/:userId/review → isAuthenticated, isAdmin → scholarController.reviewApplication
   - GET    /admin/scholars               → isAuthenticated, isAdmin → scholarController.listScholars

2. backend/controller/scholarController.js
   Thin — only validates input (use scholarApplicationSchema from @deenverse/shared), calls service, sends response.

3. backend/services/scholarService.js
   Implement all business logic:
   - applyForScholar(userId, data): check applicationStatus !== 'pending'/'approved', set to 'pending', save application data in scholarProfile
   - getApplicationStatus(userId): return applicationStatus + applicationDate + rejectionReason
   - getScholarProfile(scholarId): return user with scholarProfile + basic user fields. 404 if user not found or not a scholar.
   - listApplications(status, page, limit): paginated list of users with applicationStatus === status
   - reviewApplication(adminId, userId, decision, rejectionReason, specialties): if approved → set role to 'scholar', applicationStatus to 'approved', scholarProfile.verifiedAt + verifiedBy. If rejected → set applicationStatus 'rejected', store rejectionReason. Emit a notification (use existing notificationService pattern if available).
   - listScholars(page, limit): paginated list of users with role === 'scholar'

Security: users can only apply once while pending; cannot apply if already a scholar.
Use AppError for all error cases. Use .lean() where writes are not needed.

After completing:
tick comment TASK-026 copilot --note "Scholar application API complete: apply, status, profile, admin review endpoints."
tick done TASK-026 copilot
```

---

### STEP 3B · TASK-027 (OPUS — Stripe Connect Service)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: STEP 2 (TASK-025) done (can run in parallel with TASK-026)
**TICK before starting**:
```
tick claim TASK-027 copilot
```

---

**PROMPT TO SEND:**

```
TASK-027: Build Stripe Connect service and new payment models.

Read first:
- .agents/contracts/payment-system.md (full file — especially sections 3, 6, 7)
- backend/models/ (list to see existing model files)
- backend/config/ (check if stripe config exists)

Do the following:

1. Create backend/models/paymentSchema.js:
   Fields: user (ObjectId ref User), type enum ['course-purchase','subscription','refund'],
   stripeSessionId (String, indexed), stripePaymentIntentId (String),
   amount (Number, in cents), currency (String, default 'usd'),
   status enum ['pending','completed','refunded','failed'],
   course (ObjectId ref Course, optional), subscription: { stripePriceId, plan enum ['student','premium'], currentPeriodEnd: Date },
   platformFee (Number, cents), scholarPayout (Number, cents),
   timestamps: true

2. Create backend/models/scholarPaymentSchema.js:
   Fields: scholar (ObjectId ref User), type enum ['course-revenue','monthly-stipend','session-fee','bonus'],
   courseRevenue: { course ObjectId, totalAmount, platformFee, scholarAmount, studentCount },
   stipend: { amount, period, reason },
   status enum ['pending','processing','paid','failed'],
   stripeTransferId (String), paidAt (Date),
   period: { start: Date, end: Date },
   timestamps: true

3. Install stripe SDK if not present (check backend/package.json first).
   Create backend/services/stripeService.js:
   - createConnectAccount(userId): create Stripe Express Connected Account, store stripeConnectId in user's scholarProfile, return onboarding URL
   - getExpressDashboardLink(stripeConnectId): generate Stripe Express dashboard login link
   - getConnectAccountStatus(stripeConnectId): retrieve account, return { connected, chargesEnabled, payoutsEnabled }
   Use process.env.STRIPE_SECRET_KEY. Guard all calls in try/catch. Export named functions.

4. Wire the previously-stubbed scholar Stripe routes to real implementations in scholarController.js + scholarService.js (the /stripe/connect, /stripe/dashboard, /stripe/status endpoints from TASK-026).

Environment variables needed (add to backend/.env.example if it exists):
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_connect_...
COURSE_COMMISSION_RATE=0.30

After completing:
tick comment TASK-027 copilot --note "Stripe Connect service built. paymentSchema + scholarPaymentSchema models created. Scholar stripe routes wired."
tick done TASK-027 copilot
```

---

### STEP 3C · TASK-028 (OPUS — Payment Checkout + Webhook)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-027 done
**TICK before starting**:
```
tick claim TASK-028 copilot
```

---

**PROMPT TO SEND:**

```
TASK-028: Build the payment checkout, subscription, and Stripe webhook handler.

Read first:
- .agents/contracts/payment-system.md (sections 2, 6)
- backend/services/stripeService.js (just created)
- backend/models/paymentSchema.js (just created)
- backend/index.js (to understand middleware order — important for raw body webhook)

Create these files:

1. backend/routes/paymentRoute.js
   Mount at /api/v1/payments in backend/index.js (BEFORE express.json middleware or handle raw body separately)
   Routes:
   - POST /checkout        → isAuthenticated → paymentController.createCheckout
   - POST /subscription    → isAuthenticated → paymentController.createSubscription
   - DELETE /subscription  → isAuthenticated → paymentController.cancelSubscription
   - GET /history          → isAuthenticated → paymentController.getPaymentHistory

2. backend/routes/webhookRoute.js
   Mount at /api/v1/webhooks — CRITICAL: this route MUST use express.raw({ type: 'application/json' }) body parser, NOT express.json().
   Routes:
   - POST /stripe → webhookController.handleStripeWebhook (NO auth middleware)

3. backend/controller/paymentController.js
   - createCheckout: validate with checkoutRequestSchema, call stripeService.createCheckoutSession, return { sessionId, url }
   - createSubscription: call stripeService.createSubscriptionSession, return { sessionId, url }
   - cancelSubscription: call stripeService.cancelSubscription
   - getPaymentHistory: paginated query on Payment model for the current user

4. backend/controller/webhookController.js
   - handleStripeWebhook: verify signature with stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET). Handle these events:
     * checkout.session.completed → create Payment record (check for duplicate stripeSessionId for idempotency), update course enrollment count
     * customer.subscription.updated → update user subscription status
     * customer.subscription.deleted → downgrade user plan
     * account.updated (Connect) → update scholar's chargesEnabled/payoutsEnabled status
   Log unhandled event types but return 200 (Stripe requires 200 for all webhooks).

5. Extend backend/services/stripeService.js with:
   - createCheckoutSession(userId, courseSlug, successUrl, cancelUrl): look up course by slug, get scholar's stripeConnectId, create Stripe Checkout Session with application_fee_amount (COURSE_COMMISSION_RATE) and transfer_data.destination
   - createSubscriptionSession(userId, planId): create Stripe Checkout session in subscription mode
   - cancelSubscription(userId): retrieve subscription from user, call stripe.subscriptions.cancel

Security reminders:
- NEVER log Stripe secret key
- Always verify webhook signatures — reject with 400 if invalid
- Checkout sessions must be idempotent

After completing:
tick comment TASK-028 copilot --note "Payment checkout, subscription, and Stripe webhook handler implemented. Raw body correctly handled for /api/v1/webhooks/stripe."
tick done TASK-028 copilot
```

---

### STEP 3D · TASK-029 (OPUS — Scholar Earnings API)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-027 done (can run in parallel with TASK-028)
**TICK before starting**:
```
tick claim TASK-029 copilot
```

---

**PROMPT TO SEND:**

```
TASK-029: Build the Scholar Earnings API and Admin Payment Overview.

Read first:
- .agents/contracts/payment-system.md (sections 2, 3)
- backend/models/scholarPaymentSchema.js (just created)
- backend/models/paymentSchema.js (just created)

Add these endpoints to backend/routes/scholarRoute.js (already exists):
- GET /earnings         → isAuthenticated, isScholar → scholarController.getEarningsSummary
- GET /earnings/details → isAuthenticated, isScholar → scholarController.getEarningsDetails

Add to admin routes (in scholarRoute.js with isAdmin guard):
- GET /admin/payments/overview    → isAuthenticated, isAdmin → paymentController.getAdminOverview
- POST /admin/scholars/:id/stipend → isAuthenticated, isAdmin → scholarController.setScholarStipend

Implement in backend/services/scholarService.js:
- getEarningsSummary(scholarId, period): aggregate ScholarPayment records for the scholar filtered by period (month/quarter/year). Return { totalRevenue, platformFee, netEarnings, breakdown: [{ courseTitle, revenue, enrollments }] }
- getEarningsDetails(scholarId, page, limit): paginated ScholarPayment records
- setScholarStipend(adminId, scholarId, amount, period, reason): create a ScholarPayment record of type 'monthly-stipend'

Implement in backend/services/stripeService.js (extend):
- getAdminPaymentOverview(period): aggregate Payment model. Return { totalRevenue, totalCommission, totalPayouts, courseBreakdown }

After completing:
tick comment TASK-029 copilot --note "Scholar earnings summary, details, and admin payment overview API complete."
tick done TASK-029 copilot
```

---

### STEP 3E-1 · TASK-030 (ANTIGRAVITY — Scholar Application Prototypes)
**Agent**: 🟡 ANTIGRAVITY
**Wait for**: TASK-024 (shared schemas done — contracts exist)
**Start in parallel with**: TASK-026, 027, 028, 029

---

**PROMPT TO SEND TO ANTIGRAVITY:**

```
Task: Create 5 distinct frontend prototype variants for the Scholar Application Page.

Context: DeenVerse is an Islamic social platform. Users can apply to become a verified scholar. This is the application form they fill out. Read the contract first: .agents/contracts/scholar-role-system.md (Section 4: Frontend Requirements).

Create in: frontend/src/features/scholar/prototypes/
Files to create:
- Prototype1.tsx through Prototype5.tsx (5 distinct designs)
- PrototypesViewer.tsx (toolbar to switch between prototypes)
Temp route: /prototypes/scholar-apply (add to frontend router)

Each prototype should be a complete page design for the Scholar Application Form with these fields:
- Credentials section: add multiple credentials (institution, title, year, document upload placeholder)
- Specialties multi-select: tafseer, hadith, fiqh, arabic, tajweed, aqeedah, seerah, dawah
- Extended bio textarea
- Teaching languages selector (en, ar, ur, fr, tr, bn)
- Video introduction URL field
- Submit button with loading state, success state, rejection-pending state

Explore these 5 distinct approaches:
1. Multi-step wizard (4 steps: credentials → specialties → bio/languages → review)
2. Single-page accordion form (all sections visible, expand each to fill)
3. Card-board layout (drag/drop style credential cards, visual specialties grid)
4. Interview-style (conversational Q&A flow, one question at a time)
5. Dashboard-style (left sidebar navigation, fill each section in content area)

Rules:
- Frontend only — all data mocked inline (no API calls)
- Use existing design system: shadcn/ui, Tailwind CSS v4, Lucide React, Framer Motion
- Islamic design feel (crescent motifs optional, green/gold accents encouraged)
- Responsive (mobile-first)
- Show success/pending state after mock submission
```

---

### STEP 3E-2 · TASK-031 (ANTIGRAVITY — Admin Scholar Review Prototypes)
**Agent**: 🟡 ANTIGRAVITY
**Wait for**: TASK-024 done
**Start in parallel with**: 3E-1 or after

---

**PROMPT TO SEND TO ANTIGRAVITY:**

```
Task: Create 5 distinct frontend prototype variants for the Admin Scholar Review Panel.

Context: Admin users review pending scholar applications and approve or reject them. Read: .agents/contracts/scholar-role-system.md

Create in: frontend/src/features/scholar/prototypes/ (add to existing prototypes folder)
Files: AdminReviewPrototype1.tsx through AdminReviewPrototype5.tsx
Add to PrototypesViewer.tsx with a toggle to switch between "Scholar Apply" and "Admin Review" prototypes.
Temp route: /prototypes/scholar-review

Each design shows: a list/queue of pending applications + detail view of selected application + approve/reject action.
Mock data: 6 pending applications with name, specialties, credentials, applicationDate, bio.

Explore these 5 distinct approaches:
1. Table list + slide-over detail panel (click row → panel slides in from right)
2. Kanban board (Pending → Approved → Rejected columns with drag-drop)
3. Email-style inbox (left column list, right column full detail view like Gmail)
4. Card stack (large cards, swipe or button approve/reject like Tinder)
5. Timeline view (applications sorted by date, expand inline to see details + act)

Each design must include:
- Approve button (green) and Reject button (red) with confirmation dialog
- Rejection reason textarea (shown when rejecting)
- Display: applicant name + avatar + specialties badges + credentials list + bio + date applied
- Pagination or load-more for long lists

Rules: frontend only, mocked data, use existing design system.
```

---

### STEP 3E-3 · TASK-032 (ANTIGRAVITY — Scholar Badge + Profile Prototypes)
**Agent**: 🟡 ANTIGRAVITY
**Wait for**: TASK-024 done

---

**PROMPT TO SEND TO ANTIGRAVITY:**

```
Task: Create 5 distinct prototype variants exploring Scholar Badge design and Scholar Public Profile Page.

Context: Verified scholars get a visible badge next to their name everywhere (posts, comments, chat, profile). Read: .agents/contracts/scholar-role-system.md

Create in: frontend/src/features/scholar/prototypes/
Files: BadgePrototype1.tsx through BadgePrototype5.tsx
Add to PrototypesViewer.tsx. Temp route: /prototypes/scholar-badge

Each prototype must show BOTH:
A) The badge design itself — shown inline in 3 contexts: post card, comment, chat message
B) The full Scholar Public Profile Page layout

For the badge (5 distinct designs):
1. Green crescent moon icon + "Scholar" text in small pill
2. Green filled star (⭐) with "Verified" tooltip on hover
3. Green shield checkmark (like Discord Nitro badge style)
4. Small Arabic calligraphy "ع" (for Aalim/scholar) in circular badge
5. Gold laurel icon + specialty tag (e.g., "Hadith Scholar")

For the Profile Page (same for all or vary per variant):
- Header: avatar, name + badge, specialty tags, stats (courses, students, rating)
- Bio section
- Credentials list (institution, degree, year)
- Teaching languages
- Courses tab (placeholder grid)
- Student reviews tab (placeholder)
- "Apply to study" CTA button

Rules: frontend only, mocked data, use existing design system. Show mock post/comment context for badge placement.
```

---

### STEP 3E-4 · TASK-033 (ANTIGRAVITY — Payment + Subscription Prototypes)
**Agent**: 🟡 ANTIGRAVITY
**Wait for**: TASK-024 done

---

**PROMPT TO SEND TO ANTIGRAVITY:**

```
Task: Create 5 distinct prototype variants for the Payment and Subscription pages.

Context: DeenVerse will have paid courses and subscription plans. Read: .agents/contracts/payment-system.md (Section 4, 6.4).

Create in: frontend/src/features/payments/prototypes/
Files: PaymentPrototype1.tsx through PaymentPrototype5.tsx
PrototypesViewer.tsx + temp route: /prototypes/payments

Each prototype must design BOTH:
A) Subscription Plans Page — showing Free, Student ($9.99/mo), Premium ($19.99/mo) plans
B) Checkout Confirmation Page — intermediate page before Stripe redirect (shows course name, price, what's included)
C) Payment History Page — list of past transactions (date, amount, course/subscription, status badge)

The 3 subscription plans (mocked):
- Free: community features, hadith browsing, basic Q&A
- Student $9.99/mo: all self-paced courses, 2 live sessions/month, certificates
- Premium $19.99/mo: unlimited live sessions, 1-on-1 scholar sessions, early access

Explore 5 distinct approaches:
1. Side-by-side pricing cards (standard SaaS style, most-popular highlighted)
2. Feature comparison table (rows = features, columns = plans, checkmarks)
3. Slider/toggle (monthly vs yearly with discount badge)
4. Stacked mobile-first cards with animated expand on select
5. Islamic-themed: Masjid silhouette header, Arabic calligraphy section titles, gold/green palette

Rules: frontend only, all mocked, existing design system (shadcn/ui, Tailwind, Lucide, Framer Motion).
```

---

### STEP 3E-5 · TASK-034 (ANTIGRAVITY — Scholar Earnings Dashboard Prototypes)
**Agent**: 🟡 ANTIGRAVITY
**Wait for**: TASK-024 done

---

**PROMPT TO SEND TO ANTIGRAVITY:**

```
Task: Create 5 distinct prototype variants for the Scholar Earnings Dashboard.

Context: Verified scholars can see their course revenue, pending payouts, and Stripe Connect status. Read: .agents/contracts/payment-system.md

Create in: frontend/src/features/payments/prototypes/ (same folder)
Files: EarningsPrototype1.tsx through EarningsPrototype5.tsx
Add to PrototypesViewer.tsx + temp route: /prototypes/scholar-earnings

Mock data to use:
- Total earnings this month: $1,240
- Platform commission: $372 (30%)
- Scholar's net: $868
- Pending payout: $420 (next: March 15)
- 3 courses with earnings: Tafseer Al-Baqarah ($640), Tajweed Basics ($480), Fiqh of Prayer ($120)
- Stripe Connect status: connected ✅, payouts enabled ✅

Each prototype must include:
- Earnings summary (total, net, commission, pending payout) 
- Course revenue breakdown
- Transaction history list (last 5 entries)
- Stripe Connect status card + "Go to Stripe Dashboard" button
- Period selector (This Month / This Quarter / This Year)

Explore 5 distinct dashboard approaches:
1. Classic analytics dashboard (big number cards on top, bar chart below, table at bottom)
2. Minimal list-first (no charts, clean rows with amounts, expandable per-course)
3. Metric rings/donut charts (visual split: gross vs net vs commission)
4. Timeline activity feed (each payout/enrollment as a feed item with amounts)
5. Scholar "salary slip" aesthetic (payslip-style layout per period, printable)

Rules: frontend only, mocked data, use recharts or a simple SVG for charts, existing design system.
```

---

## STAGE 2 → STAGE 3 GATE: Your Review

> **You must do this before any SONNET integration steps.**
> Open each prototype set at these routes and pick ONE winner per set:

| Route | Pick from | Task |
|-------|-----------|------|
| `/prototypes/scholar-apply` | Prototypes 1–5 | For TASK-035 |
| `/prototypes/scholar-review` | AdminReviewPrototypes 1–5 | For TASK-036 |
| `/prototypes/scholar-badge` | BadgePrototypes 1–5 | For TASK-037 |
| `/prototypes/payments` | PaymentPrototypes 1–5 | For TASK-038 |
| `/prototypes/scholar-earnings` | EarningsPrototypes 1–5 | For TASK-039 |

Note your choices (e.g., "Apply: 3, Review: 1, Badge: 4, Payments: 2, Earnings: 5") before proceeding.

---

## STAGE 3 — Frontend Integration (Sonnet) + Testing (Opus)

> **Run SONNET integration and OPUS tests in parallel.**

---

### STEP 4A · TASK-035 (SONNET — Integrate Scholar Application Page)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-026 done + TASK-030 done + you've picked a prototype
**TICK before starting**:
```
tick claim TASK-035 copilot-2
```

---

**PROMPT TO SEND (fill in `[N]` with your chosen prototype number):**

```
TASK-035: Promote Scholar Application Prototype [N] to production.

Read first:
- .agents/contracts/scholar-role-system.md
- frontend/src/features/scholar/prototypes/Prototype[N].tsx (the chosen prototype)
- frontend/src/lib/api.ts (Axios instance to understand how to make API calls)
- frontend/src/stores/authStore.ts (to understand the user/auth shape)

Do the following:

1. Create frontend/src/features/scholar/ScholarApplicationPage.tsx
   Promote the chosen prototype design. Replace all mocked data + fake handlers with real hooks.
   Import and use useScholarApplication hook (step 2 below).
   Show application status (pending/approved/rejected) if user has already applied.

2. Create frontend/src/features/scholar/useScholar.ts with TanStack Query hooks:
   - useApplicationStatus(): GET /api/v1/scholars/application-status
   - useApplyForScholar(): useMutation → POST /api/v1/scholars/apply
   - useScholarProfile(id): GET /api/v1/scholars/:id/profile
   Use the types from @deenverse/shared (ScholarApplication, scholarApplicationSchema for validation).

3. Register route in frontend router: /scholar/apply → ScholarApplicationPage (lazy-loaded, AuthGuard wrapped)

4. Add a "Become a Scholar" link in the user profile dropdown or settings menu (find the right place by reading the existing nav/header components).

5. Delete the prototypes folder only for the scholar-apply prototypes (keep others).

After completing:
tick comment TASK-035 copilot-2 --note "Scholar Application Page integrated. useScholar hook created. Route /scholar/apply live."
tick done TASK-035 copilot-2
```

---

### STEP 4B · TASK-036 (SONNET — Integrate Admin Review Panel)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-026 done + TASK-031 done + you've picked a prototype
**TICK before starting**:
```
tick claim TASK-036 copilot-2
```

---

**PROMPT TO SEND (fill in `[N]`):**

```
TASK-036: Promote Admin Scholar Review Panel Prototype [N] to production.

Read first:
- .agents/contracts/scholar-role-system.md
- frontend/src/features/scholar/prototypes/AdminReviewPrototype[N].tsx
- frontend/src/features/scholar/useScholar.ts (already created in TASK-035)
- Any existing admin panel pages to match the layout pattern

Do the following:

1. Create frontend/src/features/scholar/AdminScholarReviewPage.tsx
   Promote the chosen prototype. Wire up real hooks.

2. Add to useScholar.ts:
   - useAdminScholarApplications(status, page): GET /api/v1/admin/scholars/applications?status=...
   - useReviewApplication(): useMutation → PUT /api/v1/admin/scholars/applications/:userId/review
   - useAdminScholarList(page): GET /api/v1/admin/scholars

3. Register route: /admin/scholars → AdminScholarReviewPage (lazy, AuthGuard + admin role check)

4. Delete admin review prototypes from the prototypes folder.

After completing:
tick comment TASK-036 copilot-2 --note "Admin Scholar Review Panel integrated. Admin route /admin/scholars live."
tick done TASK-036 copilot-2
```

---

### STEP 4C · TASK-037 (SONNET — Scholar Badge + Profile)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-025 done + TASK-032 done + you've picked a badge design
**TICK before starting**:
```
tick claim TASK-037 copilot-2
```

---

**PROMPT TO SEND (fill in `[N]`):**

```
TASK-037: Build ScholarBadge component and integrate it across the app + Scholar Profile Page.

Read first:
- frontend/src/features/scholar/prototypes/BadgePrototype[N].tsx (chosen badge design)
- frontend/src/components/ (find existing card/post components where badge should appear)
- .agents/contracts/scholar-role-system.md

Do the following:

1. Create frontend/src/components/ScholarBadge.tsx
   Reusable badge using the chosen design (from BadgePrototype[N]). Props: { role: string, size?: 'sm'|'md'|'lg' }. Only renders if role === 'scholar' | 'admin' | 'moderator'. Each role gets appropriate visual treatment.

2. Add ScholarBadge in these locations (read each file first to know where it fits):
   - Post card component (wherever author name is shown)
   - Comment/reply component
   - Chat message component
   - Profile header component
   - Search results (if a user row component exists)

3. Create frontend/src/features/scholar/ScholarProfilePage.tsx
   Using the Profile Page section from BadgePrototype[N]. Wire to useScholarProfile(id) hook from useScholar.ts.
   Register route: /scholars/:id

4. Delete badge prototypes folder.

After completing:
tick comment TASK-037 copilot-2 --note "ScholarBadge component created and sprinkled into post/comment/chat/profile. Scholar Profile Page live at /scholars/:id."
tick done TASK-037 copilot-2
```

---

### STEP 4D · TASK-038 (SONNET — Payment Checkout + Subscription)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-028 done + TASK-033 done + you've picked a prototype
**TICK before starting**:
```
tick claim TASK-038 copilot-2
```

---

**PROMPT TO SEND (fill in `[N]`):**

```
TASK-038: Integrate Payment Checkout and Subscription pages.

Read first:
- .agents/contracts/payment-system.md (full file)
- frontend/src/features/payments/prototypes/PaymentPrototype[N].tsx
- frontend/src/lib/api.ts

Do the following:

1. Create frontend/src/features/payments/usePayments.ts with TanStack Query hooks:
   - useCreateCheckout(): useMutation → POST /api/v1/payments/checkout → redirects to returned url
   - useCreateSubscription(): useMutation → POST /api/v1/payments/subscription → redirects
   - useCancelSubscription(): useMutation → DELETE /api/v1/payments/subscription
   - usePaymentHistory(page): GET /api/v1/payments/history

2. Create frontend/src/features/payments/SubscriptionPage.tsx
   From PaymentPrototype[N] subscription plans section. Wire useCreateSubscription.
   Show current plan if subscribed. Cancel button uses useCancelSubscription (with confirmation dialog).

3. Create frontend/src/features/payments/CheckoutPage.tsx
   Checkout confirmation intermediate page (shown before Stripe redirect).
   Accept courseSlug query param. Call useCreateCheckout on mount or on confirm click.
   Show loading/redirecting state.

4. Create frontend/src/features/payments/PaymentHistoryPage.tsx
   From PaymentPrototype[N] transaction history section. Wire usePaymentHistory.

5. Routes:
   /subscription → SubscriptionPage (AuthGuard)
   /checkout → CheckoutPage (AuthGuard)
   /payments/history → PaymentHistoryPage (AuthGuard)

6. Add "Upgrade Plan" CTA somewhere appropriate (settings page or profile).

7. Delete payment prototypes.

After completing:
tick comment TASK-038 copilot-2 --note "Payment checkout, subscription, and history pages integrated."
tick done TASK-038 copilot-2
```

---

### STEP 4E · TASK-039 (SONNET — Scholar Earnings Dashboard)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-029 done + TASK-034 done + you've picked a prototype
**TICK before starting**:
```
tick claim TASK-039 copilot-2
```

---

**PROMPT TO SEND (fill in `[N]`):**

```
TASK-039: Integrate Scholar Earnings Dashboard.

Read first:
- .agents/contracts/payment-system.md
- frontend/src/features/payments/prototypes/EarningsPrototype[N].tsx
- frontend/src/features/payments/usePayments.ts (already created)

Do the following:

1. Add to usePayments.ts:
   - useScholarEarnings(period): GET /api/v1/scholars/earnings?period=...
   - useScholarEarningsDetails(page): GET /api/v1/scholars/earnings/details
   - useStripeConnect(): GET /api/v1/scholars/stripe/status
   - useStripeConnectOnboard(): useMutation → POST /api/v1/scholars/stripe/connect → redirect to returned url

2. Create frontend/src/features/payments/ScholarEarningsPage.tsx
   Promote EarningsPrototype[N]. Wire all hooks. Period selector (month/quarter/year) triggers refetch.
   Stripe Connect status card: connected ✅ or setup CTA → triggers useStripeConnectOnboard.

3. Create frontend/src/features/payments/ScholarStripeSetupPage.tsx
   Simple page shown after returning from Stripe onboarding (success/error states).

4. Routes:
   /scholar/earnings → ScholarEarningsPage (AuthGuard + isScholar check in component)
   /scholar/stripe-setup → ScholarStripeSetupPage (AuthGuard)

5. Add "Earnings" link to scholar dashboard/nav (only visible if user.role === 'scholar').

6. Delete earnings prototypes.

After completing:
tick comment TASK-039 copilot-2 --note "Scholar Earnings Dashboard and Stripe setup flow integrated."
tick done TASK-039 copilot-2
```

---

### STEP 4F · TASK-040 (OPUS — Unit Tests: Scholar)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-026 done
**Start in parallel with**: STEP 4A–4E
**TICK before starting**:
```
tick claim TASK-040 copilot
```

---

**PROMPT TO SEND:**

```
TASK-040: Write unit tests for Scholar models, service, and middleware.

Read first:
- backend/models/userSchema.js (scholarProfile fields)
- backend/middlewares/admin.js (isScholar, isScholarOrAdmin)
- backend/services/scholarService.js

Set up a test framework if not already configured. Check backend/package.json for existing test setup. Use Jest (or Vitest if already configured). Create tests in backend/tests/ or backend/__tests__/.

Write unit tests for:

1. Scholar Middleware (backend/__tests__/scholarMiddleware.test.js):
   - isScholar: allows role==='scholar', allows role==='admin', blocks role==='user', blocks role==='moderator', handles missing user (404), handles DB error
   - isScholarOrAdmin: same coverage

2. Scholar Service (backend/__tests__/scholarService.test.js):
   - applyForScholar: success case creates pending application, rejects duplicate pending application, rejects if already approved scholar
   - getApplicationStatus: returns correct status fields, 404 if user not found
   - reviewApplication (approve): sets role to 'scholar', sets applicationStatus to 'approved', sets verifiedAt + verifiedBy
   - reviewApplication (reject): sets applicationStatus to 'rejected', stores rejectionReason, does NOT change role
   - getScholarProfile: returns data for valid scholar, throws 404 for non-scholar user

Use jest.mock() to mock mongoose models. Do not hit a real database in unit tests.

After completing:
tick comment TASK-040 copilot --note "Unit tests for scholar middleware + service written. All passing."
tick done TASK-040 copilot
```

---

### STEP 4G · TASK-041 (OPUS — Unit Tests: Payment)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-028 + TASK-029 done
**TICK before starting**:
```
tick claim TASK-041 copilot
```

---

**PROMPT TO SEND:**

```
TASK-041: Write unit tests for Payment service and webhook handler.

Read first:
- backend/services/stripeService.js
- backend/controller/webhookController.js
- backend/models/paymentSchema.js

Write unit tests in backend/__tests__/:

1. Stripe Service (stripeService.test.js):
   - createConnectAccount: calls stripe.accounts.create with correct params, stores stripeConnectId, returns onboarding URL
   - getExpressDashboardLink: calls stripe.accounts.createLoginLink, returns url
   - getConnectAccountStatus: returns { connected: true, chargesEnabled, payoutsEnabled } correctly
   - createCheckoutSession: correct application_fee_amount calculation (platform % of price), correct transfer_data.destination, correct success/cancel URLs
   Mock the Stripe SDK with jest.mock('stripe')

2. Webhook Handler (webhookController.test.js):
   - Valid signature: processes event correctly
   - Invalid signature: returns 400 with error message
   - checkout.session.completed: creates Payment record, is idempotent (second identical event does not create duplicate)
   - customer.subscription.updated: updates user's subscription fields
   - customer.subscription.deleted: downgrades user's plan
   - Unknown event type: returns 200 without crashing
   Mock stripe.webhooks.constructEvent

After completing:
tick comment TASK-041 copilot --note "Unit tests for stripeService + webhookController written. Idempotency tested."
tick done TASK-041 copilot
```

---

### STEP 4H · TASK-042 (OPUS — Smoke Tests)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-040 + TASK-041 both done
**TICK before starting**:
```
tick claim TASK-042 copilot
```

---

**PROMPT TO SEND:**

```
TASK-042: Write smoke/integration tests for all Phase 1 API endpoints.

Read first:
- All Phase 1 route files (scholarRoute.js, paymentRoute.js, webhookRoute.js)
- backend/index.js (app setup)
- backend/__tests__/ (see existing test setup)

Use supertest to make real HTTP requests against the Express app (no live DB — use mongodb-memory-server or mock mongoose).

Write backend/__tests__/smoke/phase1.smoke.test.js covering:

SCHOLAR FLOW:
1. Unauthenticated request to POST /api/v1/scholars/apply → 401
2. Authenticated user (role='user') POST /api/v1/scholars/apply with valid body → 200, applicationStatus becomes 'pending'
3. Same user GET /api/v1/scholars/application-status → returns 'pending'
4. Same user POST /api/v1/scholars/apply again while pending → 400 (duplicate)
5. Admin PUT /api/v1/admin/scholars/applications/:userId/review with decision='approved' → 200, user role becomes 'scholar'
6. Non-admin user trying GET /api/v1/admin/scholars/applications → 403
7. GET /api/v1/scholars/:id/profile for a scholar → 200 with scholar data
8. GET /api/v1/scholars/:id/profile for a non-scholar → 404

PAYMENT FLOW:
9. Unauthenticated POST /api/v1/payments/checkout → 401
10. Authenticated user POST /api/v1/payments/checkout (mock stripe) → 200 with { sessionId, url }
11. POST /api/v1/webhooks/stripe with invalid signature → 400
12. POST /api/v1/webhooks/stripe with valid signature + checkout.session.completed → 200, Payment record created
13. POST /api/v1/webhooks/stripe same event again → 200, no duplicate Payment record (idempotency check)
14. Scholar GET /api/v1/scholars/earnings → 200
15. Non-scholar GET /api/v1/scholars/earnings → 403

Mock all Stripe SDK calls. Use an in-memory MongoDB for the tests.

After completing:
tick comment TASK-042 copilot --note "All 15 smoke tests passing. Phase 1 API verified."
tick done TASK-042 copilot
```

---

## STAGE 4 — Documentation + Final Commit

---

### STEP 5 · TASK-043 (SONNET — Docs, Feature Board, Commit)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: ALL of TASK-035, 036, 037, 038, 039 done
**TICK before starting**:
```
tick claim TASK-043 copilot-2
```

---

**PROMPT TO SEND:**

```
TASK-043: Update all documentation, mark features complete, run lint, and do the final commit.

Do the following in order:

1. Run frontend lint: cd frontend && npm run lint
   Fix any lint errors introduced by Phase 1 code (unused imports, type errors, etc.) before committing.

2. Update .agents/feature-board.md:
   - Scholar Role System row: mark Shared ✅, Backend ✅, Frontend ✅
   - Payment System row: mark Shared ✅, Backend ✅, Frontend ✅
   - Move both features from "Upcoming" to "Active Features" table

3. Update .agents/contracts/scholar-role-system.md:
   - Set Status to ✅ Complete
   - Add handover log entry with today's date and "Phase 1 implementation complete"

4. Update .agents/contracts/payment-system.md:
   - Set Status to ✅ Complete
   - Add handover log entry

5. Update ROADMAP.md (if it exists): add Phase 1 completion note.

6. Commit all Phase 1 code with conventional commits:
   git add .
   git commit -m "feat(scholar): add scholar role system, application API, isScholar middleware"
   git commit -m "feat(payments): add Stripe Connect, checkout, webhook, earnings API"
   git commit -m "feat(frontend): integrate scholar application, badge, admin review, payment flows"
   git commit -m "test(phase1): add unit + smoke tests for scholar and payment APIs"
   git commit -m "docs: update feature board and contracts for Phase 1 completion"

After completing:
tick comment TASK-043 copilot-2 --note "Phase 1 complete. Lint clean. Feature board updated. All commits pushed."
tick done TASK-043 copilot-2
```

---

## Quick Reference: Phase 1 Checklist

```
STAGE 1 — Foundation
  [ ] STEP 1 · TASK-024 · OPUS   · Shared Zod schemas
  [ ] STEP 2 · TASK-025 · OPUS   · userSchema + isScholar middleware

STAGE 2 — Backend + Prototypes (parallel)
  [ ] STEP 3A · TASK-026 · OPUS        · Scholar Application API
  [ ] STEP 3B · TASK-027 · OPUS        · Stripe Connect service + models
  [ ] STEP 3C · TASK-028 · OPUS        · Payment checkout + webhook
  [ ] STEP 3D · TASK-029 · OPUS        · Scholar earnings API
  [ ] STEP 3E-1 · TASK-030 · ANTIGRAV  · Scholar Apply prototypes (5 variants)
  [ ] STEP 3E-2 · TASK-031 · ANTIGRAV  · Admin Review prototypes (5 variants)
  [ ] STEP 3E-3 · TASK-032 · ANTIGRAV  · Badge + Profile prototypes (5 variants)
  [ ] STEP 3E-4 · TASK-033 · ANTIGRAV  · Payment page prototypes (5 variants)
  [ ] STEP 3E-5 · TASK-034 · ANTIGRAV  · Scholar Earnings prototypes (5 variants)

⭐ REVIEW GATE — YOU pick 1 winner per prototype set

STAGE 3 — Integration + Testing (parallel)
  [ ] STEP 4A · TASK-035 · SONNET · Integrate Scholar Apply page
  [ ] STEP 4B · TASK-036 · SONNET · Integrate Admin Review panel
  [ ] STEP 4C · TASK-037 · SONNET · Integrate Badge + Profile
  [ ] STEP 4D · TASK-038 · SONNET · Integrate Payment + Subscription
  [ ] STEP 4E · TASK-039 · SONNET · Integrate Earnings Dashboard
  [ ] STEP 4F · TASK-040 · OPUS   · Unit tests: Scholar
  [ ] STEP 4G · TASK-041 · OPUS   · Unit tests: Payment
  [ ] STEP 4H · TASK-042 · OPUS   · Smoke tests: All APIs

STAGE 4 — Finalize
  [ ] STEP 5 · TASK-043 · SONNET · Docs + Feature board + Final commit
```

---

## Notes

- **TICK.md is the source of truth** — always claim before starting, always done after finishing
- **Contracts are in** `.agents/contracts/` — every agent reads them before coding
- **Never skip the review gate** — Sonnet integration must wait for you to pick a prototype
- **Opus runs tests independently** — no need to wait for frontend to finish
- **Phase 2** (Course System) planning begins only after TASK-043 is done and you confirm satisfaction
