# Dependencies & Integrations

## Third-party services
| Service | Purpose | Config |
|---|---|---|
| MongoDB Atlas | Primary DB (transactions need replica set) | `MONGO_URI` (⚠️ not MONGODB_URI), `MONGO_POOL_SIZE` |
| Redis (optional) | Cache, rate limits; graceful no-op if absent | `REDIS_URL` or `REDIS_HOST/PORT/PASSWORD` |
| Stripe v20 | Course payments, subscriptions, Connect payouts | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_WEBHOOK_SECRET`, `STRIPE_STUDENT_PRICE_ID`, `STRIPE_PREMIUM_PRICE_ID`, `COURSE_COMMISSION_RATE` (0.30) |
| LiveKit | Classroom rooms/tokens/egress recordings | `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` |
| AWS S3 (+presigner) | avatars/media/streams/recordings buckets | `S3_BUCKET_*`, `CDN_BASE_URL`, shared AWS creds |
| AWS IVS | Public live streams | `AWS_IVS_REGION` + creds |
| AWS SES | Email (password reset) | `SES_FROM_EMAIL`, `AWS_SES_REGION` |
| Web Push | Browser notifications | `VAPID_PUBLIC_KEY/PRIVATE_KEY/SUBJECT` |
| alquran.cloud | Quran text/translation/tafsir/audio | `ALQURAN_CLOUD_BASE_URL`, `QURAN_*_EDITION` |

Other backend env: `PORT` (8081), `NODE_ENV`, `TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `FRONTEND_URL`, `FRONTEND_URL_PROD`, `CORS_ORIGINS`, `ADMIN_IDS` (comma list, cached per-process), `LOG_LEVEL`. Frontend: `VITE_API_URL` (empty in dev → proxy), `VITE_APP_NAME`.

## Key libraries
- **Backend**: express 4, mongoose 8, socket.io 4, ioredis, jsonwebtoken, bcryptjs, winston+morgan, helmet, rate-limiter-flexible, xss, express-validator, livekit-server-sdk, stripe, web-push, slugify, quran-meta.
- **Frontend**: react 18, vite 5, tailwind 4 (+@tailwindcss/postcss), zustand 5, @tanstack/react-query 5, react-router 6, RHF+zod 4, axios, socket.io-client, livekit-client + @livekit/components-react, hls.js, @tldraw/tldraw 4, framer-motion, lucide-react, fuse.js, dompurify, html-to-image.
- **Shared**: zod 4, axios. **Testing**: jest 30 + babel-jest (hoisted to root), mongodb-memory-server, supertest.

## Watchouts
- ⚠️ 3 critical / 32 high npm vulns untriaged (TASK-044).
- Root package.json carries `@livekit/components-styles` as a Vercel workspace-resolution workaround — don't "clean it up".
- Workspaces share the root lockfile; workspace-level package-lock.json files also exist (legacy).
