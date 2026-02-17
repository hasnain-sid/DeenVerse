# DeenVerse v2 — Architecture & Redesign Plan

## 🎯 Vision
Islamic social media platform (Twitter-like) serving millions of users, with live streaming, Quran learning, hadith sharing, and community features. Minimal/clean Notion-inspired UI.

---

## 🏗️ Tech Stack Decisions

### Frontend
| Layer | Current | v2 Choice | Rationale |
|-------|---------|-----------|-----------|
| Build Tool | CRA (react-scripts) | **Vite 5** | 10x faster HMR, native ESM, tree-shaking, future-proof |
| Language | JavaScript | **TypeScript** | Type safety at scale, better DX, fewer runtime bugs |
| UI Framework | React 18 | **React 19** | Concurrent features, Server Components ready |
| Styling | Tailwind 3 + random libs | **Tailwind CSS 4 + shadcn/ui** | Notion-like design system, accessible, customizable |
| State Mgmt | Redux Toolkit | **Zustand + TanStack Query** | Zustand: lightweight global state. TanStack Query: server state caching, auto-refresh, infinite scroll |
| Routing | React Router 6 | **React Router 7** | Type-safe routes, lazy loading, data loaders |
| Forms | Manual state | **React Hook Form + Zod** | Performant forms, schema validation |
| Icons | react-icons + lucide | **Lucide React** (only) | Consistent icon set, tree-shakeable |
| HTTP Client | Axios | **Axios** (with interceptors) | Proven, interceptors for auth token refresh |
| Real-time | None | **Socket.IO Client** | Live streaming, notifications, chat |
| PWA | Broken | **Vite PWA Plugin** | Offline support, push notifications |

### Backend
| Layer | Current | v2 Choice | Rationale |
|-------|---------|-----------|-----------|
| Runtime | Node.js + Express | **Node.js + Express 5** | Express 5 for async error handling |
| Language | JavaScript | **TypeScript** | Type safety, better maintainability |
| Database | MongoDB (Mongoose) | **MongoDB (Mongoose) + Redis** | Redis for caching, sessions, rate limiting |
| Auth | JWT (cookie-based) | **JWT Access + Refresh Tokens** | Short-lived access (15min), long-lived refresh (7d), rotation |
| Validation | express-validator | **Zod** | Shared schemas between frontend/backend |
| File Storage | None | **AWS S3** (planned) | Profile pics, media, streaming assets |
| Real-time | None | **Socket.IO** | Live streaming, notifications, chat |
| Rate Limiting | None | **express-rate-limit + Redis** | DDoS protection at scale |
| Logging | console.log | **Winston + Morgan** | Structured logging, production-grade |
| API Docs | None | **Swagger/OpenAPI** | Auto-generated API documentation |

### Infrastructure (Future)
| Service | Purpose |
|---------|---------|
| AWS S3 | Media/file storage |
| AWS CloudFront | CDN for static assets |
| AWS MediaLive/IVS | Live streaming to millions |
| Redis (ElastiCache) | Session store, caching, pub/sub |
| MongoDB Atlas | Managed database with auto-scaling |
| Docker + ECS/EKS | Container orchestration |
| GitHub Actions | CI/CD pipeline |

---

## 📁 Frontend Folder Structure (Feature-Based)

```
frontend/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json          # shadcn/ui config
├── public/
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # Root component
│   ├── globals.css          # Tailwind base + design tokens
│   │
│   ├── components/          # Shared/reusable components
│   │   ├── ui/              # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── CommandPalette.tsx
│   │   └── ThemeProvider.tsx
│   │
│   ├── features/            # Feature modules
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── AuthGuard.tsx
│   │   │   └── useAuth.ts
│   │   ├── feed/
│   │   │   ├── FeedPage.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── CreatePost.tsx
│   │   │   └── useFeed.ts
│   │   ├── hadith/
│   │   │   ├── HadithPage.tsx
│   │   │   ├── HadithCard.tsx
│   │   │   ├── HadithControls.tsx
│   │   │   └── useHadith.ts
│   │   ├── profile/
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── EditProfile.tsx
│   │   │   └── useProfile.ts
│   │   ├── saved/
│   │   │   ├── SavedPage.tsx
│   │   │   └── useSaved.ts
│   │   ├── search/
│   │   │   ├── SearchPage.tsx
│   │   │   └── useSearch.ts
│   │   └── streaming/       # Future
│   │       ├── StreamPage.tsx
│   │       └── useStream.ts
│   │
│   ├── hooks/               # Shared hooks
│   │   ├── useDebounce.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── lib/                 # Utilities
│   │   ├── api.ts           # Axios instance with interceptors
│   │   ├── utils.ts         # cn() helper, formatters
│   │   └── validations.ts   # Shared Zod schemas
│   │
│   ├── stores/              # Zustand stores
│   │   ├── authStore.ts
│   │   ├── themeStore.ts
│   │   └── uiStore.ts
│   │
│   └── types/               # TypeScript types
│       ├── user.ts
│       ├── hadith.ts
│       └── api.ts
```

