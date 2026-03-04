# Browse by Topic — Optimization & AI Enhancement Research

> **Date**: March 2026
> **Scope**: UX organization improvements + AI/ML models to maximize user experience
> **Status**: ✅ **Tier-1 Complete + UI Redesign (Prototype 4)** — Feature live at `/quran-topics`. Prototype phase (TASK-001/002/003) done. UI redesigned (TASK-022) with Netflix-style layout. Code-reviewed & tested (TASK-023). Tier-2/3 enhancements are future work.

---

## ✅ Implementation Progress (Updated March 2026)

The feature is **implemented as `quran-topics`** (`/quran-topics` route) — not as a separate "browse-topic" feature. The `quran-topics` feature folder covers the scope described in this document.

### Tier-1 — Fully Implemented
| Item from this doc | Status | Implementation location |
|---|---|---|
| 28 topics across 8 categories | ✅ Done | `backend/data/quranTopics.js` |
| 10 mood entries with `relatedTopics[]` | ✅ Done | `backend/data/quranTopics.js` |
| ~300 curated ayah references (AlQuran Cloud, 7-day cache) | ✅ Done | `backend/controller/quranTopicController.js` |
| 12 lesson objects per topic | ✅ Done | `backend/data/quranTopics.js` |
| Netflix-style hero + horizontal cluster rows | ✅ Done | `frontend/src/features/quran-topics/QuranTopicsPage.tsx` |
| Mood selector (horizontal scrollable chips) | ✅ Done | `frontend/src/features/quran-topics/QuranTopicsPage.tsx` |
| MoodDetailPage | ✅ Done | `frontend/src/features/quran-topics/MoodDetailPage.tsx` |
| TopicDetailPage with Tabs (Reading / Reflections) | ✅ Done | `frontend/src/features/quran-topics/TopicDetailPage.tsx` |
| Community reflections (paginated, likes, scholar-verified) | ✅ Done | `frontend/src/features/quran-topics/components/CommunityReflections.tsx` |
| Spaced repetition (SM-2 style) | ✅ Done | `frontend/src/features/quran-topics/components/SpacedRepetitionCard.tsx` + `backend/services/learningProgressService.js` |
| Fuse.js client-side fuzzy search | ✅ Done | `frontend/src/features/quran-topics/useSmartSearch.ts` |
| Floating search bar + SearchResults | ✅ Done | `frontend/src/features/quran-topics/QuranTopicsPage.tsx`, `components/SearchResults.tsx` |
| Hub-and-spoke topic hierarchy (pillar/cluster fields) | ✅ Done | `backend/data/quranTopics.js`, `backend/services/topicService.js`, `types.ts` |
| Trending topics endpoint | ✅ Done | `GET /api/v1/quran-topics/trending`, `useTrendingTopics()` hook |
| Cross-links (Tafakkur/Tazkia/Tadabbur) | ✅ Done | `TopicDetailPage.tsx`, `backend/services/topicService.js` |
| View analytics tracking | ✅ Done | `POST /api/v1/analytics/topic-view` |
| Typed trending response | ✅ Done | `TrendingTopicsResponse` in `types.ts`, `useTrendingTopics()` properly typed |

### UI Redesign History
1. **Original (TASK-002)**: Prototype 5 — standard layout with category pills, 2-col grid, and pillar/flat view toggle.
2. **Redesign (TASK-022)**: Prototype 4 — Netflix-style immersive layout:
   - Full-viewport hero section with #1 trending topic, CTA buttons, gradient blobs
   - Floating translucent search bar
   - Mood selector as horizontal scrollable colored chips
   - Topics grouped by cluster in horizontal scrollable card rows (Netflix-style)
   - Each card has a gradient background, oversized icon watermark, and hover animation

### Current UX Flow (Post-Redesign)

```
┌──────────────────────────────────────────────────────┐
│  HERO SECTION (55-65vh)                              │
│  #1 Trending Today badge                             │
│  "Tawakkul" (huge title)                             │
│  Description + [Explore Wisdom] [Save to List]       │
└──────────────────────────────────────────────────────┘
         ↓
  🔍 Floating search bar (inline + server search)
         ↓
  😰 😢 😠 🤲 🤷 😟  Mood chips (horizontal scroll)
         ↓
  ── Emotional Healing ──────────────
  [Anxiety] [Grief] [Loneliness] [Hope]  → horizontal scroll
         ↓
  ── Inner Character ────────────────
  [Sabr] [Shukr] [Humility] [Truthfulness]  → horizontal scroll
         ↓
  ── Core Beliefs ───────────────────
  [Tawheed] [Hereafter] [Tawakkul]  → horizontal scroll
         ↓  ...more cluster rows...

  Topic Detail → Tabs (Reading | Community)
    → Spaced Repetition card
    → Lessons & Understanding
    → Ayahs (Arabic + translation + tafsir + audio)
    → Deeper Dive: Related Topics, Tafakkur, Tazkia cross-links
```

