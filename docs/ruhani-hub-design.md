# Ruhani Hub — Design & Architecture Document

> **Route**: `/ruhani`
> **Concept**: An intentional, distraction-free spiritual workspace where users come when they have dedicated time and mental clarity for deep Islamic practices.
> **Status**: 🟢 **Phase 1 & 2 Implemented** — Phase 3 (Guided Session) not yet built (March 2026)

---

## 🟢 Implementation Progress (Updated March 2026)

### Frontend — ✅ All Core Pages Implemented
| File | Status | Phase |
|---|---|---|
| `frontend/src/features/ruhani/RuhaniHubPage.tsx` | ✅ Done | Phase 1 |
| `frontend/src/features/ruhani/TafakkurPage.tsx` | ✅ Done | Phase 1 |
| `frontend/src/features/ruhani/TazkiaPage.tsx` | ✅ Done | Phase 1 |
| `frontend/src/features/ruhani/TadabburPage.tsx` | ✅ Done | Phase 2 |
| `frontend/src/features/ruhani/RuhaniJournalPage.tsx` | ✅ Done | Phase 1 |
| `frontend/src/features/ruhani/ruhaniApi.ts` | ✅ Done | Phase 1 |
| `frontend/src/features/ruhani/useRuhani.ts` | ✅ Done | Phase 1 |
| `frontend/src/features/ruhani/ruhaniStore.ts` | ✅ Done | Phase 1 |
| `frontend/src/features/ruhani/components/` | ✅ Done | Phase 1-2 |
| `GuidedSessionPage.tsx` | ❌ Not built | Phase 3 |

### Backend — ✅ Core API Implemented
| File | Status | Notes |
|---|---|---|
| `backend/routes/ruhaniRoute.js` | ✅ Done | All content + practice endpoints |
| `backend/controller/ruhaniController.js` | ✅ Done | `getTafakkurTopics`, `getTodayTafakkurTopic`, etc. |
| `backend/services/ruhaniService.js` | ✅ Done | Encapsulates static data serving + practice CRUD |
| `backend/models/spiritualPracticeSchema.js` | ✅ Done | Per-entry model for Tafakkur/Tadabbur/Tazkia |
| `backend/data/tafakkurTopics.js` | ✅ Done | Creation-sign topics with guided questions |
| `backend/data/tadabburAyahs.js` | ✅ Done | Curated Tadabbur ayahs with reflection prompts |
| `backend/data/tazkiaTraits.js` | ✅ Done | ~20 character traits with muhasaba prompts |
| `spiritualSessionSchema.js` | ❌ Not built | Required for Phase 3 Guided Session |

### What Remains (Phase 3)
- [ ] `GuidedSessionPage.tsx` — time-selection → sequential Tafakkur → Tadabbur → Tazkia stepper
- [ ] `SessionTimer.tsx` — soft ambient countdown
- [ ] `SessionSummaryCard.tsx` — end-of-session share card
- [ ] `backend/models/spiritualSessionSchema.js` — session record model
- [ ] `POST /api/v1/ruhani/session` and `PUT /api/v1/ruhani/session/:id` endpoints
- [ ] Cross-link bridge prompts at practice transitions (Phase 2 enhancement)
- [ ] "Enter Tadabbur mode" button in Quran reader (integration with `/quran` feature)

### What Remains (Phase 4 — future)
- Session intelligence / content rotation based on user history
- Offline mode for journal entries
- Public sharing of Ruhani entries to feed (schema supports it, UI not built)

---

