# Share-to-Feed Code Review Findings

Date: 2026-02-25

## Scope
Review covered the share-to-feed backend/frontend integration and related changed files:

- `backend/services/shareEnrichment.js`
- `backend/services/shareService.js`
- `backend/controller/shareController.js`
- `backend/routes/shareRoute.js`
- `backend/middlewares/validators.js`
- `backend/middlewares/rateLimiter.js`
- `backend/services/postService.js`
- `backend/models/postSchema.js`
- `frontend/src/features/share/useShare.ts`
- `frontend/src/types/post.ts`
- `frontend/src/features/feed/SharedContentCard.tsx`

## Findings

### 🔴 Critical

1. **Frontend endpoint mismatch**
   - `useShareToFeed()` was calling `POST /posts` instead of the dedicated `POST /share/to-feed` endpoint.
   - Impact: bypassed dedicated validation and rate limiting designed for share-to-feed.

2. **Incorrect payload typing for `content`**
   - Frontend mutation typed `content` as required, but backend accepts optional caption and can auto-generate one.
   - Impact: unnecessary frontend constraint and mismatch with backend contract.

3. **Frontend `Post` type missing `shareCount`**
   - Backend schema includes `shareCount`, but frontend `Post` interface did not.
   - Impact: type drift between backend response and frontend model.

### 🟡 Warning

4. **Double enrichment in share path**
   - `shareToFeed()` enriched payload, and `createPost()` enriched it again.
   - Impact: redundant processing on each share request.

### 🟢 Suggestion

5. **Accessibility improvement for shared card links**
   - `SharedContentCard` link wrapper had no `aria-label`.
   - Impact: weaker screen-reader clarity.

### ✅ LGTM

- Route/controller/service layering followed project architecture.
- Share validators and limiter setup were correctly wired.
- Error forwarding via `next(error)` was clean.
- Shared-content enrichment logic and field limits were consistent.

## Fixes Applied

1. **Endpoint corrected in frontend share hook**
   - File: `frontend/src/features/share/useShare.ts`
   - Changed mutation target from `POST /posts` to `POST /share/to-feed`.

2. **Payload type aligned with backend contract**
   - File: `frontend/src/features/share/useShare.ts`
   - Changed mutation payload type from `content: string` to `content?: string`.

3. **`shareCount` added to frontend `Post` type**
   - File: `frontend/src/types/post.ts`
   - Added `shareCount: number`.

4. **Removed redundant enrichment in service layer**
   - File: `backend/services/shareService.js`
   - `shareToFeed()` now delegates raw `sharedContent` to `createPost()` (single enrichment pass in one place).

5. **Added accessibility label on shared-content link**
   - File: `frontend/src/features/feed/SharedContentCard.tsx`
   - Added descriptive `aria-label` on route link wrapper.

## Validation

- Backend module import check completed successfully for updated share service.
- Editor diagnostics showed no new errors in:
  - `frontend/src/features/share/useShare.ts`
  - `frontend/src/types/post.ts`
  - `frontend/src/features/feed/SharedContentCard.tsx`

## Notes

- Existing non-blocking Mongoose duplicate index warnings were observed in unrelated user schema areas during module import. They were not introduced by this share-to-feed change set.