### Tier-2 & Tier-3 (Future — No work started)
- Personalization engine, semantic search, dynamic mood mapping
- Knowledge graph, ML-based recommendation

---

## 2. Recommended Improvements — Three Tiers

### Tier 1: Better Organization (No AI, Immediate Impact)

#### 2.1 Hub-and-Spoke Topic Hierarchy

**What**: Reorganize the flat 8-category structure into a 3-level hierarchy: **Pillars → Clusters → Topics**.

```
Pillar: "Heart & Soul"
  ├── Cluster: "Emotional Healing"
  │     ├── Anxiety & Worry
  │     ├── Grief & Sadness
  │     ├── Loneliness
  │     └── Hope & Optimism
  ├── Cluster: "Inner Character"
  │     ├── Patience (Sabr)
  │     ├── Gratitude (Shukr)
  │     ├── Humility
  │     └── Truthfulness

Pillar: "Faith & Worship"
  ├── Cluster: "Core Beliefs"
  │     ├── Tawheed
  │     ├── Hereafter
  │     └── Tawakkul
  ├── Cluster: "Acts of Worship"
  │     ├── Salah
  │     ├── Fasting
  │     ├── Charity & Zakat
  │     └── Dua & Supplication

Pillar: "Life & Society"
  ├── Cluster: "Relationships"
  │     ├── Family & Marriage
  │     ├── Honouring Parents
  │     ├── Community & Brotherhood
  │     └── Justice & Equity
  ├── Cluster: "Wealth & Ethics"
  │     ├── Riba/Interest
  │     ├── Honest Trade
  │     └── Wealth & Provision

Pillar: "Guidance & Growth"
  ├── Cluster: "Life Direction"
  │     ├── Purpose of Life
  │     ├── Knowledge & Learning
  │     ├── Repentance (Tawbah)
  │     └── Trials & Tests
  ├── Cluster: "Boundaries"
  │     ├── Backbiting & Gossip
  │     ├── Intoxicants
  │     └── Fraud & Deception
```

