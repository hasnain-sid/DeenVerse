# API Reference (route map)

Base: `/api/v1`. Mounted in `backend/index.js`. Response convention: `{ ...payload, success: true }`; errors `{ success: false, message }` via errorHandler. Auth = `isAuthenticated` (Bearer or refresh-cookie), `optionalAuth`, `isScholar`, `isAdmin` (ADMIN_IDS), `isEnrolled`/`courseAccess`.

| Mount | Route file | Purpose / notes |
|---|---|---|
| /user | userRoute | register, login (rate-limited + validated), logout(POST), refresh, me, profile/:id, follow/unfollow, saved/:id, search, forgot/reset-password, followers/following/suggestions |
| /collections | collectionRoute | saved-content collections |
| /posts | postRoute | feed CRUD, likes, replies, trending (feedLimiter) |
| /notifications | notificationRoute | list, read, unread count |
| /chat | chatRoute | conversations + messages (limiters) |
| /streams | streamRoute | IVS channels, go-live |
| /push | pushRoute | Web Push subscriptions |
| /upload | uploadRoute | S3 presign → PUT → confirm |
| /moderation | moderationRoute | reports + 7 admin actions (no UI yet) |
| /analytics | analyticsRoute | event tracking (3 routes, no dashboard) |
| /daily-learning | dailyLearningRoute | daily content + progress |
| /quran | quranRoute | reader data (alquran.cloud proxy, heavy caching) |
| /quran-topics | quranTopicRoute | topic browse + detail |
| /ruhani | ruhaniRoute | 13 routes, zero frontend consumers |
| /signs | signRoute | seeded "signs" content |
| /share | shareRoute | share-to-feed enrichment |
| /scholars | scholarRoute | apply, admin review, profiles |
| /payments | paymentRoute | Stripe checkout, subscriptions, Connect onboarding, earnings |
| /courses | courseRoute | CRUD (Zod-validated), modules (isScholar), enroll (transactional), progress, lessons, quizzes-per-course |
| /quizzes | quizRoute | quiz CRUD, start (answers stripped), submit (graded) |
| /classrooms | classroomRoute | CRUD, lifecycle (start/end), join (access-gated), controls, recordings, whiteboard |
| /admin/courses | adminCourseRoute | review queue (isAdmin) |
| /webhooks | webhookRoute | **Stripe, raw body — mounted BEFORE express.json; never move** |

Non-API: `/health` (no auth), `/sitemap.xml` + `/robots.txt` (seoRoute at root).

Socket.IO events (same origin/auth): presence (`user:online`, `users:online`), chat, notifications push, classroom (`classroom:join-room` — enrollment/follower-gated, `hand-raise`, `grant-speak` — host-verified, `whiteboard:save/load` — throttled/gated).

Drift check: `npm run check:integrity`. Known orphan: `POST /user/:param`.