1. [The Three Practices — What They Are and How They Relate](#1-the-three-practices)
2. [The Core Insight: They Form a Spiral](#2-the-core-insight-they-form-a-spiral)
3. [Design Philosophy: Intentional Deep Focus](#3-design-philosophy-intentional-deep-focus)
4. [UX Architecture](#4-ux-architecture)
5. [The Guided Session Flow](#5-the-guided-session-flow)
6. [Cross-Linking Between Practices](#6-cross-linking-between-practices)
7. [Technical Architecture](#7-technical-architecture)
8. [Database Models](#8-database-models)
9. [API Design](#9-api-design)
10. [Frontend File Structure](#10-frontend-file-structure)
11. [Backend File Structure](#11-backend-file-structure)
12. [Curated Static Content Plan](#12-curated-static-content-plan)
13. [Risks & Rollout Plan](#13-risks--rollout-plan)

---

## 1. The Three Practices

### Tafakkur (تَفَكُّر) — Deep Contemplation

**What it is**: Deliberate, focused reflection on Allah's signs (Ayaat) visible in the natural world — the universe, creation, the human body, life and death, time, seasons.

**Quranic Basis**:
- "Afala tatafakkarun?" — Will you not reflect? (6:50, 28:68, 45:13)
- "In the creation of the heavens and the earth and the alternation of day and night are signs for people of understanding." (3:190)
- "We will show them Our signs in the horizons and within themselves until it becomes clear to them that it is the truth." (41:53)

**What happens in the heart**: When a person genuinely reflects on creation, they experience *ihsas* (feeling/awareness) of Allah's power, wisdom, mercy, and majesty. This is the gateway to deeper iman and khushoo.

**Practical form in the app**:
- User is shown a "creation sign" card (e.g., The Rain, Human Sleep, The Ocean, Bees, Mountains)  
- Each card includes the relevant Quran verse(s) about that sign  
- Guided contemplation questions help the user dwell on it  
- A free journal field captures their insight

---

### Tadabbur (تَدَبُّر) — Pondering the Quran

**What it is**: The act of reading the Quran slowly and carefully, trying to understand the deep meaning of each word and verse — not just recitation (tilawah) but genuine engagement with Allah's speech.

**Quranic Basis**:
- "Afala yatadabbaroonal Quran? Am ala quloobun aqfaaluhaa?" — Do they not ponder the Quran? Or are there locks on their hearts? (47:24)
- "A blessed Book which We revealed to you that they might reflect upon its verses." (38:29)
- "Indeed We have made it an Arabic Quran perhaps you will reflect." (43:3)

**Ibn Kathir's note**: The companions (Sahaba) would not move on to the next ten ayahs until they had fully understood and acted upon the previous ten. Tadabbur is not speed — it is depth.

**Practical form in the app**:
- User picks an ayah or passage from the existing Quran reader  
- A structured reflection panel opens with 3 guided questions:
  1. *What is Allah telling us in this verse?* (comprehension)
  2. *How does this verse relate to my life right now?* (personal application)
  3. *What is one thing I will change after reading this?* (action)
- User writes their answers and saves as a Tadabbur entry (private or shared)

---

### Tazkia (تَزْكِيَة) — Soul Purification

**What it is**: The ongoing process of purifying the nafs (soul) — removing blameworthy character traits (*akhlaq madhmuma*) and cultivating praiseworthy ones (*akhlaq mahmuda*). Includes *muhasaba* (self-accounting) — examining your own soul's state regularly.

**Quranic Basis**:
- "Qad aflaha man zakkaha, wa qad khaba man dassaha" — He succeeds who purifies it, and fails who corrupts it. (91:9-10)
- "Allah did favour the believers when He sent them a messenger... to purify them." (3:164)
- Prophet ﷺ said: "The most perfect believer in faith is the one with the best character." (Abu Dawud)

**The Muhasaba practice**: Imam Al-Ghazali and Ibn Al-Qayyim emphasized *muhasaba al-nafs* — sitting daily/weekly to ask: What did I do today? Where did I fall short? What do I need to fix?

**Practical form in the app**:
- Curated list of ~20 key character traits (Sabr, Shukr, Sidq, Amanah, Tawadu', Ikhlas, etc.)
- Daily spiritual habit checklist (Fajr on time, Dhikr, Quran, Sadaqah, Helped someone)
- Weekly Muhasaba journal: structured self-questioning
- Streak heatmap showing growth over time (private)

---

## 2. The Core Insight: They Form a Spiral

The three practices are **not independent**. They form a **progressive, self-reinforcing spiral** of spiritual growth:

```
        ┌─────────────────────────────────────────────┐
        │                                             │
        ▼                                             │
  ┌───────────┐                                       │
  │ TAFAKKUR  │ ← Contemplate a sign in creation      │
  │           │   (e.g. rainwater, sleep, death)      │
  └─────┬─────┘                                       │
        │                                             │
        │ "What does the Quran say about this?"       │
        │                                             │
        ▼                                             │
  ┌───────────┐                                       │
  │ TADABBUR  │ ← Ponder the related Quran verses     │
  │           │   (deeply, with guided questions)     │
  └─────┬─────┘                                       │
        │                                             │
        │ "What in me needs to change based on this?" │
        │                                             │
        ▼                                             │
  ┌───────────┐                                       │
  │  TAZKIA   │ ← Work on the revealed character      │
  │           │   trait via muhasaba + action plan    │
  └─────┬─────┘                                       │
        │                                             │
        │ "What signs of Allah's mercy did            │
        │  I see as I worked on this trait?"          │
        │                                             │
        └─────────────────────────────────────────────┘
```

**Example of the spiral in action**:

1. User does Tafakkur on **"The Rain"** — reflects on how water falls from sky, brings dead earth to life
2. App surfaces related ayahs: "We send down blessed water from the sky... (50:9)", "He is the one who sends winds as heralds of His mercy... (7:57)"
3. User does Tadabbur on 7:57 — enters guided reflection. They realize: *"Rain doesn't discriminate. It falls on everyone. Do I show mercy to everyone?"*
4. This leads naturally to a Tazkia prompt: *"How is your Rahma (mercy) towards others?"* → They do muhasaba on the trait of **Rahma**
5. They leave with a concrete action: "Tomorrow I will do one act of mercy for someone who doesn't deserve it in my eyes"
6. Next session, they start with gratitude for how that action felt → triggering the spiral again

**This spiral is what makes the feature unique.** It's not 3 tabs — it's one journey that uses all three lenses.

---

## 3. Design Philosophy: Intentional Deep Focus

### The Problem This Solves
Modern Islamic apps (and most apps) are designed for **fractional attention** — quick dopamine hits, notifications, infinite scrolling. The Quran and Hadith were meant to be engaged with using *taaddub* (reverence) and *tawadu'* (humility), which require calm focus.

Tafakkur, Tadabbur, and Tazkia **all require uninterrupted mental presence**. You cannot rush them.

### The Principle: A Sacred Space Within the App
The Ruhani Hub is designed like a **separate room you enter intentionally**:

- **No feed** — no social content inside the hub
- **No notifications** — the hub should suppress notification badges while active
- **Ambient-first** — calm dark background, minimal UI chrome, generous white space
- **Time-aware** — user declares intent ("I have 15 minutes") before entering
- **No streaks/gamification pressure** — this is for the heart, not for performance

### Analogy
Think of the rest of DeenVerse (feed, Hadith, Quran reader) as a **masjid's main hall** — active, social, educational. The Ruhani Hub is the **side room reserved for i'tikaf** (spiritual retreat) — same building, different contract when you enter.

---

## 4. UX Architecture

### Entry Point
- In the main sidebar/nav: a single "Ruhani" link, ideally with a crescent moon icon  
- Also accessible from the Learn Quran hub (`/learn-quran`) as a card
- Accessible from the Quran reader as "Enter Tadabbur mode" on any ayah

### Hub Screens

```
/ruhani                    → Landing / Hub overview
/ruhani/session            → [Optional] Guided session (time-based orchestration)
/ruhani/tafakkur           → Standalone Tafakkur practice
/ruhani/tadabbur           → Standalone Tadabbur practice  
/ruhani/tazkia             → Standalone Tazkia practice
/ruhani/journal            → Unified journal of all past entries (private)
```

### Hub Landing Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ◌  Ruhani Space                          [Today's suggestion]  │
│  Quiet your mind. Deepen your connection.                       │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │   🌑 Tafakkur   │  │   📖 Tadabbur   │  │  🌿 Tazkia    │  │
│  │                 │  │                 │  │               │  │
│  │  Contemplate    │  │  Ponder the     │  │  Purify your  │  │
│  │  Allah's signs  │  │  Quran deeply   │  │  soul         │  │
│  │ in creation     │  │                 │  │               │  │
│  │                 │  │  "Do they not   │  │  Self-account,│  │
│  │ [Begin]         │  │   ponder?"      │  │  build virtues│  │
│  │                 │  │  [Begin]        │  │  [Begin]      │  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  ✨ Start a Guided Session (we'll weave all three for you)      │
│     "How much time do you have?"  [ 10 min ] [ 20 min ] [Free] │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  📓 My Ruhani Journal     Last entry: 3 days ago  [View All]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. The Guided Session Flow

When a user taps "Start a Guided Session", they enter a **sequential, time-boxed spiritual journey**.

### Time Selection
```
"How much time do you have with yourself today?"
  [ 10 minutes ]   [ 20 minutes ]   [ 40 minutes ]   [ Open-ended ]
```

### Session Allocation
| Total Time | Tafakkur | Tadabbur | Tazkia |
|---|---|---|---|
| 10 min | 3 min | 5 min | 2 min |
| 20 min | 5 min | 10 min | 5 min |
| 40 min | 10 min | 20 min | 10 min |
| Open | Self-paced | Self-paced | Self-paced |

### Session Step Flow
```
Step 1 — Arrival (30 sec)
  "Take a few breaths. You've set aside [X] minutes for your Ruhani journey today."
  [Begin]

Step 2 — Tafakkur (X min)
  Today's creation sign card with timer
  Write reflection
  [Continue to Tadabbur → ]

Step 3 — Tadabbur (X min)  
  Related Quran verse with guided questions
  Cross-references to Tafakkur insight ("You just reflected on rain — now read what Allah says about it")
  Write reflections
  [Continue to Tazkia → ]

Step 4 — Tazkia (X min)
  Character trait card surfaced from Tadabbur insights
  Muhasaba prompts tied to the trait
  Commit to one action
  [Complete Session]

Step 5 — Session Summary
  "Today's Ruhani session is complete"
  Brief summary: topic, verse, trait, action
  Option to share (a beautiful card) or save privately
  [Save to Journal]
```

### Session Intelligence (Phase 2 feature)
The session can become smarter over time:
- If user did Tafakkur on "Water" 3 weeks ago, it rotates to a new topic
- If user consistently struggles with "Sabr" in Tazkia, it re-surfaces related Quranic verses in Tadabbur
- This creates a personalized spiral without AI (using rule-based topic affinity tables)

---

## 6. Cross-Linking Between Practices

This is the core technical design challenge: how do the three practices link to each other?

### Mapping: Tafakkur Topic → Tadabbur Ayahs

Each Tafakkur topic has a curated list of linked Quran verses:

```javascript
// Example: tafakkurTopics.js
{
  slug: "rain-and-water",
  title: "Rain & Water",
  arabicTitle: "المطر والماء",
  icon: "🌧️",
  theme: "mercy-and-provision",
  contemplate: "Water falls from the sky as dead rain, touches dead soil, and bursts it into life. Neither the cloud planned it nor the soil asked for it. Whose plan was it?",
  quranRefs: ["2:22", "7:57", "25:48", "50:9", "56:68-70"],
  primaryVerseKey: "7:57",
  guidedQuestions: [
    "When did you last notice rain falling? What were you thinking?",
    "If you had no water for 3 days, what would change about how you value it?",
    "In what area of your life are you waiting for 'rain' from Allah?"
  ],
  linkedTazkiaTraits: ["shukr", "tawakkul", "sabr"]
}
```

### Mapping: Tadabbur Ayah → Tazkia Traits

Each ayah has an optional `relatedTrait` field pointing to Tazkia trait slugs:

```javascript
// Tazkia is triggered when user finishes Tadabbur
// The system asks: "This verse is about [trait]. How are you doing with [trait]?"

// Example surfaced after Tadabbur on 7:57 (Winds heralding mercy):
{
  trigger: "tadabbur:complete",
  verse: "7:57",
  suggestedTrait: "tawakkul",
  transitionPrompt: "This verse speaks of how Allah sends mercy before we even ask. A heart that has tawakkul (reliance on Allah) sees this clearly. How is your tawakkul today?"
}
```

### Mapping: Tazkia Traits → Back to Tafakkur (closing the loop)

After a Tazkia session, the app can suggest a related Tafakkur to reinforce the lesson:

```javascript
// After working on "Sabr":
{
  trigger: "tazkia:complete",
  trait: "sabr",
  suggestedTafakkurTopic: "seasons-and-change", // Winter → Spring → teaching sabr
  transitionPrompt: "Trees don't rush their seasons. What sign of sabr in creation can you reflect on?"
}
```

---

## 7. Technical Architecture

### Overview

```
Frontend (Vite + React 18 + TS)
  └── /ruhani                         → RuhaniHub page
      ├── /tafakkur                   → TafakkurPage
      ├── /tadabbur                   → TadabburPage
      ├── /tazkia                     → TazkiaPage
      ├── /session                    → GuidedSessionPage
      └── /journal                    → RuhaniJournalPage

Backend (Node.js + Express ESM)
  ├── routes/ruhaniRoute.js
  ├── controller/ruhaniController.js
  ├── services/ruhaniService.js
  ├── models/
  │   ├── spiritualPracticeSchema.js  → individual practice entries
  │   └── spiritualSessionSchema.js  → guided session records
  └── data/
      ├── tafakkurTopics.js           → static curated content
      └── tazkiaTraits.js             → static curated content
```

### State Management
| Concern | Solution |
|---|---|
| Current session state (active step, timer) | Zustand store (`ruhaniStore.ts`) |
| Practice history, prompts, traits | TanStack Query (server state) |
| Journal entries | TanStack Query |
| Active session timer | `useState` + `useEffect` in `useSessionTimer.ts` |

### Auth
- All Ruhani features require auth — the journal is personal and spiritual  
- Unauthenticated users see the hub landing with "Sign in to track your journey"  
- Practice prompts/topics are public (no auth needed to read); saving requires auth

---

## 8. Database Models

### `SpiritualPractice` (individual entries)
```javascript
{
  userId: ObjectId,                            // ref: User
  practiceType: enum['tafakkur', 'tadabbur', 'tazkia'],
  
  // Content reference (what the user was working on)
  sourceRef: String,                           // slug (tafakkur), ayahKey (tadabbur), trait-slug (tazkia)
  sourceTitle: String,                         // human-readable label
  
  // The work the user did
  reflectionText: String,                      // free-form entry
  guidedAnswers: [{ prompt: String, answer: String }],  // answers per guided question
  
  // Tazkia-specific
  habitChecks: [{ habit: String, completed: Boolean }],  // daily checklist
  traitRating: Number,                         // 1-5 self-assessment
  
  // Cross-linking
  linkedSessionId: ObjectId,                   // ref: SpiritualSession (if part of guided session)
  linkedPracticeId: ObjectId,                  // ref: another SpiritualPractice (cross-links)
  
  // Privacy
  isPrivate: Boolean,                          // default: true
  sharedToFeed: Boolean,                       // default: false (explicit opt-in to share)
  
  timestamps: { createdAt, updatedAt }
}
```

### `SpiritualSession` (guided session records)
```javascript
{
  userId: ObjectId,
  duration: Number,                            // minutes (10 / 20 / 40 / null for open)
  status: enum['in-progress', 'completed', 'abandoned'],
  
  tafakkurPracticeId: ObjectId,                // ref: SpiritualPractice
  tadabburPracticeId: ObjectId,                // ref: SpiritualPractice
  tazkiaPracticeId: ObjectId,                  // ref: SpiritualPractice
  
  topicSlug: String,                           // the Tafakkur topic of this session
  verseKey: String,                            // the Tadabbur ayah of this session
  traitSlug: String,                           // the Tazkia trait of this session
  
  sessionAction: String,                       // the one action the user committed to
  completedAt: Date,
  
  timestamps: { createdAt, updatedAt }
}
```

---

## 9. API Design

All routes prefixed `/api/v1/ruhani/`

### Content Endpoints (public)
```
GET  /api/v1/ruhani/tafakkur/topics          → list all Tafakkur topics
GET  /api/v1/ruhani/tafakkur/today           → today's rotating Tafakkur topic
GET  /api/v1/ruhani/tafakkur/topic/:slug     → single topic with linked ayahs + prompts

GET  /api/v1/ruhani/tazkia/traits            → list all Tazkia traits
GET  /api/v1/ruhani/tazkia/trait/:slug       → single trait with Hadith + muhasaba prompts

GET  /api/v1/ruhani/session/suggest          → suggest today's guided session content
                                               (topic + ayah + trait based on rotation/history)
```

### Practice Save Endpoints (authenticated)
```
POST /api/v1/ruhani/practice                 → save any practice entry
GET  /api/v1/ruhani/practices                → list user's practices (paginated)
GET  /api/v1/ruhani/practices/:id            → single practice

POST /api/v1/ruhani/session                  → start a guided session
PUT  /api/v1/ruhani/session/:id              → update session step/status
GET  /api/v1/ruhani/sessions                 → list user's sessions

GET  /api/v1/ruhani/journal                  → unified journal (all practice types, sorted by date)
GET  /api/v1/ruhani/stats                    → user's Ruhani stats (streaks, counts per type)
```

---

## 10. Frontend File Structure

```
frontend/src/features/ruhani/
│
├── RuhaniHubPage.tsx              → /ruhani — Landing hub with 3 cards + guided session entry
├── TafakkurPage.tsx               → /ruhani/tafakkur — Browse topics + pick one + reflect
├── TadabburPage.tsx               → /ruhani/tadabbur — Ayah selector + guided reflection
├── TazkiaPage.tsx                 → /ruhani/tazkia — Traits list + daily check + muhasaba
├── GuidedSessionPage.tsx          → /ruhani/session — Step-by-step guided journey
├── RuhaniJournalPage.tsx          → /ruhani/journal — Private timeline of all entries
│
├── useRuhani.ts                   → TanStack Query hooks (topics, traits, practices, sessions)
│
├── stores/
│   └── ruhaniStore.ts             → Zustand store for active session state + timer
│
└── components/
    ├── TafakkurTopicCard.tsx       → Card for a creation sign (icon, verse, prompts)
    ├── TafakkurReflectionPanel.tsx → Guided reflection form for Tafakkur
    ├── TadabburAyahPanel.tsx       → Ayah display + 3-question guided form
    ├── TazkiaTraitCard.tsx         → Character trait card with Hadith + rating slider
    ├── TazkiaDailyChecklist.tsx    → Daily habit checkboxes
    ├── MuhasabaJournal.tsx         → Structured self-accounting form
    ├── SessionStepper.tsx          → Progress indicator (step 1/3, 2/3, 3/3)
    ├── SessionTimer.tsx            → Countdown soft timer (ambient, not aggressive)
    ├── SessionSummaryCard.tsx      → End-of-session summary + share card
    ├── RuhaniEntryCard.tsx         → Journal entry card (reused across types)
    └── CrossLinkBridge.tsx         → Transition prompt between practices
                                     ("This verse is about Tawakkul. Continue to Tazkia?")
```

---

## 11. Backend File Structure

```
backend/
├── routes/
│   └── ruhaniRoute.js
├── controller/
│   └── ruhaniController.js
├── services/
│   └── ruhaniService.js
├── models/
│   ├── spiritualPracticeSchema.js
│   └── spiritualSessionSchema.js
└── data/
    ├── tafakkurTopics.js           → ~30 creation-sign topics (static, curated)
    └── tazkiaTraits.js             → ~20 character traits (static, curated)
```

---

## 12. Curated Static Content Plan

### Tafakkur Topics (30 topics, rotated daily)
Grouped by theme:

**Creation & Cosmos** (10):
- The Sun, The Moon, The Stars, Day & Night, The Sky
- The Earth, Mountains, Seas & Oceans, Clouds, Rain & Water

**Life & Death** (8):
- Seeds & Growth, Trees & Seasons, Animals & Instinct, Insects (Bees)
- Death, Sleep (the minor death), The Human Body, Conception & Birth

**Human Experience** (7):
- Time, Forgetting, Dreams, Gratitude moments, Hunger, Pain, Aging

**Signs in Society** (5):
- Rise and fall of nations, Languages & cultures, The oppressed finding relief, Unanswered du'a, Unexpected mercies

Each topic includes:
- A short contemplation paragraph (2-3 sentences to orient focus)
- 1 primary Quran verse + 2-3 supporting verses
- 3 guided contemplation questions
- Linked Tazkia traits (1-3 traits)
- Linked Tadabbur ayahs (2-4 ayah keys)

---

### Tazkia Traits (20 traits)
With Islamic scholarly source for each:

| # | Trait | Arabic | Primary Hadith/Ayah |
|---|---|---|---|
| 1 | Tawakkul (reliance on Allah) | توكل | "Whoever relies on Allah — He is sufficient for him." (65:3) |
| 2 | Sabr (patience) | صبر | "Indeed, Allah is with the patient." (2:153) |
| 3 | Shukr (gratitude) | شكر | "If you are grateful, I will certainly increase you." (14:7) |
| 4 | Sidq (truthfulness) | صدق | "Be with the truthful." (9:119) |
| 5 | Ikhlas (sincerity) | إخلاص | "They were only commanded to worship Allah, sincere to Him." (98:5) |
| 6 | Tawadu' (humility) | تواضع | "The servants of the Most Merciful walk upon the earth humbly." (25:63) |
| 7 | Rahma (mercy/compassion) | رحمة | "Have mercy on those on earth, and He who is in heaven will have mercy on you." (Tirmidhi) |
| 8 | 'Afw (forgiveness/pardoning) | عفو | "Pardon them and overlook — indeed, Allah loves the doers of good." (5:13) |
| 9 | Qana'a (contentment) | قناعة | "Wealth is not having many possessions; true wealth is being content." (Bukhari) |
| 10 | Hilm (forbearance) | حلم | "The strong man is not the one who overcomes others, but he who controls himself when angry." (Bukhari) |
| 11 | Wafa (loyalty/fulfilling covenants) | وفاء | "Be faithful to your covenants." (17:34) |
| 12 | Hayaa (modesty/shame before Allah) | حياء | "Modesty is part of faith." (Muslim) |
| 13 | Muraqaba (God-consciousness/watchfulness) | مراقبة | "He knows what is concealed and what is more hidden." (20:7) |
| 14 | Zuhd (detachment from dunya) | زهد | "Do not let the worldly life deceive you." (35:5) |
| 15 | Khushoo (humility in worship) | خشوع | "Successful indeed are the believers — those who in their prayer have khushoo." (23:1-2) |
| 16 | Husn al-Dhann (good opinion of Allah and people) | حسن الظن | "Do not spy, and do not backbite one another." (49:12) |
| 17 | Karam (generosity) | كرم | "Who spend in the cause of Allah in ease and in hardship." (3:134) |
| 18 | 'Adl (justice/fairness) | عدل | "Indeed Allah commands justice, benevolence, and giving to relatives." (16:90) |
| 19 | Mujahadah (striving against the nafs) | مجاهدة | "Those who strive in Us — We will surely guide them." (29:69) |
| 20 | Shaja'a (courage) | شجاعة | "Do not grieve — indeed Allah is with us." (9:40) |

Each trait includes:
- A brief explanation (why this trait matters in Islam)
- 1 primary Quran verse + 1 Hadith
- 3 muhasaba questions ("When did I fail at this today?", "What excuse did I give myself?", "What would a person strong in this trait have done?")
- A practical action item template

---

## 13. Risks & Rollout Plan

### Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Islamic content accuracy | High — incorrect Quran refs or weak Hadiths would be harmful | Use only content from Sahih Bukhari, Sahih Muslim, authenticated Quran references (leverage existing `quranService.js`). All tafsir notes reviewed. |
| Feature feeling like "spiritual gamification" | Medium — makes the user perform rather than transform | No public streaks, no leaderboards, no badge rewards. Ruhani stats are private-only. |
| Users not knowing how to reflect | Medium — blank journal = no engagement | Guided questions are not optional in Phase 1 — they scaffold the reflection. Free-form added in Phase 2. |
| Performance | Low — all topic/trait content is static | Serve from Redis cache. Tafakkur topics and Tazkia traits are seeded once and rarely change. |
| Overwhelming onboarding | Medium — too many choices on first visit | Hub landing shows only: [Start Guided Session] prominently + 3 smaller cards. Guided session is the recommended entry path. |
| Session abandonment | Low | No penalty if user doesn't finish. Session saves partial progress. Muhasaba is not a test — there are no right answers. |

### Rollout Phases

**Phase 1 — Foundation (recommended start)**
- Hub landing page (`/ruhani`)
- Standalone Tafakkur (browse + reflect)
- Standalone Tazkia (traits + daily checklist)
- Backend: `SpiritualPractice` model + save/list endpoints
- All Tafakkur topics + Tazkia traits static data (seeded)
- Private journal (`/ruhani/journal`)

**Phase 2 — Tadabbur + Cross-linking**
- Standalone Tadabbur (`/ruhani/tadabbur`) — ayah picker + guided reflection
- Cross-link bridges: Tafakkur → Tadabbur, Tadabbur → Tazkia
- Integrate with existing Quran reader ("Enter Tadabbur mode" button on any ayah)

**Phase 3 — Guided Session**
- `GuidedSessionPage` with time selection + stepper
- `SpiritualSession` model
- Session summary card + optional sharing to feed

**Phase 4 — Intelligence (future)**
- Session suggestion based on user history (rule-based, no AI)
- Weekly Ruhani insights ("You've done Tazkia on Sabr 3 times — here's a related Tafakkur topic")
- Soft reminder system (opt-in, not push notifications)

---

## Note on Relationship to Existing Features

| Existing Feature | Relationship to Ruhani Hub |
|---|---|
| `DailyLearning` (`/daily-learning`) | They serve different purposes. Daily Learning = quick daily Quran habit (complete in 3 min). Ruhani Hub = deep intentional practice (15-40 min). No conflict. |
| `Reflection` model (`reflection.js`) | The Ruhani `SpiritualPractice` is a superset — richer with `guidedAnswers`, `practiceType`, cross-links. Do not modify `reflection.js`. |
| `QuranReaderPage` | Phase 2: A "Tadabbur Mode" button is added to the existing reader that opens `/ruhani/tadabbur?ayah=X` |
| `PostSchema` | If a user opts to share a practice to feed (`sharedToFeed: true`), a post is created via existing `postService.js`. |
| `HadithPage` | Tazkia trait cards reference Hadiths — these are inline static text, not API calls to the Hadith service. |