**Why**: Research on information architecture ([Slickplan 2025](https://slickplan.com/blog/information-architecture-trends), [TopicalHQ Hub-and-Spoke](https://topicalhq.com/guides/topical-authority/hub-spoke-model/navigation-design-hub-and-spoke-ux)) shows that hierarchical hub-and-spoke structures reduce cognitive load by 30%+ compared to flat lists. Users can progressively drill down instead of scanning 28 items at once.

**Implementation**:
- Add a `pillar` and `cluster` field to each topic in `quranTopics.js`
- Render Pillar cards on the main page → click to expand clusters → click cluster to see topics
- Keep the "All" flat view as a secondary tab for power users

#### 2.2 Cross-Linked Topic Graph (Visual Connections)

**What**: Add a `relatedTopics: string[]` field to each topic, creating explicit bidirectional links between topics.

Example:
```
"patience-sabr" → related: ["trials-tests", "gratitude-shukr", "anger-management", "hope-optimism"]
"tawakkul"      → related: ["anxiety-worry", "dua-supplication", "purpose-of-life"]
```

**Frontend**: Show a "Related Topics" section at the bottom of `TopicDetailPage` after the ayahs. This creates natural learning pathways.

**Bonus**: Build a `relatedTopics` map automatically by analyzing overlapping `datasetTags` and `ayahRefs` across topics.

#### 2.3 Unified Ruhani Knowledge Links

**What**: Connect the currently siloed data:

| From | To | Link |
|---|---|---|
| Quran Topic | Tafakkur Topics | via shared Quran refs |
| Quran Topic | Tazkia Traits | via `datasetTags` ↔ `linkedTraitSlug` |
| Tafakkur Topic | Tadabbur Ayahs | already linked via `linkedTafakkurSlugs` |
| Mood | Learning Progress | show "topics you've reviewed that match this mood" |

**Frontend**: Add a "Deeper Dive" section on each topic detail page:
- "Contemplate This" — linked Tafakkur cards
- "Purify This Trait" — linked Tazkia trait card
- "Community Insights" — hottest reflections

#### 2.4 Topic Popularity & Trending Signals

**What**: Track topic views, time-on-topic, reflection count, and bookmark count. Use these to:
- Show a "Trending This Week" row on the browse page
- Show "Most Reflected On" badge
- Sort topics within a category by engagement (optional)

**Backend**: Add a lightweight analytics event (`topicView`) in the existing `analyticsEventSchema.js`.

---

### Tier 2: AI-Powered Personalization (Medium Effort, High Impact)

#### 2.5 Personalized Topic Recommendations

**What**: Build a recommendation engine using the rich data you already have.

**Approach — Hybrid Collaborative + Content-Based Filtering**:

| Signal | Type | How to Use |
|---|---|---|
| Topics viewed | Implicit | Content-based: recommend topics with similar `datasetTags` and `category` |
| Mood selections | Explicit | "You often choose 😰 Anxious → here are new topics for you" |
| Spaced repetition progress | Engagement | "You're mastering Sabr — explore Shukr next (related)" |
| Reflections written | Deep engagement | Topics where user invested thought → recommend adjacent topics |
| Community patterns | Collaborative | "Users who explored Tawakkul also loved Dua & Supplication" |

**Implementation Strategy** (no external AI API needed):

```
Step 1: Build a user-topic interaction matrix (views, reflections, reviews)
Step 2: Compute topic similarity using cosine similarity on datasetTags vectors
Step 3: For each user, score unseen topics = weighted sum of
        (similarity to viewed topics × engagement weight)
Step 4: Return top-N recommendations
```

This runs entirely in your Node.js backend using simple linear algebra (no ML framework needed). Use Redis to cache per-user recommendation vectors.

**Frontend**: Add a "Recommended for You" row at the top of the browse page (above moods) for logged-in users.

#### 2.6 Semantic Search with Embeddings

**What**: Replace keyword-only search with semantic search that understands intent.

**Why**: Research ([Alqarni 2024](https://iajit.org/upload/files/Embedding-Search-for-Quranic-Texts-based-on-Large-Language-Models.pdf)) demonstrates that LLM embeddings outperform keyword search for Quranic texts by 40%+ on retrieval relevance. User queries like "how do I overcome sadness" should match Grief, Sabr, Hope — not just the word "sadness."

**Approach**:
1. Pre-compute embeddings for all 28 topics (name + description + lesson text + ayah translations) using OpenAI `text-embedding-3-small` (~$0.002 for all topics)
2. Store embeddings as a static JSON file (28 × 1536-dim vectors = ~170KB)
3. At query time, embed the user's search query and compute cosine similarity against all topic vectors
4. Return top matches ranked by semantic relevance

**Alternative (no OpenAI dependency)**: Use `@xenova/transformers` (runs in Node.js, no API call) with `all-MiniLM-L6-v2` model (~80MB) for local embedding generation.

**Frontend**: Enhance `SearchBar` to show "Smart Results" (semantic matches) alongside keyword results.

#### 2.7 Mood-Based Adaptive Recommendations

**What**: Use community data to improve mood → topic mapping dynamically.

**Current**: `MOODS[].relatedTopics` is hardcoded.
**Proposed**: Score each topic for each mood based on:
- Community reflection sentiment from that mood → topic pairing
- Time spent on topics after selecting a mood
- "This helped me" upvotes on reflections

Periodically recompute (daily cron) and override the static mapping with community-validated rankings.

---

### Tier 3: Advanced AI Models (High Effort, Maximum Impact)

#### 2.8 Quranic Knowledge Graph + RAG

**What**: Build a mini knowledge graph connecting Quran data entities:

```
Nodes: Ayah, Topic, Mood, TafakkurTopic, TazkiaTrait, TadabburAyah, Surah, Scholar
Edges: mentions, relates_to, teaches, cited_in, linked_trait, contemplates
```

**Why**: Research on Islamic Knowledge Graphs ([Basair - NoorBayan](https://github.com/noorbayan/basair), [IslamXplorer](https://github.com/developerahmadhassan/islamxplorer)) shows that graph-structured Islamic data enables:
- Multi-hop queries: "Show me ayahs about patience that are also linked to the trait of gratitude"
- Learning paths: Auto-generate sequences of topics for progressive spiritual growth
- Context-aware recommendations: "You've been contemplating The Sun — here are related ayahs about divine provision"

**Implementation Options**:

| Option | Pros | Cons |
|---|---|---|
| **Neo4j Aura Free** | Native graph DB, Cypher queries, free tier | New infrastructure, learning curve |
| **MongoDB $graphLookup** | Already using MongoDB | Limited graph traversal depth |
| **In-memory graph (adjacency list)** | Zero new infra, fast, simple | Limited to static data size |

**Recommended for DeenVerse**: Start with an **in-memory adjacency list** built from existing cross-links. You already have:
- `topic.datasetTags` → shared tags = edges
- `topic.ayahRefs` → shared ayahs = edges
- `tafakkur.linkedTazkiaTraits` → cross-entity edges
- `tadabbur.linkedTafakkurSlugs` → cross-entity edges
- `mood.relatedTopics` → cross-entity edges

Build a `buildKnowledgeGraph()` function at server start that constructs the adjacency list. Use it for recommendations and "related content" queries with zero external dependency.

#### 2.9 AI-Generated Topic Insights & Summaries

**What**: Use an LLM to generate:
1. **Dynamic topic summaries** based on the actual ayahs and their tafsir
2. **Personalized lesson plans** — "Based on your spaced repetition data, here's a 7-day journey through Patience"
3. **Community insight reports** — "This week, the community reflected most on Tawakkul. Here's a synthesis of the top reflections"

**Architecture**:
```
User opens Topic → backend checks if cached AI summary exists
  → If not: send ayah translations + tafsir to LLM → generate summary → cache for 7 days
  → Serve cached summary in "Key Insights" card above ayahs
```

**Safety**: All LLM-generated content must be clearly labeled as "AI-assisted summary" and should reference specific ayahs/scholars. Use system prompts restricting output to be purely based on provided Quranic text (no fabrication). Flag for scholar review.

**Cost**: Using GPT-4o-mini, generating summaries for all 28 topics = ~$0.05. Re-generate weekly or on-demand.

#### 2.10 Smart Learning Journeys

**What**: Use the knowledge graph + user progress to generate **personalized multi-topic learning paths**.

Example:
```
Journey: "Healing the Heart" (auto-generated for user in "Sad" mood)
  Week 1: Grief & Sadness → Patience (Sabr)
  Week 2: Hope & Optimism → Dua & Supplication
  Week 3: Forgiveness → Gratitude (Shukr)
  Week 4: Purpose of Life → Trust in Allah (Tawakkul)
```

Each step builds on the previous, with spaced repetition reminders for reviewed topics.

**Implementation**:
1. Define journey templates (curated by scholars or auto-generated from graph traversal)
2. Assign users to a journey based on their mood/interest selection
3. Track progress across the journey (not just individual topics)
4. Send push notifications for next steps

---

## 3. Data Assets Inventory (What You Can Leverage)

You have significantly more data than most Islamic apps. Here's how each asset maps to AI potential:

| Data Asset | Current Size | AI/ML Potential |
|---|---|---|
| **28 topics** with descriptions, tags, categories | 28 rich objects | Topic embedding vectors, clustering, graph nodes |
| **~300 curated ayah refs** | Surah:ayah pairs | Ayah embeddings, cross-topic similarity, semantic search |
| **12 topic lessons** with explanations + actions | 12 detailed objects | Few-shot examples for LLM to generate lessons for remaining 16 topics |
| **10 moods** with emotion mapping | 10 objects | Mood classification model training data, sentiment bridges |
| **10+ tafakkur topics** with guided questions | 10 rich objects | Graph nodes, contemplation recommendation |
| **Tazkia traits** with prompts + hadith | 8+ objects | Spiritual growth tracking, trait recommendation |
| **Tadabbur ayahs** with guided questions + cross-links | 10+ objects | Knowledge graph edges, deep connections |
| **User learning progress** (SM-2 data) | Per-user per-topic | Engagement signals, review-based recommendations |
| **Topic reflections** with likes + scholar verification | Community content | Collaborative filtering, sentiment analysis, trending |
| **Quran search results** (AlQuran Cloud) | Real-time | Keyword→semantic search upgrade |

**Total unique information density**: ~500+ interconnected data points — more than enough for a meaningful recommendation system without any external dataset.

---

## 4. Implementation Roadmap

### Phase 1 — Organization Overhaul (1-2 sprints)
- [ ] Add `pillar`, `cluster`, `relatedTopics` fields to topic data
- [ ] Build hub-and-spoke UI on browse page
- [ ] Add "Related Topics" section to `TopicDetailPage`
- [ ] Unify cross-links between Quran Topics ↔ Tafakkur ↔ Tazkia
- [ ] Add topic view tracking (`analyticsEventSchema`)
- [ ] Add "Trending This Week" row

### Phase 2 — Smart Personalization (2-3 sprints)
- [ ] Build user-topic interaction matrix
- [ ] Implement content-based recommendation engine (cosine similarity on tags)
- [ ] Add "Recommended for You" row on browse page
- [ ] Implement mood-adaptive mapping (community-driven)
- [ ] Build in-memory knowledge graph from cross-links

### Phase 3 — AI Enhancement (3-4 sprints)
- [ ] Generate topic embeddings (OpenAI or local Transformers)
- [ ] Implement semantic search alongside keyword search
- [ ] Auto-generate lessons for the 16 topics missing them (LLM + scholar review)
- [ ] Build Smart Learning Journeys with multi-topic paths
- [ ] Add AI-generated topic insight summaries (labeled, cached, reviewed)

---

## 5. Recommendation

**Start with Tier 1** (hub-and-spoke hierarchy + cross-links + trending) — this is purely data restructuring and UI, no AI cost, and immediately improves discoverability.

**Then Tier 2** (personalized recommendations + semantic search) — the content-based recommendation engine needs no external API and runs on existing data. Semantic search can start with the free `@xenova/transformers` library.

**Tier 3 when ready** — knowledge graph and LLM summaries add the "wow factor" but require scholar oversight and careful content labeling for Islamic content accuracy.

The key insight: **you already have incredibly rich, structured, cross-linked Islamic content data**. Most apps have flat text. You have categories, tags, cross-links, guided questions, traits, moods, and community reflections. The optimization is about *connecting* what you already have, not necessarily adding new data.

---

## 6. Sources

| Source | Type | Key Insight |
|---|---|---|
| [Slickplan — IA Trends 2025](https://slickplan.com/blog/information-architecture-trends) | UX Research | AI-powered IA, content-first architecture, semantic web |
| [TopicalHQ — Hub & Spoke UX](https://topicalhq.com/guides/topical-authority/hub-spoke-model/navigation-design-hub-and-spoke-ux) | UX Pattern | Hub-and-spoke navigation reduces cognitive load for deep content |
| [Mocono — Taxonomy for Content Discovery](https://mocono.io/how-to-create-a-taxonomy-system-that-improves-content-discovery/) | Taxonomy Design | Hierarchical taxonomies improve content discoverability and engagement |
| [Alqarni 2024 — Embedding Search for Quranic Texts](https://iajit.org/upload/files/Embedding-Search-for-Quranic-Texts-based-on-Large-Language-Models.pdf) | Academic Paper | LLM embeddings outperform keyword search for Quran by 40%+ |
| [NoorBayan/Basair — Quranic Concept Ontology](https://github.com/noorbayan/basair) | OSS Project | AI-based Quranic concept ontology linking concepts to trusted sources |
| [Quranic Verse Scout (BERT + RAG)](https://github.com/zubayr-ahmad/quranic-verse-scout) | OSS Project | Semantic search for Quran using BERT and RAG |
| [Qurani-AI (Cohere + Qdrant)](https://github.com/zifo-10/qurani-ai) | OSS Project | FastAPI + MongoDB + Cohere embeddings + Qdrant vector search for Quran |
| [QuranGPT (GPT-4 Embeddings)](https://github.com/hazemabdelkawy/QuranGPT) | OSS Project | GPT-4 embeddings for Quran verses with 3D t-SNE visualization |
| [Tarteel QUL — Quranic Universal Library](https://tarteel.ai/blog/qul-launch/) | Product | Centralized hub for digital Quranic resources for developers |
| [Usul.ai — Islamic Research Tool](https://usul.ai/) | Product | AI-powered search across 15,000+ Islamic texts |
| [Knowledge Base IA Guide](https://knowledge-base.software/guides/building-a-knowledge-base-information-architecture/) | IA Design | Hierarchies + hub-and-spoke + topic clusters for knowledge bases |
| [Reintech — Recommendation System with LLM Embeddings](https://reintech.io/blog/build-recommendation-system-llm-embeddings) | Engineering Guide | Building recommendation systems using LLM embeddings |
| [Topic-Aware KG with LLMs for Recommender Systems](https://arxiv.org/pdf/2412.20163) | Academic Paper | LLM-extracted topics for knowledge graph-based recommendations |