---

## 📁 Backend Folder Structure

```
backend/
├── src/
│   ├── index.ts             # Entry point
│   ├── app.ts               # Express app setup
│   │
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── cors.ts
│   │   └── env.ts           # Validated env vars with Zod
│   │
│   ├── modules/             # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.middleware.ts
│   │   │   └── auth.validation.ts
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.model.ts
│   │   │   └── user.validation.ts
│   │   ├── hadith/
│   │   │   ├── hadith.controller.ts
│   │   │   ├── hadith.service.ts
│   │   │   ├── hadith.routes.ts
│   │   │   └── hadith.cache.ts
│   │   ├── post/
│   │   │   ├── post.controller.ts
│   │   │   ├── post.service.ts
│   │   │   ├── post.routes.ts
│   │   │   └── post.model.ts
│   │   └── streaming/       # Future
│   │
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   ├── logger.ts
│   │   └── validate.ts
│   │
│   ├── utils/
│   │   ├── AppError.ts
│   │   ├── asyncHandler.ts
│   │   └── response.ts
│   │
│   └── types/
│       └── index.ts
```

---

## 🎨 Design System — "Notion-Minimal Islamic"

### Color Palette
```
Light Mode:
  Background:     #FFFFFF
  Surface:        #F7F6F3 (warm gray, Notion-like)
  Border:         #E8E5E0
  Text Primary:   #1A1A1A
  Text Secondary: #6B7280
  Accent:         #2D7D6F (Islamic teal/green)
  Accent Hover:   #245F55
  Accent Light:   #E6F2EF

Dark Mode:
  Background:     #191919
  Surface:        #202020
  Border:         #2F2F2F
  Text Primary:   #EDEDEC
  Text Secondary: #9B9A97
  Accent:         #3DA18F
  Accent Light:   #1A3D36
```

### Typography
- **Headings**: Inter (clean, modern, excellent readability)
- **Arabic/Quran**: Amiri or Scheherazade New (proper Arabic typography)
- **Body**: Inter
- **Monospace**: JetBrains Mono (code blocks, references)

### Design Principles
1. **Whitespace-heavy** — generous padding, no visual clutter
2. **Subtle borders** — 1px borders instead of shadows
3. **Muted colors** — no harsh contrasts
4. **Smooth transitions** — 150ms ease for all interactions
5. **Consistent spacing** — 4px grid system (4, 8, 12, 16, 24, 32, 48)

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2) ← WE ARE HERE
- [x] Create branch
- [ ] Migrate frontend to Vite + TypeScript
- [ ] Setup Tailwind v4 + shadcn/ui
- [ ] Create design system (colors, typography, spacing)
- [ ] Build layout system (Sidebar, TopBar, MainLayout)
- [ ] Fix all critical backend bugs
- [ ] Implement proper auth (refresh tokens, session persistence)

### Phase 2: Core Features (Week 3-4)
- [ ] Rebuild Hadith feed with new design
- [ ] Implement search functionality
- [ ] Build profile page
- [ ] Implement saved/bookmarks with proper API
- [ ] Add loading states, skeletons, error boundaries

### Phase 3: Social Features (Week 5-6)
- [ ] Post/share system (like Twitter)
- [ ] Follow/unfollow with proper schema
- [ ] Notifications system
- [ ] User timeline/feed

### Phase 4: Advanced (Week 7-8)
- [ ] Socket.IO integration for real-time
- [ ] Live streaming foundation
- [ ] AWS S3 integration for media
- [ ] PWA setup (offline, push notifications)

### Phase 5: Scale & Polish (Week 9-10)
- [ ] Redis caching layer
- [ ] Rate limiting
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Mobile app preparation (shared API layer)
- [ ] CI/CD pipeline
