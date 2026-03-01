# Feed Backend + Upload Code Review

Date: 2026-02-28
Reviewer: Copilot (GPT-5.3-Codex)

## Scope

Reviewed and tested backend feed and upload related flow:

- `backend/routes/postRoute.js`
- `backend/controller/postController.js`
- `backend/services/postService.js`
- `backend/models/postSchema.js`
- `backend/routes/uploadRoute.js`
- `backend/controller/uploadController.js`
- `backend/services/uploadService.js`
- `backend/routes/shareRoute.js`
- `backend/controller/shareController.js`
- `backend/services/shareService.js`
- `backend/services/shareEnrichment.js`
- `backend/middlewares/errorHandler.js`
- `backend/middlewares/rateLimiter.js`
- `backend/middlewares/validators.js`
- `backend/config/aws.js`
- `frontend/src/hooks/useUpload.ts`
- `frontend/src/components/ui/image-upload.tsx`
- `frontend/src/features/feed/usePosts.ts`

---

## Summary

Feed and share functionality are working end-to-end.

Upload is failing in current environment because AWS credentials are not configured yet. This is deferred to backlog per request.

One startup bug was fixed during review:

- `backend/services/userService.js` import changed to named import for `LearningProgress`.

---

## Findings

### 🔴 Critical

1. Upload presign fails with 500 when AWS credentials are missing
- Area: `backend/services/uploadService.js`
- Error seen: `CredentialsProviderError: Could not load credentials from any providers`
- Impact: `/api/v1/upload/presign` is non-functional until AWS env is configured.

2. Invalid post id can return 500 (CastError)
- Area: post interaction routes/service (`like`, `repost`, `delete`, `get by id`)
- Impact: malformed IDs can produce internal errors instead of clean validation responses.

### 🟡 Warning

1. No Mongo ObjectId param validation on some `/:id` post routes
- Suggested: attach existing validator middleware for these routes.

2. `getPostById` increments views after read
- Area: `backend/services/postService.js`
- Impact: returned payload may not reflect incremented `views` value in that same response.

3. Presign command includes `ContentLength`
- Area: `backend/services/uploadService.js`
- Risk: strict size/header matching can cause avoidable S3 upload mismatch failures in some clients.

4. Stack traces visible in development responses
- Area: `backend/middlewares/errorHandler.js`
- Note: expected with `NODE_ENV=development`, but ensure production runs with `NODE_ENV=production`.

### ✅ LGTM

- Controller-service layering and route registration are consistent.
- Feed query behavior (`following`, `trending`, cursor pagination) works in runtime tests.
- Share-to-feed flow works and enriches shared payload as expected.
- Frontend upload hook flow (presign → PUT → confirm) is correctly structured.

---

## Runtime Test Results

Environment: local backend on port `8081`.

### Passed

- `GET /health` → 200
- `GET /api/v1/posts/trending/hashtags` → 200
- `GET /api/v1/posts/user/:username` → expected 200/404 behavior
- `GET /api/v1/posts/feed` (with auth) → 200
- `GET /api/v1/posts/feed` (without auth) → 401
- `POST /api/v1/posts` → 201
- `POST /api/v1/posts/:id/like` → 200 (toggle verified)
- `POST /api/v1/posts/:id/repost` → 200
- `GET /api/v1/posts/:id` → 200
- `GET /api/v1/posts/hashtag/:tag` → 200
- `DELETE /api/v1/posts/:id` → 200 then 404 on second delete
- `POST /api/v1/share/to-feed` → 201

### Failed

- `POST /api/v1/upload/presign` → 500
  - Reason: missing AWS credentials in backend environment.

---

## Changes Made During Review

1. Fixed backend startup import mismatch
- File: `backend/services/userService.js`
- Change: `LearningProgress` import switched from default to named import.

No other code changes were applied as part of this review document handoff.

---

## Backlog (Deferred Tasks)

### AWS Integration (Deferred by request)

Status: **Backlog** (not implemented now)

Tasks:

1. Add AWS credentials/config in backend env
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET_AVATARS`
- `S3_BUCKET_MEDIA`
- `S3_BUCKET_STREAMS`
- `CDN_BASE_URL` (optional)

2. Validate S3 bucket CORS for browser `PUT` from frontend origin(s)

3. Re-test upload flow end-to-end
- Presign (`/api/v1/upload/presign`)
- Browser PUT to signed URL
- Confirm (`/api/v1/upload/confirm`)

4. (Optional hardening) Improve upload error handling/messages for credential/config failures

---

## Recommended Next Fix Batch (non-AWS)

When ready, prioritize these quick backend fixes:

1. Add ObjectId param validation middleware to post routes with `:id`.
2. Map Mongoose CastError to 400 in centralized error handler.
3. Revisit `ContentLength` usage in presigned upload command.

These can be done independently of AWS integration.
