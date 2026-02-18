# DeenVerse — Complete Development Roadmap

> **Islamic Social Media Platform** — Serving millions of users with hadith sharing, Quran learning, live streaming, and community features.
>
> Branch: `redesign/v2-modern` | Started: February 2026

---

## Table of Contents

1. [Phase 1 — Foundation & Redesign](#phase-1--foundation--redesign-week-1-2) ✅ COMPLETED
2. [Phase 2 — Core Features & Polish](#phase-2--core-features--polish-week-3-4)
3. [Phase 3 — Social Platform Features](#phase-3--social-platform-features-week-5-7)
4. [Phase 4 — Real-Time & Live Streaming](#phase-4--real-time--live-streaming-week-8-10)
5. [Phase 5 — AWS Cloud Integration](#phase-5--aws-cloud-integration-week-11-13)
6. [Phase 6 — Scale, Security & Performance](#phase-6--scale-security--performance-week-14-16)
7. [Phase 7 — Mobile App (React Native)](#phase-7--mobile-app-react-native-week-17-22)
8. [Phase 8 — Analytics, Monetization & Launch](#phase-8--analytics-monetization--launch-week-23-26)
9. [Tech Stack Summary](#tech-stack-summary)
10. [Infrastructure Architecture](#infrastructure-architecture)

---

## Phase 1 — Foundation & Redesign (Week 1-2) ✅ COMPLETED

### 1.1 Frontend Migration
- [x] **Step 1**: Create `redesign/v2-modern` branch from `main`
- [x] **Step 2**: Migrate from CRA (react-scripts) → Vite 5.2
- [x] **Step 3**: Add TypeScript support (tsconfig.json, vite-env.d.ts)
- [x] **Step 4**: Replace Redux Toolkit → Zustand 5 (authStore, themeStore, uiStore)
- [x] **Step 5**: Replace manual fetching → TanStack Query 5 (caching, dedup)
- [x] **Step 6**: Replace react-icons (2MB) → Lucide React (tree-shakeable)
- [x] **Step 7**: Setup Tailwind CSS 4 with `@tailwindcss/postcss`
- [x] **Step 8**: Move all old files to `src/_legacy/` for reference

### 1.2 Design System
- [x] **Step 9**: Create CSS design tokens (colors, radius, spacing) in `globals.css`
- [x] **Step 10**: Implement Notion-inspired light/dark theme system
- [x] **Step 11**: Build shadcn/ui-style components: Button, Input, Card, Skeleton, Avatar, Tooltip
- [x] **Step 12**: Custom scrollbars, glass morphism, animations (fadeIn, slideIn)
- [x] **Step 13**: Arabic font support (Amiri) with RTL direction

### 1.3 Layout System
- [x] **Step 14**: Build collapsible Sidebar with navigation links
- [x] **Step 15**: Build TopBar with search, theme toggle, user avatar
- [x] **Step 16**: Build MobileNav bottom navigation
- [x] **Step 17**: Build MainLayout wrapper with Outlet

### 1.4 Feature Modules
- [x] **Step 18**: Create auth module (LoginPage, AuthGuard, useAuth hook)
- [x] **Step 19**: Create hadith module (HadithPage, HadithCard, useHadith hook)
- [x] **Step 20**: Create saved, profile, explore, home modules
- [x] **Step 21**: Setup lazy-loaded routes with code splitting

### 1.5 Backend Critical Fixes
- [x] **Step 22**: Fix password leak in login/register responses (.select("-password"))
- [x] **Step 23**: Add social fields to user schema (bio, avatar, followers, following)
- [x] **Step 24**: Add `/me` authenticated endpoint
- [x] **Step 25**: Fix validator bugs on `/saved/:id`
- [x] **Step 26**: Change logout from GET → POST
- [x] **Step 27**: Fix .gitignore to exclude all `node_modules/`

---

## Phase 2 — Core Features & Polish (Week 3-4)

> **Goal**: Make every existing feature production-quality with proper UX.

### 2.1 Authentication System Overhaul
- [x] **Step 1**: Implement JWT Access + Refresh Token strategy
  - Access token: 15 min expiry, stored in memory (Zustand)
  - Refresh token: 7 day expiry, stored in httpOnly cookie
  - Auto-refresh via Axios interceptor on 401 responses
- [x] **Step 2**: Add registration page with form validation (React Hook Form + Zod)
  - Fields: fullName, username, email, password, confirmPassword
  - Real-time validation feedback
  - Password strength indicator
- [x] **Step 3**: Add "Forgot Password" flow
  - Email input → backend sends reset link → token-based reset page
  - Backend: `/auth/forgot-password` & `/auth/reset-password/:token`
- [ ] **Step 4**: Add email verification flow
  - On register → send verification email with token
  - Backend: `/auth/verify-email/:token`
  - Frontend: Show "Check your email" screen after registration
- [x] **Step 5**: Implement persistent sessions
  - On app load: call `/api/auth/me` with refresh token cookie
  - If valid: populate auth store; if expired: redirect to login
- [ ] **Step 6**: Add Google OAuth login (future: Apple, GitHub)
  - Backend: Passport.js with Google Strategy
  - Frontend: "Continue with Google" button on login page

### 2.2 Hadith Feature — Full Rebuild
- [x] **Step 7**: Redesign HadithCard with Notion-clean styling
  - Arabic text with Amiri font (RTL)
  - Translation below with configurable font & size
  - Source/reference line (hadith book, chapter, number)
  - Swipe gestures for mobile (next/prev)
- [x] **Step 8**: Add hadith category/collection browser
  - Sidebar shows: Sahih Bukhari, Sahih Muslim, Tirmidhi, etc.
  - Click to browse chapters → specific hadiths
- [x] **Step 9**: Implement full-text search for hadiths
  - Frontend: Debounced search input with suggestions dropdown
  - Backend: MongoDB text index on hadith content fields
  - Highlight matching terms in results
- [x] **Step 10**: Add "Share as Image" upgraded feature
  - Multiple card templates (minimal, ornate, dark mode)
  - Custom watermark/branding
  - Download as PNG/JPG
  - Copy to clipboard
- [ ] **Step 11**: Implement hadith audio playback
  - Arabic recitation audio for each hadith (if available)
  - Play/pause controls integrated into HadithCard

### 2.3 Saved/Bookmarks
- [x] **Step 12**: Rebuild bookmarks with proper backend integration
  - `POST /api/bookmarks/:hadithId` — save
  - `DELETE /api/bookmarks/:hadithId` — unsave
  - `GET /api/bookmarks` — list saved (paginated)
- [x] **Step 13**: Add bookmark collections/folders
  - Users can create named collections: "Morning Duas", "Patience", etc.
  - Drag and drop hadiths between collections
- [x] **Step 14**: Implement optimistic updates for bookmark toggle
  - Instant UI feedback before server confirms
  - Rollback on error

### 2.4 Profile Page
- [x] **Step 15**: Build full profile page
  - Avatar (with upload), cover photo
  - Bio, location, website link
  - Stats: posts, followers, following, saved count
  - Activity timeline (recent shares, saves)
- [x] **Step 16**: Implement "Edit Profile" modal
  - Update name, bio, avatar, cover photo
  - Form validation with Zod
  - Image crop/resize before upload
- [x] **Step 17**: Build public profile view
  - `/user/:username` route
  - Show user's shared hadiths, stats
  - Follow/unfollow button

### 2.5 Error Handling & Loading States
- [x] **Step 18**: Add React Error Boundaries with fallback UI
  - Global error boundary wrapping the app
  - Feature-level error boundaries for isolated failures
  - "Something went wrong" page with retry button
- [x] **Step 19**: Add skeleton loading screens for every page
  - HadithPage skeleton, SavedPage skeleton, ProfilePage skeleton
  - Shimmer animation consistent with design system
- [x] **Step 20**: Add empty states for every list
  - "No saved hadiths yet" with illustration
  - "No results found" for search
  - "No posts yet" for feed
- [x] **Step 21**: Add toast notifications for all actions
  - Success: "Hadith saved!", "Profile updated!"
  - Error: "Failed to save, please try again"
  - Info: "You're now following @user"

### 2.6 Search Feature
- [x] **Step 22**: Implement global search (Cmd+K / Ctrl+K)
  - Command palette overlay (like Notion/VS Code)
  - Search hadiths, users, collections
  - Recent searches history (localStorage)
- [x] **Step 23**: Add search results page
  - Tabbed results: Hadiths | Users | Collections
  - Filters: language, hadith book, date range
  - Infinite scroll for results

---

## Phase 3 — Social Platform Features (Week 5-7)

> **Goal**: Transform from a hadith reader into a full Islamic social platform.

### 3.1 Post/Share System (Twitter-like)
- [ ] **Step 1**: Create Post model (backend)
  ```
  Post {
    author: ObjectId (ref: User)
    content: String (max 500 chars)
    hadithRef: ObjectId (optional, ref: Hadith)
    images: [String] (S3 URLs, max 4)
    likes: [ObjectId]
    reposts: [ObjectId]
    replyTo: ObjectId (optional, ref: Post)
    replyCount: Number
    likeCount: Number
    repostCount: Number
    views: Number
    createdAt, updatedAt
  }
  ```
- [ ] **Step 2**: Build Post API endpoints
  - `POST /api/posts` — create post
  - `GET /api/posts/feed` — personalized feed (following + trending)
  - `GET /api/posts/:id` — single post with replies
  - `POST /api/posts/:id/like` — like/unlike (toggle)
  - `POST /api/posts/:id/repost` — repost/unrepost
  - `GET /api/posts/user/:username` — user's posts
  - `DELETE /api/posts/:id` — delete own post
- [ ] **Step 3**: Build "Create Post" composer
  - Rich text area (500 char limit with counter)
  - Attach hadith reference (search & select)
  - Attach images (up to 4, preview before posting)
  - "Post" button with loading state
- [ ] **Step 4**: Build Feed page
  - Infinite scroll with TanStack Query `useInfiniteQuery`
  - Pull-to-refresh on mobile
  - "New posts available" indicator at top
  - Toggle: "Following" vs "Trending" tabs
- [ ] **Step 5**: Build PostCard component
  - Author avatar + name + username + timestamp
  - Post content with @mentions and #hashtag linking
  - Hadith preview embed (if attached)
  - Image grid (1-4 images)
  - Action bar: Like, Reply, Repost, Share, Bookmark
  - Like/repost count with optimistic updates
- [ ] **Step 6**: Build reply/thread system
  - Click post → full post view with replies below
  - Reply composer at bottom
  - Nested replies (1 level deep, like Twitter)

### 3.2 Follow System
- [ ] **Step 7**: Build Follow API
  - `POST /api/users/:id/follow` — follow/unfollow (toggle)
  - `GET /api/users/:id/followers` — paginated followers list
  - `GET /api/users/:id/following` — paginated following list
  - `GET /api/users/suggestions` — "Who to follow" (based on mutual follows)
- [ ] **Step 8**: Build "Who to Follow" sidebar widget
  - Show 3-5 suggested users with Follow button
  - Based on: mutual connections, popular scholars, trending users
- [ ] **Step 9**: Build Followers/Following pages
  - Tab view on profile: Followers | Following
  - Each item: avatar, name, bio snippet, follow button

### 3.3 Notification System
- [ ] **Step 10**: Create Notification model (backend)
  ```
  Notification {
    recipient: ObjectId (ref: User)
    sender: ObjectId (ref: User)
    type: Enum [like, reply, follow, repost, mention, system]
    post: ObjectId (optional)
    read: Boolean (default: false)
    createdAt
  }
  ```
- [ ] **Step 11**: Build Notification API
  - `GET /api/notifications` — paginated, sorted by date
  - `PATCH /api/notifications/read-all` — mark all read
  - `PATCH /api/notifications/:id/read` — mark single read
  - `GET /api/notifications/unread-count` — for badge
- [ ] **Step 12**: Build Notifications page
  - Grouped by type with icons (heart for like, person for follow, etc.)
  - "Mark all as read" button
  - Click notification → navigate to relevant post/profile
- [ ] **Step 13**: Add notification badge to sidebar
  - Red dot / count badge on bell icon
  - Update in real-time (Socket.IO, Phase 4)

### 3.4 Hashtags & Trending
- [ ] **Step 14**: Implement hashtag system
  - Parse #hashtags from post content
  - Store in separate Hashtag collection with usage count
  - Make hashtags clickable → shows all posts with that tag
- [ ] **Step 15**: Build Trending page / sidebar widget
  - Top 10 trending hashtags (last 24h)
  - Trending posts (most likes/reposts in last 24h)
  - "Islamic Daily" — curated trending content

### 3.5 Direct Messages (Foundation)
- [ ] **Step 16**: Create Conversation & Message models
  ```
  Conversation {
    participants: [ObjectId] (exactly 2 for DM)
    lastMessage: ObjectId (ref: Message)
    updatedAt
  }
  Message {
    conversation: ObjectId
    sender: ObjectId
    content: String
    read: Boolean
    createdAt
  }
  ```
- [ ] **Step 17**: Build DM API endpoints
  - `GET /api/conversations` — list user's conversations
  - `POST /api/conversations` — start new conversation
  - `GET /api/conversations/:id/messages` — paginated messages
  - `POST /api/conversations/:id/messages` — send message
- [ ] **Step 18**: Build Messages UI
  - Conversation list (left panel)
  - Chat view (right panel) with message bubbles
  - Message input with send button
  - Unread badge on messages icon in sidebar

---

## Phase 4 — Real-Time & Live Streaming (Week 8-10)

> **Goal**: Add real-time communication and foundation for live streaming to millions.

### 4.1 Socket.IO Integration
- [ ] **Step 1**: Setup Socket.IO server on backend
  - Install: `socket.io`, `@socket.io/redis-adapter`
  - Create `src/socket/index.ts` with connection handler
  - Authenticate socket connections with JWT
  - Namespace separation: `/notifications`, `/chat`, `/stream`
- [ ] **Step 2**: Setup Socket.IO client on frontend
  - Install: `socket.io-client`
  - Create `src/lib/socket.ts` singleton manager
  - Auto-connect on auth, disconnect on logout
  - Reconnection logic with exponential backoff
- [ ] **Step 3**: Real-time notifications
  - Server emits `notification:new` when someone likes/follows/replies
  - Client listens → updates notification badge instantly
  - Toast notification for important events
- [ ] **Step 4**: Real-time chat messages
  - `message:new` event for incoming DMs
  - `typing:start` / `typing:stop` indicators
  - `message:read` receipts
  - Online/offline status indicators (green dot on avatar)
- [ ] **Step 5**: Real-time feed updates
  - "5 new posts" banner when new posts appear in feed
  - Live like/repost count updates on visible posts
  - New follower notifications

### 4.2 Live Streaming — Architecture
- [ ] **Step 6**: Design streaming architecture
  ```
  ┌─────────────┐     RTMP      ┌──────────────┐     HLS     ┌──────────────┐
  │  Broadcaster │ ──────────▶  │  AWS IVS /    │ ─────────▶ │   CloudFront  │
  │  (OBS/App)   │              │  MediaLive    │            │   CDN         │
  └─────────────┘              └──────────────┘            └──────┬───────┘
                                                                  │
                              ┌────────────────┐                  │ HLS
                              │  Socket.IO     │                  ▼
                              │  (Chat/React)  │◀──────── ┌──────────────┐
                              └────────────────┘          │   Viewers    │
                                                          │  (Millions)  │
                                                          └──────────────┘
  ```
- [ ] **Step 7**: Create Stream model (backend)
  ```
  Stream {
    host: ObjectId (ref: User)
    title: String
    description: String
    category: Enum [lecture, quran_recitation, qa_session, discussion]
    status: Enum [scheduled, live, ended]
    streamKey: String (unique, from AWS IVS)
    playbackUrl: String (HLS URL from AWS IVS)
    thumbnailUrl: String
    viewerCount: Number
    peakViewers: Number
    startedAt: Date
    endedAt: Date
    chatEnabled: Boolean (default: true)
    recordingUrl: String (VOD after stream ends)
    scheduledFor: Date (for scheduled streams)
  }
  ```
- [ ] **Step 8**: Build Stream API
  - `POST /api/streams` — create stream session (get stream key)
  - `GET /api/streams/live` — list all live streams
  - `GET /api/streams/:id` — stream details
  - `PATCH /api/streams/:id/start` — mark as live (webhook from AWS)
  - `PATCH /api/streams/:id/end` — mark as ended
  - `GET /api/streams/scheduled` — upcoming streams
  - `GET /api/streams/recordings` — past streams (VOD)

### 4.3 Live Streaming — Frontend
- [ ] **Step 9**: Build Stream List page
  - Grid layout showing live streams with thumbnails
  - "LIVE" badge with viewer count
  - Category filters (Lectures, Quran, Q&A)
  - Scheduled streams section with countdown timers
- [ ] **Step 10**: Build Stream Player page
  - HLS.js video player (adaptive bitrate)
  - Viewer count (real-time via Socket.IO)
  - Stream info: title, host, category
  - Fullscreen support
  - Picture-in-picture mode
- [ ] **Step 11**: Build Live Chat
  - Socket.IO room per stream (`stream:{streamId}`)
  - Chat message input
  - Auto-scrolling message list
  - Pin important messages (host only)
  - Moderation: mute user, slow mode, emote-only mode
- [ ] **Step 12**: Build "Go Live" page (for broadcasters)
  - Copy stream key/URL for OBS
  - Set title, description, category
  - Preview thumbnail
  - "End Stream" button
  - Future: In-browser broadcasting via WebRTC

### 4.4 Push Notifications (PWA)
- [ ] **Step 13**: Setup Vite PWA Plugin
  - Install: `vite-plugin-pwa`
  - Configure service worker with Workbox
  - App manifest with icons (multiple sizes)
  - Offline fallback page
- [ ] **Step 14**: Implement Web Push Notifications
  - Backend: `web-push` library with VAPID keys
  - Frontend: Request notification permission
  - Subscribe to push on login
  - Trigger push for: new followers, replies, stream going live
- [ ] **Step 15**: Add "Install App" prompt
  - Custom install banner for PWA
  - Save to home screen instructions
  - App-like full-screen experience

---

## Phase 5 — AWS Cloud Integration (Week 11-13)

> **Goal**: Move storage, media processing, and CDN to AWS for production scale.

### 5.1 AWS S3 — File Storage
- [ ] **Step 1**: Setup AWS account & IAM
  - Create IAM user with S3 permissions
  - Generate access keys
  - Store in `.env` securely (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
- [ ] **Step 2**: Create S3 buckets
  - `deenverse-avatars` — user profile pictures
  - `deenverse-media` — post images, audio files
  - `deenverse-streams` — stream recordings (VOD)
  - Configure bucket policies (public read for media, private for recordings)
  - Enable CORS for browser uploads
- [ ] **Step 3**: Implement presigned URL upload flow
  ```
  Frontend                    Backend                      S3
     │                          │                           │
     │  POST /upload/presign    │                           │
     │ ─────────────────────▶   │                           │
     │                          │  generatePresignedUrl()   │
     │                          │ ─────────────────────▶    │
     │  { uploadUrl, key }      │                           │
     │ ◀─────────────────────   │                           │
     │                          │                           │
     │  PUT uploadUrl + file    │                           │
     │ ────────────────────────────────────────────────▶    │
     │                          │                           │
     │  POST /upload/confirm    │                           │
     │ ─────────────────────▶   │  Verify file exists      │
     │                          │ ─────────────────────▶    │
     │  { finalUrl }            │                           │
     │ ◀─────────────────────   │                           │
  ```
- [ ] **Step 4**: Build upload API endpoints
  - `POST /api/upload/presign` — get presigned S3 URL
  - `POST /api/upload/confirm` — confirm & save URL to DB
  - Validate file type (images only for now: jpg, png, webp)
  - Validate file size (max 5MB for avatars, 10MB for posts)
- [ ] **Step 5**: Build frontend upload components
  - `<ImageUpload />` — drag & drop + click to upload
  - Progress bar during upload
  - Image preview / crop before upload
  - Multiple image upload for posts (up to 4)

### 5.2 AWS CloudFront — CDN
- [ ] **Step 6**: Setup CloudFront distribution
  - Origin: S3 buckets
  - Enable HTTPS with custom domain (cdn.deenverse.com)
  - Cache policy: 30 days for media, 1 year for avatars
  - Enable gzip/brotli compression
- [ ] **Step 7**: Setup CloudFront for frontend static assets
  - Deploy `frontend/dist/` to S3
  - CloudFront serves the SPA
  - Cache-busting with content hashes in filenames
- [ ] **Step 8**: Image optimization pipeline
  - AWS Lambda@Edge for on-the-fly image resizing
  - Serve WebP to supported browsers
  - Generate thumbnails: 100x100 (avatar), 400x400 (feed), 1200x630 (og:image)

### 5.3 AWS IVS — Live Streaming
- [ ] **Step 9**: Setup Amazon IVS (Interactive Video Service)
  - Create IVS channel per streamer
  - Get ingest endpoint (RTMP URL) and stream key
  - Get playback URL (HLS) for viewers
  - Configure recording to S3 (VOD)
- [ ] **Step 10**: Integrate IVS with backend
  - Create IVS channel when user creates a stream
  - Use IVS EventBridge webhooks for stream start/end
  - Store playback URLs in Stream model
  - Auto-scale: IVS handles millions of viewers natively
- [ ] **Step 11**: Integrate IVS player on frontend
  - Use Amazon IVS Player SDK (optimized HLS player)
  - Adaptive bitrate streaming
  - Ultra-low latency mode (<3 seconds)
  - Timed metadata for interactive features

### 5.4 AWS SES — Email Service
- [ ] **Step 12**: Setup Amazon SES
  - Verify domain (deenverse.com)
  - Create email templates (verification, password reset, notifications)
  - Configure sending limits
- [ ] **Step 13**: Build email service (backend)
  - `sendVerificationEmail(user)` — sends verification link
  - `sendPasswordResetEmail(user)` — sends reset link
  - `sendNotificationDigest(user)` — daily summary of notifications
  - Use HTML email templates with branding

### 5.5 AWS SQS — Message Queue (Optional)
- [ ] **Step 14**: Setup SQS for async tasks
  - Queue for: email sending, push notifications, feed generation
  - Decouple heavy processing from API response time
  - Worker process to consume queue items

---

## Phase 6 — Scale, Security & Performance (Week 14-16)

> **Goal**: Make the platform production-ready for millions of concurrent users.

### 6.1 Redis Caching Layer
- [ ] **Step 1**: Setup Redis (AWS ElastiCache or local Redis)
  - Install: `ioredis` (better than `redis` for production)
  - Create `src/config/redis.ts` connection manager
  - Connection pooling for high throughput
- [ ] **Step 2**: Cache frequently accessed data
  - User profiles: cache for 5 min (invalidate on update)
  - Hadith content: cache for 24 hours (rarely changes)
  - Feed posts: cache for 1 min (frequently updated)
  - Trending hashtags: cache for 5 min
  - Follower/following counts: cache for 5 min
- [ ] **Step 3**: Session management with Redis
  - Store refresh tokens in Redis (fast lookup + TTL)
  - Enable token revocation (logout from all devices)
  - Rate limit token refresh attempts
- [ ] **Step 4**: Cache invalidation strategy
  - Write-through: update cache on every DB write
  - Cache-aside: read from cache, fallback to DB, populate cache
  - Use Redis pub/sub for cross-instance cache invalidation

### 6.2 Rate Limiting & DDoS Protection
- [ ] **Step 5**: Implement tiered rate limiting
  ```
  API Endpoint              Rate Limit
  ─────────────────────────────────────
  POST /auth/login          5 req / 15 min per IP
  POST /auth/register       3 req / hour per IP
  POST /posts               30 req / hour per user
  GET  /feed                60 req / min per user
  GET  /hadith              120 req / min per user
  POST /upload              10 req / hour per user
  * (general)               100 req / min per IP
  ```
- [ ] **Step 6**: Redis-backed rate limiter
  - Install: `rate-limiter-flexible`
  - Use Redis for distributed rate limiting (across multiple server instances)
  - Return `429 Too Many Requests` with `Retry-After` header
- [ ] **Step 7**: Request validation hardening
  - Sanitize all inputs (XSS prevention)
  - Validate Content-Type headers
  - Limit request body size (1MB default, 10MB for uploads)
  - Helmet.js for security headers

### 6.3 Database Optimization
- [ ] **Step 8**: MongoDB indexing strategy
  ```
  Collection    Index                        Purpose
  ────────────────────────────────────────────────────────
  users         { username: 1 }              unique lookup
  users         { email: 1 }                 unique lookup
  posts         { author: 1, createdAt: -1 } user's posts
  posts         { createdAt: -1 }            feed ordering
  posts         { "likes": 1 }               like lookups
  hadiths       { $text: content }           full-text search
  notifications { recipient: 1, read: 1 }    unread count
  messages      { conversation: 1, createdAt: -1 }
  ```
- [ ] **Step 9**: MongoDB aggregation pipelines
  - Feed generation: aggregate posts from followed users
  - Trending: aggregate hashtags by 24h count
  - User stats: aggregate follower/post/like counts
- [ ] **Step 10**: Connection pooling
  - Mongoose connection pool size: 10-50 (based on load)
  - Read replicas for read-heavy operations (MongoDB Atlas)
  - Write concern: `w: "majority"` for data safety

### 6.4 Frontend Performance
- [ ] **Step 11**: Code splitting & lazy loading
  - Route-level code splitting (already done with React.lazy)
  - Component-level splitting for heavy components (editor, image viewer)
  - Dynamic imports for non-critical features
- [ ] **Step 12**: Image optimization
  - Lazy load images with IntersectionObserver
  - srcset for responsive images
  - Placeholder blur-hash while loading
  - WebP format with fallback
- [ ] **Step 13**: Bundle size analysis & reduction
  - `vite-plugin-visualizer` for bundle analysis
  - Target: <200KB initial JS (gzipped)
  - Remove unused dependencies
  - Tree-shake icon imports
- [ ] **Step 14**: Virtual scrolling for long lists
  - Install: `@tanstack/react-virtual`
  - Use for feed, search results, follower lists
  - Render only visible items (DOM node recycling)
- [ ] **Step 15**: Service Worker caching strategy
  - Cache-first for static assets (images, fonts, CSS)
  - Network-first for API calls
  - Stale-while-revalidate for hadith content
  - Background sync for offline actions (save, like)

### 6.5 Logging & Monitoring
- [ ] **Step 16**: Setup structured logging (backend)
  - Install: `winston` + `morgan`
  - Log levels: error, warn, info, debug
  - JSON format for machine parsing
  - Log to file + console (production: file only)
- [ ] **Step 17**: Error tracking
  - Frontend: Sentry for error reporting
  - Backend: Sentry for unhandled exceptions
  - Custom error pages (404, 500)
- [ ] **Step 18**: Health check endpoints
  - `GET /health` — basic health (200 OK)
  - `GET /health/db` — MongoDB connection status
  - `GET /health/redis` — Redis connection status
  - Use for load balancer health checks

### 6.6 Security Hardening
- [ ] **Step 19**: Implement CSRF protection
  - CSRF token in cookie + verify in headers
  - SameSite=Strict for auth cookies
- [ ] **Step 20**: Content Security Policy (CSP)
  - Restrict script sources to own domain
  - Block inline scripts
  - Allow specific CDNs (fonts, images)
- [ ] **Step 21**: API key management
  - Rotate AWS keys regularly
  - Use AWS Secrets Manager for sensitive configs
  - Never log secrets
- [ ] **Step 22**: Input sanitization
  - Install: `dompurify` (frontend), `xss` (backend)
  - Sanitize all user-generated content
  - Prevent stored XSS in posts, bios, messages

---

## Phase 7 — Mobile App (React Native) (Week 17-22)

> **Goal**: Launch iOS & Android apps sharing the same backend API.

### 7.1 Project Setup
- [ ] **Step 1**: Initialize React Native project
  - Use Expo (managed workflow) for faster development
  - Or bare React Native if custom native modules needed
  - Target: iOS 15+, Android 10+
- [ ] **Step 2**: Shared code strategy
  ```
  deenverse/
  ├── packages/
  │   ├── shared/            ← Shared types, utils, API client
  │   │   ├── types/
  │   │   ├── api/
  │   │   └── utils/
  │   ├── web/               ← React web app (current frontend)
  │   └── mobile/            ← React Native app
  ├── backend/
  └── package.json           ← Monorepo with npm workspaces
  ```
- [ ] **Step 3**: Setup monorepo with npm workspaces
  - Shared package: TypeScript types, API client, Zod schemas
  - Web package: current Vite frontend
  - Mobile package: React Native app

### 7.2 Mobile Core Features
- [ ] **Step 4**: Authentication screens
  - Login, Register, Forgot Password
  - Biometric auth (Face ID / Fingerprint)
  - Secure storage for tokens (react-native-keychain)
- [ ] **Step 5**: Navigation structure
  - Bottom tab navigation: Home, Explore, Streams, Messages, Profile
  - Stack navigation within each tab
  - Gesture-based navigation
- [ ] **Step 6**: Feed & posts (mobile-optimized)
  - Infinite scroll with FlashList (high performance)
  - Pull-to-refresh
  - Swipe actions on posts
  - Image viewer with pinch-to-zoom
- [ ] **Step 7**: Hadith reader
  - Paginated hadith view (swipe between hadiths)
  - Font size & style controls
  - Share to other apps
  - Widget: "Hadith of the Day" home screen widget
- [ ] **Step 8**: Push notifications (mobile)
  - Firebase Cloud Messaging (FCM) for Android
  - APNs for iOS
  - Notification channels/categories
  - Deep linking from notifications to relevant screen

### 7.3 Mobile-Specific Features
- [ ] **Step 9**: In-app camera for posts
  - Photo capture + gallery picker
  - Basic image editing (crop, filters)
  - Video capture (up to 60 seconds)
- [ ] **Step 10**: Offline mode
  - Cache recent hadiths for offline reading
  - Queue posts/likes/saves for sync when online
  - Offline indicator in status bar
- [ ] **Step 11**: Live streaming mobile viewer
  - HLS player with adaptive bitrate
  - Picture-in-picture mode
  - Chat overlay
  - Portrait + landscape support

### 7.4 App Store Submission
- [ ] **Step 12**: iOS App Store submission
  - App Store review guidelines compliance
  - App Store screenshots & preview videos
  - Privacy policy & terms of service
  - TestFlight beta testing
- [ ] **Step 13**: Google Play Store submission
  - Play Console listing
  - Content rating questionnaire
  - Data safety section
  - Internal testing → Open beta → Production

---

## Phase 8 — Analytics, Monetization & Launch (Week 23-26)

> **Goal**: Launch publicly with analytics, moderation tools, and sustainable monetization.

### 8.1 Analytics
- [ ] **Step 1**: Implement analytics events
  - Page views, session duration
  - Feature usage: hadith views, shares, saves, posts
  - User funnel: visit → register → first post → retained user
- [ ] **Step 2**: Admin dashboard
  - User growth chart (daily/weekly/monthly)
  - Post volume, engagement metrics
  - Most shared hadiths
  - Live stream metrics (concurrent viewers, duration)
  - Server health metrics (CPU, memory, response times)
- [ ] **Step 3**: User analytics (in-app)
  - Profile insights: who viewed your profile
  - Post insights: views, likes, reposts, reach
  - Best time to post analysis

### 8.2 Content Moderation
- [ ] **Step 4**: Implement report system
  - Report post/user with reason
  - Report types: spam, inappropriate, misinformation, harassment
  - `POST /api/reports` — create report
  - Admin endpoint to review reports
- [ ] **Step 5**: Auto-moderation
  - Profanity filter on posts/messages
  - Spam detection (repeated content, suspicious links)
  - Rate limit new accounts (anti-spam cool-down)
- [ ] **Step 6**: Admin moderation dashboard
  - Queue of reported content
  - Actions: approve, warn, mute user (24h/7d), ban user
  - Audit log of moderation actions

### 8.3 Monetization (Ethical)
- [ ] **Step 7**: Premium subscription (optional)
  - "DeenVerse Pro" — ad-free, extra features
  - Features: unlimited collections, custom themes, analytics, badges
  - Payment: Stripe integration
  - Price: ~$3-5/month
- [ ] **Step 8**: Scholar verification & features
  - Verified badge for Islamic scholars
  - Exclusive streaming features for verified scholars
  - Course hosting capabilities

### 8.4 SEO & Marketing
- [ ] **Step 9**: Server-side rendering for public pages
  - Hadith pages with proper meta tags (og:title, og:description, og:image)
  - User profiles with public social cards
  - Sitemap.xml for Google indexing
- [ ] **Step 10**: Social sharing optimization
  - Open Graph tags for Twitter/Facebook embeds
  - Custom hadith share cards with branding
  - Deep links that open in app (if installed)

### 8.5 Production Launch Checklist
- [ ] **Step 11**: Infrastructure
  - [ ] MongoDB Atlas M10+ cluster (production tier)
  - [ ] Redis ElastiCache (production tier)
  - [ ] AWS ECS or EKS for container orchestration
  - [ ] Auto-scaling groups for backend instances
  - [ ] CloudFront for global CDN
  - [ ] Route 53 for DNS management
  - [ ] ACM for SSL certificates
  - [ ] CloudWatch for monitoring & alerts
- [ ] **Step 12**: CI/CD Pipeline
  - [ ] GitHub Actions: lint → test → build → deploy
  - [ ] Staging environment (staging.deenverse.com)
  - [ ] Production environment (deenverse.com)
  - [ ] Database migration scripts
  - [ ] Rollback strategy
- [ ] **Step 13**: Legal & Compliance
  - [ ] Privacy policy
  - [ ] Terms of service
  - [ ] Cookie consent banner
  - [ ] GDPR compliance (data export, deletion)
  - [ ] Content policy (Islamic content guidelines)
- [ ] **Step 14**: Launch
  - [ ] Beta launch with invited users (500-1000)
  - [ ] Feedback collection & iteration
  - [ ] Public launch announcement
  - [ ] App Store & Play Store launch
  - [ ] Social media marketing campaign

---

## Tech Stack Summary

### Current (Phase 1 Completed)

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend Build | Vite 5.2 | ✅ Done |
| Frontend Language | TypeScript 5 | ✅ Done |
| UI Library | React 18 | ✅ Done |
| Styling | Tailwind CSS 4 | ✅ Done |
| Components | shadcn/ui-style | ✅ Done |
| State Management | Zustand 5 | ✅ Done |
| Server State | TanStack Query 5 | ✅ Done |
| Icons | Lucide React | ✅ Done |
| Animations | Framer Motion | ✅ Done |
| HTTP Client | Axios + Interceptors | ✅ Done |
| Backend Runtime | Node.js + Express 4 | ✅ Done |
| Database | MongoDB (Mongoose) | ✅ Done |
| Auth | JWT (cookie-based) | ✅ Done |

### Planned Additions

| Layer | Technology | Phase |
|-------|-----------|-------|
| Forms | React Hook Form + Zod | Phase 2 |
| Real-time | Socket.IO | Phase 4 |
| Caching | Redis (ioredis) | Phase 6 |
| File Storage | AWS S3 | Phase 5 |
| CDN | AWS CloudFront | Phase 5 |
| Live Streaming | AWS IVS | Phase 5 |
| Email | AWS SES | Phase 5 |
| Message Queue | AWS SQS | Phase 5 |
| Push Notifications | Web Push + FCM/APNs | Phase 4 & 7 |
| Logging | Winston + Morgan | Phase 6 |
| Error Tracking | Sentry | Phase 6 |
| Mobile | React Native (Expo) | Phase 7 |
| Payments | Stripe | Phase 8 |
| CI/CD | GitHub Actions | Phase 8 |
| Containers | Docker + ECS | Phase 8 |
| Monitoring | CloudWatch | Phase 8 |

---

## Infrastructure Architecture

```
                                    ┌─────────────────────────────┐
                                    │        Route 53 (DNS)       │
                                    │    deenverse.com            │
                                    └──────────┬──────────────────┘
                                               │
                                    ┌──────────▼──────────────────┐
                                    │      CloudFront (CDN)       │
                                    │  Static assets + API cache  │
                                    └──────────┬──────────────────┘
                                               │
                        ┌──────────────────────┼──────────────────────┐
                        │                      │                      │
              ┌─────────▼────────┐  ┌─────────▼────────┐  ┌─────────▼────────┐
              │  S3 (Frontend)   │  │  ALB (API)       │  │  S3 (Media)      │
              │  React SPA       │  │  Load Balancer   │  │  Images/Videos   │
              └──────────────────┘  └─────────┬────────┘  └──────────────────┘
                                              │
                                    ┌─────────▼────────┐
                                    │  ECS / EKS       │
                                    │  Backend Cluster │
                                    │  (Auto-scaling)  │
                                    ├──────────────────┤
                                    │  Instance 1      │
                                    │  Instance 2      │
                                    │  Instance N      │
                                    └────┬────────┬────┘
                                         │        │
                              ┌──────────▼──┐  ┌──▼──────────────┐
                              │  MongoDB    │  │  Redis          │
                              │  Atlas      │  │  ElastiCache    │
                              │  (Cluster)  │  │  (Sessions,     │
                              │             │  │   Cache, PubSub)│
                              └─────────────┘  └─────────────────┘

                              ┌─────────────────────────────────────┐
                              │         AWS IVS / MediaLive         │
                              │    Live Streaming Infrastructure    │
                              │  (Ingest → Transcode → HLS → CDN)  │
                              └─────────────────────────────────────┘

                              ┌─────────────────────────────────────┐
                              │         AWS SES + SQS + Lambda      │
                              │    Email, Queues, Background Jobs   │
                              └─────────────────────────────────────┘
```

---

## Cost Estimates (Monthly, at Scale)

| Service | Small (10K users) | Medium (100K users) | Large (1M+ users) |
|---------|-------------------|---------------------|--------------------|
| MongoDB Atlas | $57 (M10) | $300 (M30) | $1,000+ (M50+) |
| Redis ElastiCache | $25 | $100 | $500+ |
| ECS (Backend) | $50 | $200 | $1,000+ |
| S3 Storage | $5 | $50 | $500+ |
| CloudFront CDN | $10 | $100 | $1,000+ |
| AWS IVS (Streaming) | $0 (pay per use) | $200+ | $2,000+ |
| SES (Email) | $1 | $10 | $100+ |
| **Total** | **~$150/mo** | **~$960/mo** | **~$5,100+/mo** |

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|-----------------|
| **Phase 1** ✅ | Week 1-2 | Vite + TS, design system, layout, backend fixes |
| **Phase 2** | Week 3-4 | Auth overhaul, hadith rebuild, search, profiles |
| **Phase 3** | Week 5-7 | Posts, feed, follows, notifications, DMs, hashtags |
| **Phase 4** | Week 8-10 | Socket.IO, live streaming, push notifications |
| **Phase 5** | Week 11-13 | AWS S3, CloudFront, IVS, SES |
| **Phase 6** | Week 14-16 | Redis, rate limiting, performance, security |
| **Phase 7** | Week 17-22 | React Native iOS + Android app |
| **Phase 8** | Week 23-26 | Analytics, moderation, monetization, launch |

> **Total estimated timeline**: ~6 months from Phase 1 to public launch.

---

*Last updated: February 18, 2026*
*Branch: `redesign/v2-modern`*
