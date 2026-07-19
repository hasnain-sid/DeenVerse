# Feature Status (verified against code, 2026-07-19)

Source of truth for live status: `.agents/feature-board.md` + `docs/audits/project-state-and-roadmap.md`. This is the quick lookup.

## ✅ Complete (backend + frontend)
Auth (JWT dual-token, forgot/reset) · Feed/Posts (hashtags, mentions, replies, trending) · Hadith browse + image export · Collections/Saved · Chat (Socket.IO) · Notifications (in-app + Web Push) · Live Streaming (AWS IVS + hls.js) · Search/Explore/Community · Quran Topics browse · Share-to-Feed · Iman Boost · Signs · Streaks · Scholar Role System (apply → admin review → badge/earnings) · Payments (Stripe checkout, subscriptions, Connect payouts, webhooks) · Course LMS (discovery/detail/player/builder/progress/admin review) · Quiz engine (attempts, grading, answer-hiding, soft-archive) · Virtual Classroom (LiveKit rooms/recordings, tldraw whiteboard, scheduler, hand-raise) · PWA

## 🟡 Partial (backend ✅, frontend thin/absent)
| Feature | Gap |
|---|---|
| Daily Learning | UI partially done (high priority) |
| Quran Reader | UI partially done (high priority) |
| Ruhani Hub | 13 backend routes, zero consumers |
| Moderation | 7 admin routes, no panel UI; bans not enforced at auth |
| Analytics | Event tracking live, no dashboard |
| Uploads (S3 presign) | Code done; AWS env/bucket-CORS verification deferred |
| Email (SES) | Password reset only |
| Mobile | Expo scaffold, no screens |

## 🔴 Broken
CSRF exposure on cookie auth · bans ineffective · tokens irrevocable · dead CI staging deploy · orphan `POST /user/:param` — details in [KNOWN_ISSUES.md](KNOWN_ISSUES.md)

## ⬜ Missing (planned)
Email verification · Google OAuth · Certification system · Interactive Quran Teaching · Dawah & Q&A · admin dashboards · OpenAPI docs · frontend tests · migrations · Redis socket adapter · Follow collection
