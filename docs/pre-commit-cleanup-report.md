# Pre-Commit Cleanup Report

**Generated:** 2026-03-01  
**Updated:** March 2026 — fix statuses added after post-merge audit  
**Scope:** 64 changed files (tracked + untracked) across backend, frontend, config, and docs
**Branch status:** No prototype folders found — previously cleaned. No TypeScript compilation errors. No orphan API calls. All deleted file references successfully removed.

---

## Table of Contents

1. [Critical — Must Fix Before Merge](#-critical--must-fix-before-merge)
2. [Warnings — Should Fix](#-warnings--should-fix)
3. [Suggestions — Nice to Have](#-suggestions--nice-to-have)
4. [Console Statements to Remove/Replace](#console-statements-to-removereplace)
5. [Hardcoded URLs to Address](#hardcoded-urls-to-address)
6. [Dead / Stub Code to Remove](#dead--stub-code-to-remove)
7. [Clean Files (LGTM)](#-clean-files-lgtm)

---

## 🔴 Critical — Must Fix Before Merge

### C1. Open Redirect via `sourceRoute` (Security) — 🟡 PARTIALLY RESOLVED
| | |
|---|---|
| **Files** | `backend/middlewares/validators.js`, `backend/services/shareEnrichment.js`, `frontend/src/features/feed/SharedContentCard.tsx` |
| **Status** | `shareEnrichment.js` has `startsWith("/")` guard ✅. Validators still lack `matches(/^\/[a-zA-Z0-9\-_/%.]*$/)` regex ⚠️. `SharedContentCard.tsx` renders `<Link to={...}>` without `startsWith('/')` defensive check ⚠️. |
| **Fix (backend validators.js)** | Add `.matches(/^\/[a-zA-Z0-9\-_/%.]*$/).withMessage('sourceRoute must be an internal path')` |
| **Fix (shareEnrichment.js)** | Guard: `sourceRoute: raw.sourceRoute?.startsWith("/") ? raw.sourceRoute.trim().slice(0, 500) : undefined` |
| **Fix (SharedContentCard.tsx)** | Defensive check: `{sharedContent.sourceRoute?.startsWith('/') && <Link to={...}>}` |

### C2. Reset Token Leaked in Non-Production Response — 🔴 STILL PENDING
| | |
|---|---|
| **Files** | `backend/controller/userController.js` (L246-252), `backend/services/userService.js` (L288) |
| **Issue** | `forgotPassword` returns raw `resetToken` in the HTTP response when `NODE_ENV !== 'production'`. If `NODE_ENV` is unset (defaults to `undefined`), the token is exposed — this is an account-takeover vector. |
| **Fix** | Never return `resetToken` in the response body. Use `logger.debug()` only. Remove the `DEV ONLY` block. |

### C3. `getOtherUsersProfiles` Returns ALL Users (DoS + Data Leak) — 🔴 STILL PENDING
| | |
|---|---|
| **File** | `backend/services/userService.js` (L113-116) |
| **Issue** | `User.find({ _id: { $ne: currentUserId } }).select("-password")` returns every user with no `.limit()` or pagination. At scale this dumps the entire user table. |
| **Fix** | Add `.limit(50)` and pagination, or remove if unused. |

### C4. Business Logic in Controller (Architecture Violation) — 🔴 STILL PENDING
| | |
|---|---|
| **File** | `backend/controller/dailyLearningController.js` (L57-88, L110) |
| **Issue** | `saveUserReflection` directly does `new DailyLearning(...)` and `.save()`. `getUserLearningHistory` queries DB directly. Violates `routes → controller → service → model` pattern. |
| **Fix** | Create `backend/services/dailyLearningService.js`, move DB operations there. |

### C5. Missing Input Validation on `saved/:id` Route — 🔴 STILL PENDING
| | |
|---|---|
| **File** | `backend/routes/userRoute.js` (L51) |
| **Issue** | `PUT /saved/:id` has no validation middleware. Arbitrary strings stored in user's `saved` array — potential NoSQL injection or schema pollution. |
| **Fix** | Add a validator ensuring `:id` matches expected hadith ID format (alphanumeric/integer). |

### C6. `confirm()` Used Instead of Custom UI — 🔴 STILL PENDING
| | |
|---|---|
| **File** | `frontend/src/features/saved/SavedPage.tsx` (L251) |
| **Issue** | `if (confirm(...))` violates project rule: use `react-hot-toast` or shadcn confirmation dialog, not browser `confirm()`/`alert()`. |
| **Fix** | Replace with shadcn `<AlertDialog>` or a custom confirmation component. |

### C7. Untyped `any` Without Justification — 🔴 STILL PENDING
| | |
|---|---|
| **File** | `frontend/src/features/learn-quran/LearnQuranHub.tsx` (L99) |
| **Issue** | `function FeatureCard({ feature }: { feature: any })` — violates `noUnusedLocals`/strict TS rules. |
| **Fix** | Define a `FeatureItem` interface and type the prop. |

### C8. Barrel Import Prevents Tree-Shaking (Bundle Size) — 🔴 STILL PENDING
| | |
|---|---|
| **File** | `frontend/src/features/quran-topics/components/TopicCard.tsx` (L2) |
| **Issue** | `import * as Icons from 'lucide-react'` with dynamic access `(Icons as any)[name]` forces the entire icon library (~280+ KB) into the bundle. Cannot be tree-shaken. May blow the 250 KB chunk limit. |
| **Fix** | Use an icon map: `const iconMap = { Book, Heart, Star, ... }` with named imports, then `iconMap[name]`. |

---

## 🟡 Warnings — Should Fix

> **March 2026 update**: Warnings W1–W20 below are **unresolved unless noted**. The feed-backend-optimization-research.md Phase 1 recommendations have been implemented (cursor pagination, cache key redesign) which resolves feeds-related items.

### W1. `/preview` Route Missing Validation and Rate Limiter — 🟡 PENDING
| **File** | `backend/routes/shareRoute.js` (L27), `backend/controller/shareController.js` (L31-35) |
|---|---|
| **Issue** | `POST /share/preview` has `isAuthenticated` but no validation middleware and no rate limiter. Unvalidated input hits the enrichment pipeline. |
| **Fix** | Add validation rules and a rate limiter matching the `/to-feed` pattern. |

### W2. Sloppy `req.body` Fallback in Share Controller
| **File** | `backend/controller/shareController.js` (L34) |
|---|---|
| **Issue** | `req.body.sharedContent || req.body` — if `sharedContent` key is missing, the entire request body is passed as content. Could leak unexpected fields. |
| **Fix** | Require `sharedContent` explicitly; return 400 if absent. |

### W3. `console.warn` Instead of `logger.warn`
| **File** | `backend/services/userService.js` (L288) |
|---|---|
| **Issue** | `console.warn('[UserService] Email send failed:')` bypasses the Winston logger. Won't appear in structured logs or monitoring. |
| **Fix** | Replace with `logger.warn(...)`. |

### W4. Raw `Error()` Instead of `AppError()`
| **File** | `backend/services/quranService.js` (L40) |
|---|---|
| **Issue** | `throw new Error(...)` instead of `throw new AppError(...)`. Centralized error handler may not format raw errors correctly. |
| **Fix** | `throw new AppError(\`AlQuran Cloud API error ${res.status}\`, 502)` |

### W5. View Count Not Deduplicated
| **File** | `backend/services/postService.js` (L304) |
|---|---|
| **Issue** | `$inc: { views: 1 }` on every request — inflatable by refreshes/bots. |
| **Fix** | Rate-limit per user+post (Redis set with TTL) or defer to analytics. |

### W6. In-Memory Pagination for Followers/Following
| **File** | `backend/services/userService.js` (L334-347) |
|---|---|
| **Issue** | Loads full `followers` array, then `.slice()` client-side. O(n) per page for large follower counts. |
| **Fix** | Use `$slice` projection or aggregation, or migrate to a `Follow` junction collection. |

### W7. Unbounded Arrays on Schemas
| **Files** | `backend/models/userSchema.js` (L18-20, L30-38), `backend/models/postSchema.js` (L48-60) |
|---|---|
| **Issue** | `saved`, `followers`, `following` (user), `likes`, `reposts` (post) arrays grow without limits. Risk hitting 16 MB BSON limit. |
| **Fix** | Add max-length validators, or migrate to junction collections long-term. |

### W8. Missing `username` Format Validation
| **File** | `backend/middlewares/validators.js` (L216-230) |
|---|---|
| **Issue** | `updateProfileValidationRules` doesn't validate `username` format. Users could set special chars, spaces, or excessively long names. |
| **Fix** | Add `body('username').optional().trim().matches(/^[\w]{3,30}$/)`. |

### W9. `forgotPassword` Shares `loginLimiter` Bucket
| **File** | `backend/routes/userRoute.js` (L44) |
|---|---|
| **Issue** | Reset password floods burn login rate-limit attempts. |
| **Fix** | Use a dedicated `resetPasswordLimiter`. |

### W10. `quranController` Swallows Original Error Context
| **File** | `backend/controller/quranController.js` (L22) |
|---|---|
| **Issue** | `next(new AppError("Failed to fetch ayah", 500))` swallows original error's message/status. An `AppError(404)` from the service becomes 500 to the client. |
| **Fix** | `if (error instanceof AppError) return next(error);` before the generic fallback. |

### W11. Hand-Rolled Dropdown Missing A11y
| **File** | `frontend/src/features/share/ShareActionsMenu.tsx` (L97-170) |
|---|---|
| **Issue** | Custom dropdown lacks click-outside-to-close, escape key handling, focus trapping, and ARIA attributes. |
| **Fix** | Replace with shadcn `<DropdownMenu>`. |

### W12. Hardcoded Dark Colors Bypass Design System
| **File** | `frontend/src/features/daily-learning/components/ReflectionSplitView.tsx` (L64-68, L141) |
|---|---|
| **Issue** | `bg-[#0f0f0f]`, `bg-[#0a0a0a]`, `bg-[#141414]` — always render dark regardless of theme mode. |
| **Fix** | Use `bg-card`, `bg-background`, `text-foreground` from Tailwind theme. |

### W13. Prototype Stub Handler — False Functionality
| **File** | `frontend/src/features/quran-topics/components/AyahCard.tsx` (L56-58) |
|---|---|
| **Issue** | `handleMarkComplete` shows a success toast but makes no API call. Creates false impression that spaced repetition is working. |
| **Fix** | Wire to backend API, or show "Coming Soon" indicator, or remove the button. |

### W14. `useSigns` Forces Mock Mode in All Dev
| **File** | `frontend/src/features/iman-boost/useSigns.ts` (L10-11) |
|---|---|
| **Issue** | `const USE_MOCK = import.meta.env.DEV` — all development testing uses mock data, never hitting real API. |
| **Fix** | Use a dedicated `VITE_USE_MOCK_SIGNS` env var instead. |

### W15. `window.location.reload()` for Retry
| **File** | `frontend/src/features/feed/FeedPage.tsx` (L72) |
|---|---|
| **Issue** | Full page reload loses all client state. |
| **Fix** | Use TanStack Query's `refetch()`. |

### W16. Raw `api.put()` in Component Instead of `useMutation`
| **Files** | `frontend/src/features/hadith/HadithPage.tsx` (L40-55), `frontend/src/features/saved/SavedPage.tsx` (L89-101) |
|---|---|
| **Issue** | Direct `api.put()` calls in event handlers instead of TanStack Query mutations. No loading state, no error recovery, no query invalidation. |
| **Fix** | Extract to `useMutation` hooks. |

### W17. Misplaced Hooks
| **File** | `frontend/src/features/feed/usePosts.ts` (L205-234) |
|---|---|
| **Issue** | `usePublicProfile` and `useFollow` are user-concern hooks living in the feed module. |
| **Fix** | Move to `frontend/src/features/user/` or `frontend/src/hooks/`. |

### W18. Missing ARIA Attributes on Interactive Elements
| **Files** | `frontend/src/features/feed/FeedPage.tsx` (L54-64), `frontend/src/features/saved/SavedPage.tsx` (L166-179), `frontend/src/features/hadith/HadithCard.tsx` (L131-140), `frontend/src/components/layout/Sidebar.tsx` (L120), `frontend/src/components/layout/MobileNav.tsx` (L67-74) |
|---|---|
| **Issue** | Tab buttons lack `role="tab"` / `aria-selected`. Icon-only buttons lack `aria-label`. Mobile nav overlay lacks focus trapping. |

### W19. Missing `parseInt` Radix
| **File** | `backend/controller/userController.js` (L301-302, L312-313) |
|---|---|
| **Issue** | `parseInt(page)` without radix parameter. |
| **Fix** | `parseInt(page, 10)` |

### W20. Missing ObjectId Validation on Stream Routes
| **File** | `backend/routes/streamRoute.js` (L24-26) |
|---|---|
| **Issue** | `PATCH /:id/start`, `PATCH /:id/end`, `GET /:id` don't validate `:id` is a valid MongoDB ObjectId. |
| **Fix** | Add `mongoIdParamValidationRules()` middleware. |

### W21. Untyped `useQuery` Returns
| **Files** | `frontend/src/features/daily-learning/useDailyLearning.ts` (L48), `frontend/src/features/ruhani/api/ruhaniApi.ts` (L46), `frontend/src/features/home/useHome.ts` (L72) |
|---|---|
| **Issue** | Multiple `useQuery` / API calls return implicitly `any` data. |
| **Fix** | Add generic type parameter: `useQuery<ResponseType>(...)` or `api.get<T>(...)`. |

---

## 🟢 Suggestions — Nice to Have

### S1. `cacheService.js` — Silent Error Swallowing
Empty `catch {}` blocks throughout. Add `logger.debug()` for outage diagnosis.

### S2. Duplicated Navigation Arrays
`Sidebar.tsx` and `MobileNav.tsx` define nearly identical nav arrays. Extract to shared `navigationConfig.ts`.

### S3. Duplicated Pagination Parsing in `postController.js`
Same `parseInt(page, 10) || 1`, `parseInt(limit, 10) || 20` pattern repeated 4 times. Extract `parsePaginationQuery()` helper.

### S4. UTC-Only Streak Calculation
`streakService.js` (L51-52) — Users near UTC boundary may have their learning credited to the wrong day. Document as intentional or handle timezone.

### S5. `getJournal` Alias in `ruhaniController.js`
`export const getJournal = getUserPractices;` — consider redirecting at route level instead of function aliasing.

### S6. `check-feature-integrity.js` — No Error Handling for Missing Files
`fs.readFileSync(indexPath)` will throw if `backend/index.js` doesn't exist. Add `fs.existsSync` check.

### S7. `navigator.clipboard.writeText` Without Feature Check
`PostCard.tsx` (L192) — Not available in all contexts. Wrap in try/catch.

### S8. Inconsistent Lazy Import Patterns in `App.tsx`
`PrivacyPolicy` / `TermsOfService` use standard default import instead of the named-export re-wrap pattern used everywhere else.

### S9. Default `streakGoal` Magic Number
`streakService.js` (L109) — `user.streakGoal ?? 7` inline default could diverge from schema default.

### S10. Array Index Used as Key for Static Array
`HomePage.tsx` (L103) — `STATS.map((stat, i) => <div key={i}>)`. Using `stat.label` would be more robust.

---

## Console Statements to Remove/Replace

### Must Remove (v2 frontend code)
| File | Line | Statement | Action |
|---|---|---|---|
| `frontend/src/lib/socket.ts` | 40 | `console.log('⚡ Socket connected:')` | Remove or use debug utility |
| `frontend/src/lib/socket.ts` | 48 | `console.log('🔌 Socket disconnected:')` | Remove or use debug utility |
| `frontend/src/lib/socket.ts` | 63 | `console.log('Socket manually disconnected')` | Remove |
| `frontend/src/lib/socket.ts` | 44 | `console.warn('Socket connection error:')` | Remove or use debug utility |

### Must Replace with Logger (backend services)
| File | Line | Statement | Action |
|---|---|---|---|
| `backend/services/userService.js` | 288 | `console.warn('[UserService] Email send failed:')` | → `logger.warn(...)` |
| `backend/services/analyticsService.js` | 20 | `console.warn("Analytics track error:")` | → `logger.warn(...)` |

### Acceptable (infrastructure/startup)
| File | Line | Statement | Notes |
|---|---|---|---|
| `backend/config/redis.js` | 46,52,62,66 | Redis status logs | Startup info, acceptable |
| `backend/config/auth.js` | 75 | `console.error("FATAL: TOKEN_SECRET")` | Fatal error, acceptable |
| `backend/socket/index.js` | 70,161 | Socket connect/disconnect | Consider replacing with logger |
| `backend/scripts/seedSigns.js` | * | Multiple | CLI script, expected |

### Legacy — Do Not Touch
All `console.*` in `frontend/src/_legacy/` — archived code, not modified per project rules.

---

## Hardcoded URLs to Address

| File | Line | URL | Risk | Action |
|---|---|---|---|---|
| `backend/index.js` | 60,61 | `http://localhost:3000`, `http://localhost:3001` | CORS in prod | Gate behind `NODE_ENV === 'development'` |
| `backend/services/emailService.js` | 142 | `http://localhost:3000` | Wrong link in prod emails | Require `FRONTEND_URL` env var, throw if missing in prod |
| `backend/services/userService.js` | 285 | `http://localhost:3000` | Same as above | Same fix |

---

## Dead / Stub Code to Remove

| File | Line | Code | Issue |
|---|---|---|---|
| `frontend/src/features/quran-topics/components/AyahCard.tsx` | 56-58 | `handleMarkComplete()` | Toast-only stub — no backend integration. Either wire to API or remove button. |
| `backend/controller/userController.js` | 248 | `// DEV ONLY — remove in production` comment + token leak block | Remove the entire dev-only `resetToken` response block |
| `frontend/src/features/iman-boost/useSigns.ts` | 10-11 | `USE_MOCK = import.meta.env.DEV` + mock data | Should be behind a specific env var, not blanket dev mode |

---

## ✅ Clean Files (LGTM)

These files passed all review categories with no findings:

**Backend:**
- `backend/services/shareEnrichment.js` — Clean utility, AppError used, good JSDoc
- `backend/services/shareService.js` — Clean delegation pattern
- `backend/services/streakService.js` — Solid aggregation logic

**Frontend:**
- `frontend/src/types/post.ts` — Clean types with good JSDoc
- `frontend/src/types/user.ts` — Clean extension types
- `frontend/src/features/quran/useQuranReader.ts` — Well-constrained queries
- `frontend/src/features/quran-topics/useQuranTopics.ts` — Proper TanStack Query usage
- `frontend/src/features/quran-topics/components/MoodCard.tsx` — Clean, accessible
- `frontend/src/features/share/types.ts` — Clean type definitions
- `frontend/src/features/share/useShare.ts` — Proper mutation pattern

**Infrastructure:**
- All route registrations in `backend/index.js` are correct
- All deleted file references have been cleaned up
- All validator imports are valid
- No orphan frontend API calls
- No TypeScript compilation errors
- No dangling imports from deleted files

---

## Summary

| Severity | Count | Key Themes |
|----------|-------|------------|
| 🔴 **Critical** | 8 | Security (open redirect, token leak, data dump), architecture violations (logic in controller, untyped any), bundle size |
| 🟡 **Warning** | 21 | Missing validation/rate-limiting, a11y gaps, hardcoded colors, prototype stubs, misplaced hooks, unbounded arrays |
| 🟢 **Suggestion** | 10 | Code deduplication, navigation config, silent error handling, minor inconsistencies |
| ✅ **LGTM** | 10 | Clean files passing all checks |

### Recommended Fix Order
1. **Security first:** C1 (open redirect), C2 (token leak), C3 (user dump), C5 (validation)
2. **Architecture:** C4 (service layer), C7 (any type), C8 (bundle size)
3. **UX/Quality:** C6 (confirm), W11 (dropdown a11y), W12 (theme colors)
4. **Warnings:** W1-W21 as capacity allows
5. **Suggestions:** S1-S10 optional pre-merge
