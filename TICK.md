---
project: deenverse
schema_version: "1.0"
created: Wed Mar 04 2026 19:24:26 GMT+0530 (India Standard Time)
updated: 2026-03-04T17:13:20.018Z
default_workflow: [backlog, todo, in_progress, review, done]
id_prefix: TASK
next_id: 3
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
status: backlog
priority: high
assigned_to: null
claimed_by: null
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
