# Iman Boost — Feature Design Document

> **Status**: Research Complete — Awaiting Implementation Approval  
> **Author**: Copilot Research Agent  
> **Date**: February 24, 2026  
> **Related Features**: Daily Learning, Ruhani Hub, Quran Topics

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Target Audience](#3-target-audience)
4. [Content Categories](#4-content-categories)
5. [Data Sources & Credibility](#5-data-sources--credibility)
6. [Implementation Options Evaluated](#6-implementation-options-evaluated)
7. [Recommended Approach](#7-recommended-approach)
8. [Architecture & Data Flow](#8-architecture--data-flow)
9. [Backend Implementation Plan](#9-backend-implementation-plan)
10. [Frontend Implementation Plan](#10-frontend-implementation-plan)
11. [UX & Design Spec](#11-ux--design-spec)
12. [Seed Data Strategy](#12-seed-data-strategy)
13. [Differentiation from Existing Features](#13-differentiation-from-existing-features)
14. [Competitive Landscape](#14-competitive-landscape)
15. [Risks & Mitigations](#15-risks--mitigations)
16. [Phased Rollout Plan](#16-phased-rollout-plan)
17. [Open Questions](#17-open-questions)

---

## 1. Overview

**Iman Boost** is a curated, card-based feature for exploring the signs of Islam — Qur'anic scientific signs, fulfilled prophecies of Prophet Muhammad ﷺ, linguistic miracles, historical facts, and prophetic wisdom. The feature presents verified Islamic knowledge in bite-sized, visually compelling cards with daily rotation, category filtering, and social sharing.

The goal is to strengthen faith for Muslims and provide an accessible, evidence-based introduction to Islam for non-Muslims — all within the DeenVerse social platform.

---

## 2. Problem Statement

### Gap in the Ecosystem

- **Yaqeen Institute** produces gold-standard academic content (papers, video series) but it's long-form and not optimized for quick consumption.
- **Quran.com** excels at Qur'an reading but doesn't present "signs" or "miracles" as a standalone feature.
- **Muslim Pro** is an all-in-one super-app but lacks dedicated educational sign/miracle content.
- **Play Store** searches for "Quran miracles" or "signs of Islam" return mostly low-quality, unverified apps.

**No platform currently offers curated Islamic facts in a daily, snackable, social-card format.** This is a strong differentiator for DeenVerse.

### User Need

- Muslims want daily Iman-boosting content backed by authentic sources.
- Non-Muslims exploring Islam want evidence-based, non-preachy, visually engaging content.
- Both audiences want to share compelling facts on social feeds.

---

## 3. Target Audience

| Audience | Need | How Iman Boost Serves Them |
|---|---|---|
| **Practicing Muslims** | Daily spiritual uplift, reaffirm faith | "Sign of the Day" rotation, bookmarking, SubhanAllah reactions |
| **New Muslims / Seekers** | Structured discovery of Islam's intellectual foundation | Category tabs, progressive depth (card → detail modal → source link) |
| **Non-Muslims / Curious** | Objective, evidence-based Islamic knowledge without preaching | Scientific signs with references, neutral tone, publicly accessible (no auth required) |
| **Dawah Workers** | Shareable content for outreach | "Share to Feed" + social card previews with OG meta |

### 3.5 Success Metrics & KPIs

- **Daily Active Users (DAU)**: Track users engaging with the `DailySignBanner`.
- **Social Engagement**: Number of shares, bookmarks, and "SubhanAllah" reactions per sign.
- **Retention Rate**: Measure if Iman Boost viewers return to the app the next day (Day 1 retention).
- **Time on Page**: Analyze if users are reading the full explanation text or just the cards.

---

## 4. Content Categories

Each "sign" belongs to exactly one category. Categories are defined as an enum in the backend model.

| Category Slug | Display Name | Icon (Lucide) | Description | Example Topics |
|---|---|---|---|---|
| `quran_science` | Qur'an & Science | `Microscope` | Qur'anic verses that align with modern scientific discoveries | Embryology (23:12-14), Universe expansion (51:47), Mountains as pegs (78:6-7), Water cycle (39:21), Deep-sea darkness (24:40), Iron sent down (57:25), Barrier between seas (55:19-20), Frontal lobe & lying (96:15-16) |
| `prophecy` | Fulfilled Prophecies | `ScrollText` | Predictions by Prophet Muhammad ﷺ that came true | Byzantines will rebound (30:2-4), Conquest of Constantinople, Barefoot shepherds competing in tall buildings, Globalization of Islam, Spread of interest (riba), Technology makes things "speak", Muslims becoming easy prey, Inevitable infighting |
| `linguistic_miracle` | Linguistic Miracles | `BookOpen` | Structural, numerical, and literary wonders of the Qur'an | Word "day" appears 365 times, "month" 12 times, Surah Baqarah verse 143 is the middle verse containing "moderate", The Qur'anic challenge (produce one surah like it), Ring composition in Surah Baqarah |
| `historical_fact` | Historical Facts | `Landmark` | Islamic civilization's contributions and historically verified events | Islamic Golden Age (algebra, optics, hospitals), Preservation of the Qur'an manuscript chain, First university founded by Fatima al-Fihri, Prophet's Last Sermon on human rights |
| `prophetic_wisdom` | Prophetic Wisdom | `Lightbulb` | Sayings and guidance of Prophet Muhammad ﷺ that demonstrate foresight | Quarantine guidance during plague, Environmental stewardship, Animal rights, Economic ethics, Mental health guidance |
| `names_of_allah` | Names of Allah | `Heart` | The 99 Names with meaning, context, and how they manifest in creation | Ar-Rahman (The Most Merciful), Al-Alim (The All-Knowing), Al-Khaliq (The Creator) |

---

## 5. Data Sources & Credibility

### Primary Sources

| Source | URL | Type | Usage |
|---|---|---|---|
| **Yaqeen Institute** | [yaqeeninstitute.org](https://yaqeeninstitute.org) | Academic papers & research | Gold standard for prophecy content. Their "Proofs of Prophethood" series (31+ numbered prophecies by Sh. Mohammad Elshinawy) is the primary reference for the `prophecy` category. |
| **AlQuran.cloud API** | [alquran.cloud/api](https://alquran.cloud/api) | REST API (free, no key) | Verse text and translations for embedding in sign cards. Used at seed-time to pull accurate Arabic text + English translation. |
| **Sunnah.com** | [sunnah.com](https://sunnah.com) | Hadith database | Cross-referencing hadith authenticity grades. Every hadith in our seed data must link to its Sunnah.com entry. |
| **AhmedBaset/hadith-json** | [GitHub](https://github.com/AhmedBaset/hadith-json) | JSON dataset | 17 major Hadith books. Useful for bulk reference lookups during curation. |
| **Maurice Bucaille** | *The Bible, the Qur'an, and Science* | Book | Pioneering work on Qur'an-science compatibility. Referenced for `quran_science` category context. |
| **Wikipedia: I'jaz** | [en.wikipedia.org/wiki/I'jaz](https://en.wikipedia.org/wiki/I%27jaz) | Encyclopedia | Academic overview of Qur'anic inimitability with scholarly references from both Muslim and non-Muslim academics. |

### Credibility Rules (MUST follow)

1. **Hadith grading**: Only use **Sahih** (authentic) or **Hasan** (acceptable) hadiths. Never use Da'if (weak) or Mawdu' (fabricated).
2. **Scientific claims**: Stick to **widely accepted** scientific correlations. Avoid fringe or disputed claims (e.g., speed of light in the Qur'an, black holes).
3. **Framing**: Use the word "signs" (ayat) rather than "proof" when the scientific correlation is reflective rather than definitive. Include: *"These are reflections on Qur'anic verses in light of modern knowledge."*
4. **Source attribution**: Every sign MUST have a `sourceUrl` linking to a credible institution (Yaqeen, Sunnah.com, academic paper, or recognized scholar).
5. **Review process**: All seed data should be reviewed by someone with Islamic knowledge before deployment.

---

## 6. Implementation Options Evaluated

### Option A: Static JSON Seed + MongoDB (RECOMMENDED)

Curate a verified JSON dataset of facts, seed into a MongoDB `Sign` collection, serve via REST API.

- **Pros**: Full content quality control. Supports social features. Redis-cacheable daily sign. Matches existing DeenVerse patterns exactly.
- **Cons**: Requires manual curation of initial dataset. No admin UI for content management in v1.
- **Effort**: Medium

### Option B: External API Aggregation (Live Fetch)

Fetch verses from AlQuran.cloud + Hadith from Sunnah.com on-the-fly, map to local "annotation" metadata.

- **Pros**: Always up-to-date verse text. Less initial data entry.
- **Cons**: External APIs only provide raw text — scientific explanations still need local storage. Rate limits. External downtime means broken feature. Two sources of truth.
- **Effort**: Medium-High

### Option C: Hybrid Content CMS (Markdown + MongoDB)

Store long-form articles as Markdown in repo, metadata in MongoDB.

- **Pros**: Supports both short cards and long-form deep dives. Version-controlled content.
- **Cons**: Overkill for v1. Requires markdown rendering pipeline. Doesn't match any existing DeenVerse pattern.
- **Effort**: High

### Decision: **Option A** — best balance of quality control, architectural consistency, and effort.

---

## 7. Recommended Approach

**Option A: Static JSON Seed + MongoDB**

### Why This Fits DeenVerse

1. **Follows existing architecture** — Route → Controller → Service → Model pattern (identical to Daily Learning, Ruhani Hub)
2. **Content quality control** — For Dawah content consumed by non-Muslims, every fact must be verified. Self-hosted data = full control
3. **Social integration** — "Share to Feed" creates a DeenVerse post. Bookmarking, reactions leverage existing social infra
4. **Daily engagement driver** — Redis-cached "Sign of the Day" drives daily visits (same pattern as Daily Learning's `getTodayIndex()`)
5. **Public by default** — No auth required to browse signs, making it accessible for non-Muslims. Auth only for social features (bookmark, share, react)
6. **Scalable** — Start with 50-100 curated facts. Add admin tooling + community submissions in Phase 3

---

## 8. Architecture & Data Flow

### Request Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │  HTTP   │   Backend    │  Query  │   MongoDB    │
│  React SPA   │────────▶│  Express API │────────▶│  Sign model  │
│              │◀────────│              │◀────────│              │
└──────────────┘  JSON   └──────┬───────┘  Docs   └──────────────┘
                                │
                                │ Cache
                                ▼
                         ┌──────────────┐
                         │    Redis     │
                         │  (daily sign │
                         │   TTL: 24h)  │
                         └──────────────┘
```

### Daily Sign Rotation Algorithm

```
GET /api/v1/signs/daily

1. Check Redis key "sign-of-day"
2. If HIT → return cached sign
3. If MISS:
   a. totalSigns = await Sign.countDocuments({ isPublished: true })
   b. dayIndex = getTodayIndex('sign') % totalSigns
      // getTodayIndex: days since epoch, consistent across timezone
   c. sign = await Sign.findOne({ isPublished: true }).sort({ order: 1 }).skip(dayIndex)
   d. Cache in Redis with TTL = seconds until midnight UTC
   e. Return sign
```

### Category Browsing

```
GET /api/v1/signs?category=prophecy&page=1&limit=12

1. Query: Sign.find({ category, isPublished: true })
2. Sort by order (curated priority)
3. Paginate with skip/limit
4. Return { signs, total, page, totalPages }
```

---

## 9. Backend Implementation Plan

### Files to Create

#### 9.1 Model: `backend/models/signSchema.js`

```js
import mongoose from "mongoose";

const signSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        "quran_science",
        "prophecy",
        "linguistic_miracle",
        "historical_fact",
        "prophetic_wisdom",
        "names_of_allah",
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,       // Short description for card view (2-3 sentences)
      required: true,
      maxlength: 500,
    },
    explanation: {
      type: String,       // Long-form explanation for detail view
      required: true,
    },
    reference: {
      type: String,       // e.g., "Quran 51:47" or "Sahih Muslim 2889"
      required: true,
    },
    arabicText: {
      type: String,       // Original Arabic verse or hadith text (optional)
    },
    translation: {
      type: String,       // English translation of the Arabic text
    },
    sourceUrl: {
      type: String,       // Link to credible source (Yaqeen, Sunnah.com, etc.)
      required: true,
    },
    mediaUrl: {
      type: String,       // Optional: S3/CDN URL for illustration image
    },
    order: {
      type: Number,       // Curated display order within category
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    tags: [String],       // Additional searchable tags
  },
  { timestamps: true }
);

// Compound indexes for common queries
signSchema.index({ category: 1, isPublished: 1, order: 1 });
signSchema.index({ isPublished: 1, order: 1 });

export default mongoose.model("Sign", signSchema);
```

#### 9.2 Service: `backend/services/signService.js`

Key functions:

| Function | Description |
|---|---|
| `getSignOfTheDay()` | Redis-cached daily sign using `getTodayIndex()` rotation |
| `getSignsByCategory(category, page, limit)` | Paginated query filtered by category |
| `getAllSigns(page, limit)` | Paginated query across all categories |
| `getSignById(id)` | Single sign lookup |
| `getCategories()` | Returns category list with counts |

#### 9.3 Controller: `backend/controller/signController.js`

Handlers following existing pattern (`async (req, res, next) => try/catch → AppError`):

| Handler | Route | Auth |
|---|---|---|
| `getDailySign` | `GET /daily` | Public |
| `getSigns` | `GET /` | Public |
| `getSignById` | `GET /:id` | Public |
| `getCategories` | `GET /categories` | Public |

#### 9.4 Route: `backend/routes/signRoute.js`

```js
import { Router } from "express";
import {
  getDailySign,
  getSigns,
  getSignById,
  getCategories,
} from "../controller/signController.js";

const router = Router();

router.get("/daily", getDailySign);
router.get("/categories", getCategories);
router.get("/:id", getSignById);
router.get("/", getSigns);

export default router;
```

#### 9.5 Seed Data: `backend/data/signsSeed.json`

See [Section 12: Seed Data Strategy](#12-seed-data-strategy) for the full schema and example entries.

#### 9.6 Mount in `backend/index.js`

```js
import signRoute from "./routes/signRoute.js";
// ... inside route mounting section:
app.use("/api/v1/signs", signRoute);
```

#### 9.7 Security & Rate Limiting

- **Rate Limiting**: Apply strict rate limiting (e.g., 100 requests / 15 mins) on public API routes (`/api/v1/signs/*`) to prevent abuse and DDoS attacks.
- **CORS & Headers**: Ensure Helmet and standard CORS policies are active to only allow requests from the verified React frontend.

---

## 10. Frontend Implementation Plan

### File Structure

```
frontend/src/features/iman-boost/
├── ImanBoostPage.tsx              # Main page component (named export)
├── useSigns.ts                    # TanStack Query hooks
├── types.ts                       # TypeScript interfaces
├── index.ts                       # Barrel exports
└── components/
    ├── DailySignBanner.tsx        # Hero card for daily sign
    ├── SignCard.tsx                # Individual sign card
    ├── SignDetailModal.tsx         # Full detail view (sheet/modal)
    ├── CategoryTabs.tsx           # Category filter tabs
    └── SignGrid.tsx               # Responsive card grid
```

### 10.1 Types: `types.ts`

```ts
export type SignCategory =
  | 'quran_science'
  | 'prophecy'
  | 'linguistic_miracle'
  | 'historical_fact'
  | 'prophetic_wisdom'
  | 'names_of_allah';

export interface Sign {
  _id: string;
  category: SignCategory;
  title: string;
  content: string;         // Short (card preview)
  explanation: string;     // Long (detail view)
  reference: string;
  arabicText?: string;
  translation?: string;
  sourceUrl: string;
  mediaUrl?: string;
  order: number;
  tags: string[];
  createdAt: string;
}

export interface SignsResponse {
  signs: Sign[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CategoryCount {
  category: SignCategory;
  count: number;
}
```

### 10.2 Hooks: `useSigns.ts`

```ts
// Pattern: useQuery with api instance from @/lib/api

export function useDailySign()
  // queryKey: ['signs', 'daily']
  // GET /api/v1/signs/daily

export function useSigns(category?: SignCategory, page = 1)
  // queryKey: ['signs', { category, page }]
  // GET /api/v1/signs?category=...&page=...

export function useSignById(id: string)
  // queryKey: ['signs', id]
  // GET /api/v1/signs/:id
  // enabled: !!id

export function useSignCategories()
  // queryKey: ['signs', 'categories']
  // GET /api/v1/signs/categories
```

### 10.3 Page: `ImanBoostPage.tsx`

Layout structure:

```
┌─────────────────────────────────────────┐
│          Page Header                     │
│  "Signs of Islam" + subtitle             │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐     │
│  │      Daily Sign Banner          │     │
│  │  (hero card, Arabic + transl.)  │     │
│  └─────────────────────────────────┘     │
├─────────────────────────────────────────┤
│  [ All ] [ Qur'an & Science ] [ Proph ] │  ← Category Tabs
│  [ Linguistic ] [ Historical ] [ Wis. ] │
├─────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ Sign   │ │ Sign   │ │ Sign   │       │
│  │ Card 1 │ │ Card 2 │ │ Card 3 │       │
│  └────────┘ └────────┘ └────────┘       │  ← Responsive Grid
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ Sign   │ │ Sign   │ │ Sign   │       │
│  │ Card 4 │ │ Card 5 │ │ Card 6 │       │
│  └────────┘ └────────┘ └────────┘       │
├─────────────────────────────────────────┤
│         Load More / Pagination           │
└─────────────────────────────────────────┘
```

### 10.4 Route Registration: `App.tsx`

```tsx
// Lazy import
const ImanBoostPage = lazy(() =>
  import('@/features/iman-boost/ImanBoostPage').then((m) => ({
    default: m.ImanBoostPage,
  }))
);

// Route (public — no AuthGuard)
<Route path="/iman-boost" element={<ImanBoostPage />} />
```

### 10.5 Error Handling & Edge Cases

- **Redis/Backend Downtime**: If the API fails to fetch the daily sign, display a graceful fallback (e.g., a locally stored generic message) instead of breaking the UI.
- **Loading States**: Use TanStack Query's `isLoading` to show animated Skeleton loaders for the banner and grid items.
- **Empty Categories**: If a filtered category returns empty, display a beautiful empty state ("New signs coming soon to this category.").

---

## 11. UX & Design Spec

### Design Principles

1. **Awe-inspiring, not preachy** — Let the facts speak for themselves. Clean, modern design that would feel at home on a premium science or TED platform.
2. **Credible, not sensational** — Always show the source. Never overstate. Include the original Arabic with translation.
3. **Accessible** — No Islamic jargon without explanation. A non-Muslim should understand every card.
4. **Shareable** — Every card should be beautiful enough to screenshot or share.

### Component Specifications

#### DailySignBanner

| Property | Spec |
|---|---|
| Layout | Full-width card with subtle gradient background (using theme primary colors) |
| Content | Category badge → Arabic text (large, elegant font) → Translation → Title → "Explore" CTA |
| Animation | Framer Motion `fadeIn` + subtle `y` slide on mount |
| Interaction | Click opens SignDetailModal |

#### SignCard

| Property | Spec |
|---|---|
| Layout | Rounded card (`rounded-xl`) with padding, category color-coded top border |
| Content | Category icon + label → Title (semibold, 1-2 lines) → Content preview (text-muted, 2-3 lines, truncated) → Reference tag |
| Animation | Staggered `fadeIn` with `y` offset per card (Framer Motion `staggerChildren`) |
| Interaction | Click opens SignDetailModal |
| Responsive | 1 col mobile, 2 col tablet, 3 col desktop |

#### SignDetailModal

| Property | Spec |
|---|---|
| Type | shadcn/ui `Sheet` (slides from right) or `Dialog` (centered modal) — TBD during prototyping |
| Content | Full Arabic text (large) → Translation → Horizontal rule → Title → Full explanation (multi-paragraph) → Reference badge → Source link (external) |
| Actions | Bookmark button, Share to Feed button, Copy link, "SubhanAllah" reaction (future Phase 2) |
| Animation | Framer Motion `slideIn` from right |

#### CategoryTabs

| Property | Spec |
|---|---|
| Layout | Horizontally scrollable pill buttons with Lucide icons |
| Colors | Each category has a distinct accent color (from design tokens) |
| State | Active tab highlighted, URL param synced (`?category=prophecy`) |

### Category Color Map

| Category | Color Token | Hex Reference |
|---|---|---|
| `quran_science` | `blue` | `#3B82F6` |
| `prophecy` | `amber` | `#F59E0B` |
| `linguistic_miracle` | `violet` | `#8B5CF6` |
| `historical_fact` | `emerald` | `#10B981` |
| `prophetic_wisdom` | `rose` | `#F43F5E` |
| `names_of_allah` | `sky` | `#0EA5E9` |

---

## 12. Seed Data Strategy

### Minimum Viable Content: 50 Facts

Target distribution for launch:

| Category | Target Count | Priority |
|---|---|---|
| `quran_science` | 10 | High |
| `prophecy` | 12 | High |
| `linguistic_miracle` | 6 | Medium |
| `historical_fact` | 8 | Medium |
| `prophetic_wisdom` | 8 | Medium |
| `names_of_allah` | 6 | Lower (can grow) |
| **Total** | **50** | |

### Seed JSON Schema (per entry)

```json
{
  "category": "prophecy",
  "title": "Barefoot Shepherds Competing in Tall Buildings",
  "content": "Prophet Muhammad ﷺ predicted that barefoot, destitute shepherds would compete in constructing ever-taller buildings — a scene unimaginable in 7th-century Arabia.",
  "explanation": "In the famous Hadith of Jibril (Angel Gabriel), the Prophet ﷺ was asked about the signs of the Hour. Among his answers: 'And if you see the barefoot, naked shepherds of camels competing in the construction of high-rise buildings, then this is from among the signs of the Hour.' (Sahih Muslim 8)\n\nFor over 1,300 years this prophecy seemed puzzling — the Arabian Peninsula was among the poorest regions on Earth, populated largely by nomadic Bedouin tribes. Yet today, the Gulf States — particularly the UAE and Saudi Arabia — are home to some of the tallest skyscrapers ever built, including the Burj Khalifa (828m) and the under-construction Jeddah Tower. The transformation of these desert regions from impoverished nomadic lands to global centers of architectural ambition is exactly what was described.",
  "reference": "Sahih Muslim 8",
  "arabicText": "وَأَنْ تَرَى الْحُفَاةَ الْعُرَاةَ الْعَالَةَ رِعَاءَ الشَّاءِ يَتَطَاوَلُونَ فِي الْبُنْيَانِ",
  "translation": "And you will see the barefoot, naked, destitute shepherds competing in constructing lofty buildings.",
  "sourceUrl": "https://sunnah.com/muslim/1/1",
  "mediaUrl": null,
  "order": 1,
  "isPublished": true,
  "tags": ["end-times", "fulfilled", "modern-world"]
}
```

### Example Entries Per Category

#### Qur'an & Science

| # | Title | Reference | Key Point |
|---|---|---|---|
| 1 | Human Embryonic Development | Quran 23:12-14 | Describes stages of embryo (nutfah → alaqah → mudghah) matching modern embryology |
| 2 | The Expanding Universe | Quran 51:47 | "We are expanding it" — discovered by Hubble in 1929 |
| 3 | Mountains as Stabilizers | Quran 78:6-7 | Mountains have deep roots (pegs) — confirmed by modern geology |
| 4 | The Water Cycle | Quran 39:21 | Complete water cycle described — not understood until 17th century |
| 5 | Darkness in Deep Seas | Quran 24:40 | Layers of darkness in deep ocean — confirmed by oceanography |
| 6 | Iron Sent Down | Quran 57:25 | "We sent down iron" — iron is indeed extraterrestrial (from supernovae) |
| 7 | Barrier Between Two Seas | Quran 55:19-20 | Fresh and salt water don't mix due to pycnocline — discovered by oceanography |
| 8 | The Frontal Lobe | Quran 96:15-16 | "Lying, sinful forelock" — prefrontal cortex controls decision-making and deception |
| 9 | Pain Receptors in Skin | Quran 4:56 | "We will replace their skins so they may taste the punishment" — pain receptors are in skin |
| 10 | The Big Bang | Quran 21:30 | "The heavens and earth were a joined entity, and We separated them" |

#### Fulfilled Prophecies

| # | Title | Reference | Key Point |
|---|---|---|---|
| 1 | The Byzantines Will Rebound | Quran 30:2-4 | Predicted Byzantine victory within 3-9 years — fulfilled in 6-8 years |
| 2 | Abū Lahab's Fate | Quran 111:1-3 | Predicted he'd never accept Islam — he never did (9 years to disprove, yet didn't) |
| 3 | Globalization of Islam | Musnad Ahmad 16957 | "This matter will reach every place touched by night and day" — 1.9B Muslims worldwide |
| 4 | Conquest of Constantinople | Musnad Ahmad 18957 | Predicted 800 years before Sultan Muhammad al-Fatih achieved it in 1453 |
| 5 | Barefoot Shepherds in Tall Buildings | Sahih Muslim 8 | Gulf States skyscraper boom from formerly nomadic desert regions |
| 6 | Competing in Mosque Ornamentation | Sunan Abi Dawud 448 | Modern mosque architecture as competitive display |
| 7 | Spread of Interest (Riba) | Musnad Ahmad 10410 | Interest-bearing transactions now inescapable globally |
| 8 | A Woman Traveling Safely | Sahih al-Bukhari 3595 | Predicted safe female travel from Iraq to Makkah — fulfilled in 'Adi's lifetime |
| 9 | Technology Making Things Speak | Sunan al-Tirmidhi 2181 | "A man's whip and sandal straps will speak to him" — smartphones, smart devices |
| 10 | The Last Emperors | Sahih al-Bukhari 3618 | Predicted no more Caesar in Syria, no more Chosroes in Iraq — both dynasties ended |
| 11 | Six Signs in Sequence | Sahih al-Bukhari 3176 | Death → Jerusalem conquest → plague → wealth surplus → tribulation → all fulfilled in order |
| 12 | Arabia Reverting to Green | Sahih Muslim 157 | NASA satellite imagery confirms greening of Saudi desert via modern irrigation |

#### Linguistic Miracles

| # | Title | Reference | Key Point |
|---|---|---|---|
| 1 | The Word "Day" Appears 365 Times | Full Qur'an | Exact count of "yawm" (day, singular) = 365 |
| 2 | The Middle Verse of Baqarah | Quran 2:143 | 286 verses ÷ 2 = 143 — the verse contains the word "moderate" (wasatan) |
| 3 | The Qur'anic Challenge | Quran 2:23, 17:88 | 1400+ years, no one has produced a single chapter like it |
| 4 | Ring Composition | Surah Baqarah | Perfect chiastic (mirror) structure across 286 verses |
| 5 | "Sea" vs "Land" Ratio | Full Qur'an | "Sea" (32 times) and "land" (13 times) ratio = 71.1% to 28.9% ≈ Earth's actual ratio |
| 6 | Consistent Style Across 23 Years | Full Qur'an | Revealed over 23 years in various contexts, yet maintains unified literary style |

---

## 13. Differentiation from Existing Features

| Feature | Focus | Iman Boost Difference |
|---|---|---|
| **Daily Learning** | Structured Qur'an reading (ayah/ruku/juzz) with reflections | Iman Boost is **fact-based cards**, not continuous reading. Focus on "wow factor" and evidence, not sequential study. |
| **Ruhani Hub** | Spiritual practice system (tafakkur, tazkia, journaling) | Ruhani is **practice-oriented** (habit tracking, self-improvement). Iman Boost is **knowledge-oriented** (learn facts, strengthen conviction). |
| **Quran Topics** | Browse Qur'an by topic/mood | Quran Topics helps find **relevant verses**. Iman Boost provides **curated explanations** of why specific verses are remarkable. |
| **Daily Ayah** | Single daily verse with reflection | Simple verse delivery. Iman Boost adds **scientific context, historical verification, and shareability**. |

---

## 14. Competitive Landscape

### Direct Competitors (Apps)

| App | What They Do | Our Advantage |
|---|---|---|
| **Miracles of Quran (Play Store)** | List-based Quran miracles, basic UI | DeenVerse: Social sharing, beautiful card UI, verified sources, daily rotation |
| **Deen Quiz** | Gamified Islamic quizzes | DeenVerse: Deeper content (not just trivia), social engagement, integrated in a larger platform |
| **Muslim Pro: AiDeen** | AI chatbot for Q&A | DeenVerse: Curated human-verified content > AI-generated answers for sensitive religious content |

### Indirect Competitors (Platforms)

| Platform | What They Do | Our Advantage |
|---|---|---|
| **Yaqeen Institute** | Long-form papers and video series (20+ min reads) | DeenVerse: Bite-sized cards (30-second consumption). Yaqeen is the source, we're the distribution. |
| **Quran.com Learning Plans** | Multi-day structured Quran courses | DeenVerse: Casual browse vs. committed course. Lower commitment entrance. |
| **QuranReflect** | User-generated verse reflections (social feed) | DeenVerse: Curated expert content vs. crowdsourced. Higher quality bar. |

### Unique Value Proposition

> **"Yaqeen-quality Islamic facts in a TikTok-length format, shareable on a Muslim social network."**

No one else combines: (1) academically verified content + (2) beautiful card UI + (3) integrated social sharing + (4) daily content rotation on (5) a Muslim social platform.

---

## 15. Risks & Mitigations

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| **Using weak/fabricated hadith** | Critical | Low if process followed | Only Sahih/Hasan grade. Every entry requires `sourceUrl`. Pre-launch review by knowledgeable person. |
| **Overstating scientific claims** | High | Medium | Frame as "signs" not "proof". Include disclaimer text. Avoid fringe claims (speed of light, etc.). Stick to mainstream science. |
| **Content feels thin at launch** | Medium | Medium | Minimum 50 well-curated facts before launch. Quality > quantity. Daily rotation means users see ~1/day. |
| **Content exhaustion** | Medium | Low (short-term) | 50 facts ÷ 1/day = 50 days before repeat. Plan to add 5-10/month. Phase 3: community submissions. |
| **Feature overlap confusion** | Low | Medium | Clear naming and navigation placement. Different icon. Explicit subtitle: "Explore the signs and miracles of Islam". |
| **Non-Muslim sensitivity** | Medium | Low | Neutral, evidence-based tone. No "you must believe". Accessible language. No Islamic jargon without explanation. |
| **SEO/social preview quality** | Low | Low | Each sign gets OG meta tags for beautiful social sharing previews at `/iman-boost/signs/:id`. |

## 15.5 Testing & QA Strategy

- **Backend Unit Tests**: Verify `getTodayIndex()` calculation timezone behavior (must consistently rotate at midnight UTC).
- **API Integration Tests**: Verify public routes return cached vs DB responses properly.
- **Frontend Component Tests**: Test rendering of `SignCard` and `DailySignBanner` under loading, error, and succesful state conditions.
- **Responsive QA**: Manual testing of grid layouts from mobile (1 col) to desktop (3 col).

---

## 16. Phased Rollout Plan

### Phase 1: MVP (Target: 2-3 weeks)

- [x] Research & documentation (this document)
- [ ] Backend: Sign model, service, controller, route
- [ ] Backend: Seed script + 50 curated facts in `signsSeed.json`
- [ ] Frontend: `ImanBoostPage` with DailySignBanner, CategoryTabs, SignGrid, SignCard, SignDetailModal
- [ ] Frontend: `useSigns` hooks (useDailySign, useSigns, useSignById, useSignCategories)
- [ ] Route registration in App.tsx
- [ ] Navigation entry point (sidebar icon: `Sparkles` from Lucide)
- [ ] All endpoints public (no auth required)

### Phase 2: Social Features (Target: 1-2 weeks after Phase 1)

- [ ] "Bookmark" sign (requires auth) — reuse existing collection/saved pattern
- [ ] "Share to Feed" — creates a DeenVerse post with sign preview card
- [ ] "SubhanAllah" reaction counter (lightweight — sign-level counter, auth required)
- [ ] Sign detail page at `/iman-boost/signs/:id` (for direct linking / SEO)
- [ ] OG meta tags for social sharing previews

### Phase 3: Growth & Community (Target: 4-6 weeks after Phase 1)

- [ ] User-submitted signs with moderation queue (requires `isPublished: false` and `approvedBy: AdminId` schema additions)
- [ ] Admin dashboard for content management (CRUD on signs)
- [ ] Streak tracking ("7-day signs streak!")
- [ ] Push notification: "Your daily sign is ready"
- [ ] Search within signs
- [ ] Related signs suggestions ("You might also find interesting...")
- [ ] Analytics tracking (most viewed, most shared, most bookmarked)

---

## 17. Open Questions

| # | Question | Impact | Status |
|---|---|---|---|
| 1 | Should the detail view be a modal/sheet or a full page? | UX feel | Decide during prototyping |
| 2 | Should we include video content in Phase 1 or defer? | Scope | Recommendation: defer to Phase 2+ |
| 3 | Who reviews seed data for Islamic accuracy? | Content quality | Need to assign reviewer |
| 4 | Should signs be translatable (Arabic/Urdu/French)? | i18n scope | Recommendation: English-only for v1 |
| 5 | Navigation placement — sidebar item or sub-item of existing "Explore"? | Discoverability | Need UX decision |
| 6 | Should `names_of_allah` be its own feature or part of Iman Boost? | Feature scope | Recommendation: include in Iman Boost as a category for now |
| 7 | Rate of new content additions post-launch? | Sustainability | Recommendation: 5-10 facts/month minimum |

---

## Appendix A: Key References

1. **Yaqeen Institute — The Prophecies of Prophet Muhammad ﷺ** — [yaqeeninstitute.org/read/paper/the-prophecies-of-prophet-muhammad](https://yaqeeninstitute.org/read/paper/the-prophecies-of-prophet-muhammad) — Primary source for prophecy category (31 numbered prophecies with full academic citations)
2. **AlQuran.cloud API Documentation** — [alquran.cloud/api](https://alquran.cloud/api)
3. **AhmedBaset/hadith-json** — [github.com/AhmedBaset/hadith-json](https://github.com/AhmedBaset/hadith-json)
4. **Sunnah.com Developer Access** — [sunnah.com/developers](https://sunnah.com/developers)
5. **Wikipedia: I'jaz (Qur'anic Inimitability)** — [en.wikipedia.org/wiki/I'jaz](https://en.wikipedia.org/wiki/I%27jaz)
6. **Maurice Bucaille — The Bible, the Qur'an, and Science** — ISBN 2221012119

## Appendix B: Existing DeenVerse Patterns to Follow

| Pattern | Reference File | Notes |
|---|---|---|
| Backend Model | `backend/models/DailyLearning.js` | Mongoose schema with timestamps, enums, compound indexes |
| Backend Service | `backend/services/quranService.js` | Pure functions, Redis caching, `getTodayIndex()` |
| Backend Controller | `backend/controller/dailyLearningController.js` | `async (req, res, next)`, AppError, logger |
| Backend Route | `backend/routes/dailyLearningRoute.js` | Express Router, `isAuthenticated` per-route |
| Route Mount | `backend/index.js` | `app.use("/api/v1/<resource>", route)` |
| Frontend Feature | `frontend/src/features/daily-learning/` | Page + hook + components/ + types |
| Frontend Hook | `frontend/src/features/daily-learning/useDailyLearning.ts` | `useQuery`/`useMutation` with `api` from `@/lib/api` |
| Frontend Routing | `frontend/src/App.tsx` | Lazy import with named export re-wrap, Route inside MainLayout |
| Rich Feature | `frontend/src/features/ruhani/` | Multiple pages, api layer, stores, prototypes |
