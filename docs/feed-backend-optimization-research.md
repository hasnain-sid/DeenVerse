# Feed Backend Optimization & Modernization Research Brief

Date: 2026-02-26  
Workspace: DeenVerse monorepo  
Focus: Feed backend architecture, performance, correctness, and modernization strategy

---

## 1) Scope Reviewed

### Backend files
- `backend/routes/postRoute.js`
- `backend/controller/postController.js`
- `backend/services/postService.js`
- `backend/models/postSchema.js`
- `backend/services/cacheService.js`
- `backend/routes/shareRoute.js`
- `backend/controller/shareController.js`
- `backend/services/shareService.js`
- `backend/services/shareEnrichment.js`
- `backend/middlewares/validators.js`
- `backend/middlewares/rateLimiter.js`

### Frontend integration touchpoints (for API contract sanity)
- `frontend/src/features/feed/usePosts.ts`
- `frontend/src/features/feed/FeedPage.tsx`
- `frontend/src/types/post.ts`

---

## 2) Research Method (Deep Research)

This brief combines:
1. **Local codebase audit** (feed/query/cache/auth/validation flows)
2. **Web research (Exa MCP)** for production feed patterns
3. **GitHub pattern research (Exa MCP)** for battle-tested implementations

### Priority of sources used
- Official docs first
- Mature OSS repositories second
- Engineering writeups/blogs as supporting references

---

## 3) External References (Key Sources)

### Official docs
- MongoDB `cursor.skip()` behavior and pagination caveats:  
  https://www.mongodb.com/docs/manual/reference/method/cursor.skip/
- Redis sorted sets data model (time-ordered access primitive):  
  https://redis.io/docs/latest/develop/data-types/sorted-sets/

### Mature OSS / practical implementations
- Mixmax cursor pagination for MongoDB (used in production):  
  https://github.com/mixmaxhq/mongo-cursor-pagination
- MongoDB Socialite feed docs (historical but relevant feed architecture ideas):  
  https://github.com/mongodb-labs/socialite/blob/master/docs/feed.md

### Supporting architecture guidance
- Stream/Activity feed architecture tradeoffs (fanout, hydration, serving views):  
  https://getstream.io/blog/scalable-activity-feed-architecture/

---

## 4) Current Architecture Snapshot (DeenVerse Feed)

- **Feed generation model today**: fan-out-on-read style from `Post` + `User.following` query
- **Pagination today**: offset-like (`skip` + `limit`)
- **Feed caching today**: per-user + tab + page in Redis (TTL-based)
- **Engagement model**: likes/reposts stored as arrays on post + denormalized counters
- **Trending**: Mongo aggregation over hashtags with cache

---

## 5) Code Review Findings

### 🔴 Critical

1. **Offset pagination still used in hot feed paths**  
   - `backend/services/postService.js` (`getFeed`, `getUserPosts`, `getPostsByHashtag`)  
   - Uses `skip/limit`, which degrades with deeper pages and large collections.

2. **Feed cache key can collide across page-size variants**  
   - `backend/services/cacheService.js` (`feed:${userId}:${tab}:${page}`)  
   - `limit` (and future cursor semantics) is not encoded in key.

### 🟡 Warning

3. **Invalidation scope is too narrow for multi-user freshness**  
   - `createPost` invalidates only author feed namespace.  
   - Followers may see stale feed entries until TTL expiration.

4. **Potential post document growth issue**  
   - `likes[]` and `reposts[]` arrays in `postSchema` can grow unbounded for viral posts.

5. **Trending query accepts client-driven limit without strict service-side cap**  
   - Can increase aggregation load if abused.

6. **Multi-step write consistency not transactional**  
   - Post creation/reply count/notifications run as separate operations without session transaction boundaries.

### 🟢 Suggestion

7. Add query observability for feed paths (duration, cardinality, cache hit/miss tags) to enable data-driven tuning.

---

## 6) Modernization Options (Compared)

### Option A — Incremental Modernization (Recommended first)

