---
project: deenverse
schema_version: "1.0"
created: Wed Mar 04 2026 19:24:26 GMT+0530 (India Standard Time)
updated: 2026-03-04T17:39:47.593Z
default_workflow: [backlog, todo, in_progress, review, done]
id_prefix: TASK
next_id: 6
---

## Agents

| Agent | Type | Role | Status | Working On | Last Active | Trust Level |
|-------|------|------|--------|------------|-------------|-------------|
| hasna | human | owner, architect | idle | - | 2026-03-04T13:55:56.279Z | trusted |
| copilot | bot | developer, researcher | idle | - | 2026-03-04T13:58:40.922Z | trusted |
| copilot-2 | bot | developer, reviewer | idle | - | 2026-03-04T13:56:09.000Z | trusted |
| antigravity | bot | developer, researcher | idle | - | 2026-03-04T13:56:15.009Z | trusted |

---

## Tasks

### TASK-001 · Browse by Topic Tier-1 — Create 5 frontend prototypes

```yaml
id: TASK-001
status: review
priority: high
assigned_to: "@antigravity"
claimed_by: "@antigravity"
created_by: "@hasnain-sid"
created_at: 2026-03-04T17:13:09.467Z
updated_at: 2026-03-04T17:13:09.467Z
tags:
  - frontend
  - prototype
  - browse-topic
history:
  - ts: 2026-03-04T17:13:09.467Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-04T22:46:53+05:30
    who: "@antigravity"
    action: claimed
  - ts: 2026-03-04T22:52:00+05:30
    who: "@antigravity"
    action: moved_to_review
```

> Based on docs/browse-by-topic-optimization-research.md Tier 1: Create 5 distinct prototype designs for the Browse by Topic page redesign. Prototypes should explore: (1) Hub-and-Spoke pillar/cluster hierarchy with 4 Pillars > Clusters > Topics, (2) Cross-linked topic graph with relatedTopics section, (3) Unified Ruhani knowledge links (Tafakkur/Tazkia/Tadabbur connected), (4) Trending/popular signals row. Each prototype in frontend/src/features/browse-topic/prototypes/PrototypeN.tsx with a PrototypesViewer.tsx and temp route at /prototypes/browse-topic. Frontend only — all data mocked inline. Use existing design system (shadcn/ui, Tailwind, Lucide, Framer Motion).

### TASK-002 · Browse by Topic — Implement chosen frontend design

```yaml
id: TASK-002
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-04T17:13:20.018Z
updated_at: 2026-03-04T17:13:20.018Z
tags:
  - frontend
  - implementation
  - browse-topic
depends_on:
  - TASK-001
history:
  - ts: 2026-03-04T17:13:20.018Z
    who: "@hasnain-sid"
    action: created
```

> After user finalizes their preferred prototype from TASK-001, implement the chosen design as the real Browse by Topic page. Steps: (1) Promote selected prototype to frontend/src/features/browse-topic/ as the real page components, (2) Add pillar/cluster/relatedTopics fields to topic data types, (3) Wire up TanStack Query hooks for topic fetching, (4) Implement hub-and-spoke navigation, related topics section, trending row, and unified Ruhani knowledge links, (5) Delete the prototypes/ folder and remove the temp /prototypes/browse-topic route. All data should call real API endpoints (mocked with MSW or empty states until backend is ready).

### TASK-003 · Browse by Topic — Implement backend for Tier-1 features

```yaml
id: TASK-003
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-04T17:13:30.864Z
updated_at: 2026-03-04T17:13:30.864Z
tags:
  - backend
  - implementation
  - browse-topic
depends_on:
  - TASK-002
history:
  - ts: 2026-03-04T17:13:30.864Z
    who: "@hasnain-sid"
    action: created
```

> Build backend support for the frontend design from TASK-002. Includes: (1) Add pillar, cluster, relatedTopics fields to quranTopics.js data and any relevant Mongoose schemas, (2) Create GET /api/v1/topics endpoint returning topics with pillar/cluster hierarchy and relatedTopics populated, (3) Add topicView analytics event to analyticsEventSchema.js and POST /api/v1/analytics/topic-view endpoint, (4) Create GET /api/v1/topics/trending endpoint that returns top topics by view count + reflection count for the past 7 days, (5) Build cross-link resolution: connect Quran Topics to Tafakkur/Tazkia/Tadabbur data via shared slugs and tags. Follow route->controller->service->model pattern. ESM only.

### TASK-004 · Doc Audit & Update Campaign

```yaml
id: TASK-004
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-04T17:39:35.046Z
updated_at: 2026-03-04T17:39:35.046Z
tags:
  - docs
  - maintenance
  - all-agents
history:
  - ts: 2026-03-04T17:39:35.046Z
    who: "@hasnain-sid"
    action: created
```

> Systematically audit every doc in /docs/, add current implementation status, mark resolved findings, note remaining gaps, and ensure each doc accurately reflects the real state of DeenVerse as of March 2026. One child task per doc.

### TASK-005 · Update: browse-by-topic-optimization-research.md

```yaml
id: TASK-005
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-04T17:39:47.593Z
updated_at: 2026-03-04T17:39:47.593Z
tags:
  - docs
  - browse-topic
  - frontend
history:
  - ts: 2026-03-04T17:39:47.593Z
    who: "@hasnain-sid"
    action: created
```

> This research doc covers Tier-1/2/3 browse-by-topic enhancements. Current state: feature is implemented as quran-topics (QuranTopicsPage, TopicDetailPage, MoodDetailPage, SpacedRepetitionCard, SearchBar). Tier-1 frontend prototyping is in Review (TASK-001). Update doc to: mark implemented items (moods, category pills, topic cards, community reflections, spaced rep), note what Tier-1 items remain (personalization, trending signals), update status header to reflect prototype phase.
