# 06 — Database

> MongoDB (Atlas in production) via Mongoose 8. Connection logic in `backend/config/database.js`, driven by `MONGO_URI` (⚠️ not `MONGODB_URI` — old `.env.example` copies had it wrong). **There is no migration tooling** — schema changes ride on Mongoose defaults, which is a known risk as enum and index changes accumulate.

## Model inventory (24 models, `backend/models/`)

Model files are named `<name>Schema.js` and export **named** constants: `export const X = mongoose.model(...)`. Never add default exports — a `.default` import bug against the `Enrollment` model once silently broke classroom sockets.

### Social core
| Model | Notes |
|---|---|
| `userSchema` | Profile, credentials, scholar/role fields, `banned`/`mutedUntil` (⚠️ not enforced at auth), **embedded `followers`/`following` arrays — unbounded**, `saved` (untyped `[String]` ids), sparse `stripeCustomerId` |
| `postSchema` | Feed posts: hashtags, mentions, replies, `sharedContent` (hadith/ayah embeds) |
| `conversationSchema` / `messageSchema` | Direct messaging |
| `notificationSchema` | Typed notifications with optional message/link payload |
| `collectionSchema` | Saved-content collections |
| `pushSubscriptionSchema` | Web Push endpoints |
| `reportSchema` / `auditLogSchema` | Moderation reports + admin action log |
| `analyticsEventSchema` | Event tracking |

### Education / commerce
| Model | Notes |
|---|---|
| `courseSchema` | Slug, `modules[]` → `lessons[]`, pricing, status enum `draft → pending-review → published → archived`, min/max validators |
| `enrollmentSchema` | **Unique `{student, course}`**, progress subdocument, capacity-checked transactional creation |
| `quizSchema` | `questions[]` with correct answers (stripped on `/start`), status `active`/`archived` |
| `quizAttemptSchema` | Graded attempts — the reason quiz deletion is a soft-archive |
| `paymentSchema` / `scholarPaymentSchema` | Stripe records; payouts and 30% commission accounting |

### Classroom & streaming
| Model | Notes |
|---|---|
| `classroomSchema` | `livekitRoomName`, access mode `public`/`followers`/`course-only`, `recordings[]` (LiveKit egress → S3), `whiteboardSnapshot`, `deletedAt` soft delete |
| `classroomParticipantSchema` | Attendance/participation |
| `streamSchema` | AWS IVS channel data |

### Content / learning
`DailyLearning`, `learningProgressSchema`, `signSchema`, `spiritualPracticeSchema` (Ruhani), `topicReflectionSchema`.

## Indexes worth knowing

- **posts**: `{createdAt:-1}`, `{author, createdAt}`, `{hashtags, createdAt}`, `{sharedContent.kind, createdAt}` — the feed and trending queries lean on these.
- **enrollments**: unique `{student, course}`, plus `{course, status}` and `{student, status}`.
- **user**: unique `username` and `email`; sparse `stripeCustomerId`.

## Patterns and rules

1. **Transactions require a replica set.** Enrollment creation is a multi-document transaction (capacity check via `$expr` + counter `$inc`). Works on Atlas and in tests (which use `MongoMemoryReplSet`); **fails on standalone local Mongo**. This is the #1 local-onboarding trap.
2. **Counters are `$inc`-maintained** (`enrollmentCount`, `participantCount`, `totalStudents`) — never read-modify-write, and guard decrements against double-firing (see the `wasParticipant` pattern in `classroomService`).
3. **Progress updates use `$addToSet`/`$pull`**, again avoiding read-modify-write races.
4. **Soft deletes where history matters**: quiz "delete" archives when submitted attempts exist (preserving grades); classrooms use `deletedAt`.
5. **Cache discipline**: Redis TTLs are centralized in `services/cacheService.js` (user 5m, feed 1m, Quran 7d, …). Invalidate on writes; the cache no-ops when Redis is down, so never *depend* on it.

## Known data-model debt

Details in [09_Technical_Debt.md](09_Technical_Debt.md):

- **The social graph is embedded** — follower/following arrays live on the user document. Unbounded growth heads toward the 16MB document limit and hot-document write contention; the fix is a dedicated `Follow` collection with paginated queries. Related: `getOtherUsersProfiles` currently returns **all users unpaginated**.
- **No migrations** — adopt `migrate-mongo` (or similar) before the next schema-shape change.
- **`user.saved` is untyped** — plain string ids with no ref, so no populate and no integrity.
- **Mongoose `ValidationError`/`CastError` surface as 500s** — the error handler's specific handling is commented out, so bad ObjectIds look like server crashes to clients.
