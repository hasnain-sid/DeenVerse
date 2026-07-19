# 05 — API Documentation

> Route-level map of the backend API. There is no OpenAPI/Swagger spec (planned, never built — [09_Technical_Debt.md](09_Technical_Debt.md)); route files under `backend/routes/` are the ground truth, and `npm run check:integrity` cross-checks them against frontend usage.

## Conventions

- **Base path**: `/api/v1`, mounted in `backend/index.js`.
- **Success responses**: `{ ...payload, success: true }`. **Errors**: `{ success: false, message }` with an appropriate status, produced by the central error handler from thrown `AppError`s.
- **Auth middleware** (see [02_Architecture.md](02_Architecture.md)):
  - `isAuthenticated` — requires a valid access JWT (Bearer header) *or* refresh cookie; sets `req.user` to the userId string.
  - `optionalAuth` — same, but proceeds unauthenticated on failure.
  - `isScholar` — verified scholar role required.
  - `isAdmin` — userId must be in the `ADMIN_IDS` env allowlist.
  - `isEnrolled` / `courseAccess` — gates paid course content by enrollment.
- **Validation**: newer surfaces (courses, quizzes, classrooms) validate bodies with `@deenverse/shared` Zod schemas; auth routes use express-validator; many older routes have no validation (a known injection-surface issue, [08_Code_Review.md](08_Code_Review.md) #6).
- **Rate limiting**: global 100 req/min, plus per-route limiters (login 5/15min, feed, chat, …) from `middlewares/rateLimiter.js`.

## Route map

| Mount | Route file | Purpose / notes |
|---|---|---|
| `/user` | `userRoute` | register, login (rate-limited + validated), logout (POST), refresh, me, `profile/:id`, follow/unfollow, `saved/:id`, search, forgot/reset-password, followers/following/suggestions |
| `/collections` | `collectionRoute` | Saved-content collections |
| `/posts` | `postRoute` | Feed CRUD, likes, replies, trending (feed limiter) |
| `/notifications` | `notificationRoute` | List, mark-read, unread count |
| `/chat` | `chatRoute` | Conversations + messages (rate-limited) |
| `/streams` | `streamRoute` | AWS IVS channels, go-live |
| `/push` | `pushRoute` | Web Push subscription management |
| `/upload` | `uploadRoute` | S3 presign → client PUT → confirm flow |
| `/moderation` | `moderationRoute` | Reports + 7 admin actions — **no admin UI consumes these yet** |
| `/analytics` | `analyticsRoute` | Event tracking (3 routes) — **no dashboard consumes these yet** |
| `/daily-learning` | `dailyLearningRoute` | Daily content + user progress |
| `/quran` | `quranRoute` | Quran reader data (alquran.cloud proxy, heavily cached) |
| `/quran-topics` | `quranTopicRoute` | Topic browse + detail |
| `/ruhani` | `ruhaniRoute` | Spiritual practices hub — **13 routes with zero frontend consumers** |
| `/signs` | `signRoute` | Seeded "Signs" content |
| `/share` | `shareRoute` | Share-to-feed content enrichment |
| `/scholars` | `scholarRoute` | Scholar application, admin review, public profiles |
| `/payments` | `paymentRoute` | Stripe checkout, subscriptions, Connect onboarding, earnings |
| `/courses` | `courseRoute` | Course CRUD (Zod-validated), modules (`isScholar`), enroll (**transactional — needs replica set**), progress, lessons, quizzes-per-course |
| `/quizzes` | `quizRoute` | Quiz CRUD, start (correct answers stripped server-side), submit (server-graded) |
| `/classrooms` | `classroomRoute` | CRUD, lifecycle (start/end), join (access-gated), host controls, recordings, whiteboard persistence |
| `/admin/courses` | `adminCourseRoute` | Course review queue (`isAdmin`) |
| `/webhooks` | `webhookRoute` | **Stripe webhooks — raw body, mounted BEFORE `express.json()`. Never move.** |

**Non-API endpoints**: `GET /health` (unauthenticated healthcheck), `/sitemap.xml` and `/robots.txt` (SEO route at root).

**Known drift**: the integrity checker flags one orphan endpoint, `POST /user/:param`, that no frontend code calls — slated for removal ([14_Unfinished_Work.md](14_Unfinished_Work.md)).

## Socket.IO events

Same origin and JWT auth as HTTP (token supplied in the connection handshake). Key event families:

- **Presence** — `user:online`, `users:online`; server tracks connected users in process memory.
- **Chat** — message delivery into per-user rooms `user:{id}`.
- **Notifications** — pushed to `user:{id}` alongside DB persistence.
- **Classroom** — `classroom:join-room` (server enforces enrollment/follower access — this check was part of the recovered Phase 2.5 security work), `hand-raise` queueing, `grant-speak` (host-verified), `whiteboard:save`/`whiteboard:load` (throttled, host/permission-gated).

## Worked example: authenticated request lifecycle

1. Client calls `POST /api/v1/user/login` → response contains an access token (JSON) and sets the httpOnly refresh cookie.
2. Frontend stores the access token in the Zustand auth store (memory only) and sends it as `Authorization: Bearer …` on every request via `lib/api.ts`.
3. After 15 minutes the access token expires → next API call gets a 401 → the axios interceptor calls `POST /user/refresh` (cookie auth), queueing concurrent requests → new access token → original requests retried transparently.
4. Logout: `POST /user/logout` clears the cookie. ⚠️ It does **not** invalidate the refresh JWT itself — an exfiltrated token remains valid until its 7-day expiry ([08_Code_Review.md](08_Code_Review.md) #2).