**What**
- Migrate feed endpoints from `skip/limit` to **cursor/keyset pagination** (`createdAt` + `_id` tie-breaker)
- Redesign feed cache keys (include pagination semantics)
- Add strict caps/validation and deterministic sort contracts

**Pros**
- Lowest migration risk
- Immediate p95 latency benefits at scale
- Minimal infrastructure changes

**Cons**
- Does not fully solve celebrity fan-out economics by itself

---

### Option B — Hybrid Timeline (Phase 2)

**What**
- Redis timeline materialization for normal users (fan-out-on-write)
- Keep fan-out-on-read for high-follower users (celebrity threshold)
- Hydrate post IDs from Mongo

**Pros**
- Fast reads for most users
- Better scale behavior under normal traffic

**Cons**
- Added complexity (workers, backpressure, reconciliation)

---

### Option C — Event-driven Feed Platform

**What**
- Queue-driven feed workers, precomputed timelines, ranking pipeline

**Pros**
- Highest long-term scalability and ranking flexibility

**Cons**
- Highest complexity, longer delivery, higher operational overhead

---

## 7) Recommendation for DeenVerse

Use a **two-step strategy**:

1. **Implement Option A now** (cursor pagination + cache key redesign + stricter guards)
2. **Adopt Option B later** when feed traffic justifies hybrid fan-out

Reason: best balance of speed-to-value, risk control, and architecture alignment with existing Express + Mongo + optional Redis stack.

---

## 8) Proposed Implementation Plan

### Phase 1 (1–2 sprints)

1. **Cursor pagination contract**
   - Update `/api/v1/posts/feed`, `/api/v1/posts/user/:username`, `/api/v1/posts/hashtag/:hashtag`
   - Return `nextCursor` (+ optional `prevCursor` if needed)

2. **Service query refactor**
   - Replace `skip/limit` with keyset range query:
     - Sort: `{ createdAt: -1, _id: -1 }`
     - Cursor token carries `{ createdAt, _id }`

3. **Cache key redesign**
   - Include tab + limit + cursor signature in key
   - Keep short TTL + explicit invalidation hooks

4. **Validation hardening**
   - Strong server-side caps for `limit` and `trending limit`
   - Normalize and sanitize cursor payload parsing

5. **Observability**
   - Add per-endpoint metrics/log fields:
     - `cacheHit`
     - `queryTimeMs`
     - `resultCount`
     - `cursorUsed`

### Phase 2 (as traffic grows)

1. Introduce hybrid fan-out timeline service
2. Add background workers + retry/idempotency for feed fanout jobs
3. Keep follower graph reads efficient with targeted indexing and batching

---

## 9) API Evolution / Compatibility Plan

- Keep temporary support for legacy page params (`page`) while introducing cursor params
- Prefer dual-mode response during migration window
- Frontend gradually switches to cursor mode in TanStack Query infinite endpoints

---

## 10) Risks & Mitigations

1. **Risk: cursor duplicates / missing items across pages**  
   Mitigation: stable sort with tie-breaker (`createdAt`, `_id`) and strict compare logic.

2. **Risk: stale cache after writes**  
   Mitigation: tighten invalidation events + short TTL + jitter.

3. **Risk: migration complexity on clients**  
   Mitigation: dual-contract period and feature flag rollout.

4. **Risk: eventual consistency in fan-out phase**  
   Mitigation: background reconciliation jobs and idempotent writes.

---

## 11) Success Metrics (Track Before/After)

- Feed endpoint p50/p95/p99 latency
- Mongo query time + scanned/returned ratio
- Cache hit rate for feed/trending
- Duplicate/missing item rate in infinite scroll sessions
- Error rates (4xx/5xx) on feed endpoints

---

## 12) Suggested Next Execution Task

If approved, the next implementation brief should be:

1. Cursor pagination for feed/user/hashtag endpoints (backend only)
2. Cache key redesign to include cursor semantics
3. Validation + caps hardening
4. Backward-compatible response contract for frontend migration

---

## Appendix A — Relevant Current Files

- `backend/services/postService.js`
- `backend/services/cacheService.js`
- `backend/controller/postController.js`
- `backend/routes/postRoute.js`
- `backend/models/postSchema.js`
