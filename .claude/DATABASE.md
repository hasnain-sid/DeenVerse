# Database (MongoDB / Mongoose 8)

No migration tooling — schema changes ride on Mongoose defaults. Connection in `backend/config/database.js` (`MONGO_URI`).

## Models (24, in `backend/models/`)
- **Social**: userSchema (embedded followers/following arrays ⚠️ unbounded), postSchema (hashtags, replies, sharedContent), conversationSchema + messageSchema, notificationSchema (type + optional message/link), collectionSchema, pushSubscriptionSchema, reportSchema, auditLogSchema, analyticsEventSchema
- **Education**: courseSchema (slug, modules[]→lessons[], pricing, status enum draft→pending-review→published→archived, min/max validators), enrollmentSchema (unique student+course, progress subdoc), quizSchema (questions[], status active/archived), quizAttemptSchema, scholarPaymentSchema, paymentSchema
- **Classroom**: classroomSchema (livekitRoomName, access: public/followers/course-only, recordings[], whiteboardSnapshot, deletedAt), classroomParticipantSchema
- **Streaming**: streamSchema (IVS channel data)
- **Content/learning**: DailyLearning, learningProgressSchema, signSchema, spiritualPracticeSchema, topicReflectionSchema

## Indexes worth knowing
- posts: `{createdAt:-1}`, `{author,createdAt}`, `{hashtags,createdAt}`, `{sharedContent.kind,createdAt}`
- enrollments: unique `{student,course}`, `{course,status}`, `{student,status}`
- user: unique username/email, sparse stripeCustomerId

## Patterns & rules
- **Named exports only** (`export const X = mongoose.model(...)`) — no default exports on models.
- Enrollment uses a **multi-document transaction** (capacity check via `$expr` + `$inc`) → requires replica set (Atlas/tests OK, standalone local Mongo fails).
- Counters (`enrollmentCount`, `participantCount`, `totalStudents`) maintained by `$inc` — guard decrements (see classroomService `wasParticipant` pattern).
- Progress updates use `$addToSet`/`$pull`, not read-modify-write.
- Quiz delete = soft-archive when submitted attempts exist (preserve grades).
- Redis cache TTLs in `services/cacheService.js` (user 5m, feed 1m, quran 7d…); invalidate on writes.

Known scale debt: follower arrays + unpaginated user queries → needs a Follow collection (see KNOWN_ISSUES #15).
