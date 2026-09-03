# Quran–Seerah Linking: Review & Integration Plan

**Written:** 2026-09-03 against `main` @ `15fdf32`. Every file/line reference below was read from the
repo for this document, not taken from `STATUS.md`. Where the research report, the proposal, and the
code disagree, the disagreement is called out.

Legend used throughout: **EXISTS** (already in the repo, reuse as-is) · **EXTENDS** (modifies existing
code) · **NEW** (greenfield).

---

## Verdicts up front

1. **A → B → C in sequence is the wrong commitment.** Build A. Treat B as a curation *tool*, not a
   product surface. Do not plan C at all until A has survived external scholarly review — the
   research's own numbers (hadith attribution 59–63% correct in the best RAG systems) make C a
   liability for this platform, and the platform has no institutional review board to absorb it.
2. **"Approved event goes live" is the wrong unit and the wrong gate.** The unit is the *edge*. The
   gate for *visibility* must be machine-checkable provenance completeness; the gate for the
   *authority badge* is human review. Coupling visibility to review guarantees nothing ships, because
   the reviewer population today is zero.
3. **Do not reuse the `scholar` role for authenticity rulings.** It exists to sell courses
   (`backend/services/scholarService.js:19-55`), its credentials are self-reported and never
   verified, it has no domain scoping, and it cannot be revoked (no revocation code exists anywhere —
   `grep revoke backend/` finds only an unused enum value at `backend/models/auditLogSchema.js:23`).
   A separate `reviewerProfile` with per-domain grants is required.
4. **Disagreement must be a first-class record attached to a named reviewer**, not a boolean on the
   edge. A single-approver workflow structurally resolves what the tradition leaves open.
5. **The feature belongs in this codebase as a bounded module, not a separate product** — but only
   *after* three specific security fixes that would otherwise let a forged cross-site POST write an
   "approved" edge.
6. **Mongo, typed edge collection. Not Neo4j. Not Postgres.** A curated graph of low thousands of edges
   with 1–2 hop reads does not justify a second datastore for a solo operator.
7. **Nothing in v1 that redistributes text you do not have rights to ship on a platform that takes
   payments.** That rules out the most convenient asbab source (spa5k's scraped Guezzou translation)
   and OpenITI text, and shapes the whole data model: **store citations and your own summaries; fetch
   or link scripture; never republish copyrighted translation.**

---

## Task 1 — Adversarial review of the proposed approach

### 1.1 The A → B → C sequencing

**The plan as stated commits to C.** Sequencing A, B, C "in sequence" is a roadmap with C as the
destination; every schema and UX decision in A will be bent toward feeding a generation layer. That is
the mistake. Reasons, in order of weight:

- **The research's own risk finding kills C for this operator.** IslamicEval 2025 puts hadith
  attribution correctness at 59–63% for the *best* RAG systems. On this platform a wrong hadith
  attribution is displayed under a Scholar badge next to Stripe checkout. There is no editorial board,
  no correction log, no versioned archive (see 1.5). The research says C requires "institutional
  scholarly backing" — the repo has one admin account seeded by `backend/scripts/seedAdmin.js`.
- **B is not a product tier; it is a curator's tool.** "Find ayat thematically near this event" is
  useful to *the person building edges*, and dangerous as a public surface because it produces
  plausible-looking links with no source. Reframe B as an internal suggestion queue that emits
  `draft` edges for a human to source or discard. Ship it to reviewers, never to readers.
- **The repo already has the pattern that C would become.** `frontend/src/features/learn-quran/LearnQuranHub.tsx:43-50`
  advertises an "Ask-the-Quran Assistant" as `Coming Soon` with `href: '#'`. Planning C now adds a
  second promise to the roadmap with no path to delivery.

**Actual phasing and the evidence that gates each transition:**

| Phase | What ships | Gate to leave the phase |
|---|---|---|
| **A0 — Prerequisites** | Three security fixes (§2.2) | Tests green; CSRF cookie path removed from all routes except `/user/refresh` |
| **A1 — Badr graph, read-only** | Schemas, seed, public read API, event/ayah pages. Every edge labelled *Unreviewed* | A qualified external reviewer reads every Badr edge and signs off on the **model** (link types, labels, disagreement display) — individual edge corrections allowed, model changes not |
| **A2 — Review machinery** | Reviewer role, queue UI, positions, audit trail | At least two credentialed reviewers exist in the DB with distinct domain grants, and ≥1 real disagreement has been recorded and rendered |
| **B (internal)** | Hybrid retrieval that proposes `draft` edges to reviewers | Measured: what fraction of proposals do reviewers accept? Below ~30% means the tool wastes reviewer time — kill it |
| **Expansion** | Second Seerah segment | A1 gate passed for Badr *and* reviewers cleared the backlog A2 created |
| **C** | — | Not planned. Revisit only with a named review board and a published correction policy |

### 1.2 Approval granularity — event vs. edge

**The edge is the unit. The event is the wrong unit, and it breaks in three specific ways.**

An event node is a container: one Badr event may carry 6 ayah links, 4 hadith links and 3 tafsir
links with wildly different evidentiary status. Under event-level approval:

1. **The weakest link inherits the strongest badge.** An event approved because its al-Anfal
   anchoring is unambiguous also publishes the *mursal* Ibn Ishaq report attached to it, under the same
   green check. That is exactly the "weak maghazi with the same visual authority as sahih hadith"
   failure the research names.
2. **One challenged link takes the whole event down.** If a reviewer later disputes one hadith
   grading, event-level state forces you to either unpublish everything (users lose the ayah links
   that were never in question) or leave the disputed link live (the review is theatre).
3. **Reviewer scope does not fit.** A hadith-grading reviewer is not qualified to sign off on a
   tafsir attribution, and vice versa (§1.3). Event-level approval requires one person to be
   competent in everything the event touches.

Edge-level approval has costs — more review actions, more UI — and one real design consequence:
**an event with zero published edges must still be visible** (as a node with a date and a summary)
or the graph has holes. Event nodes therefore carry their *own* light review (is this a real event,
is the summary defensible), and edges carry the heavy one.

There is a precedent in the repo for the wrong granularity: `backend/models/signSchema.js:113-117`
gates a whole `Sign` on one `isPublished` boolean even though each sign carries a `reference`, a
`sourceUrl` and a `hadithGrade` that could each be wrong independently. Don't copy it.

### 1.3 Reviewer authority — reusing `scholar`

**Unsafe. Do not.** Read what the role actually is:

- **Granted for a different purpose.** `backend/services/scholarService.js:19-55` (`applyForScholar`)
  takes `credentials`, `specialties`, `bio`, `teachingLanguages`, `videoIntroUrl`. Approval at
  `:152-207` flips `user.role = "scholar"` and sets `verifiedAt/verifiedBy`. The contract that
  motivates it is explicit: *"scholars create courses, teach live, answer Q&A, earn salary"*
  (`.agents/contracts/scholar-role-system.md:11`). It is a **seller** role.
- **Credentials are self-reported and never checked.** `scholarCredentialSchema`
  (`packages/shared/src/schemas/scholar.ts:25-30`) is `{title, institution, year, documentUrl?}`. The
  admin review at `scholarService.js:162-173` records no verification step — it is a yes/no on
  whatever was typed.
- **No domain scoping in authorization.** `specialties` exists (`scholar.ts:5-14` — includes
  `seerah`, `hadith`, `tafseer`) but `isScholar` (`backend/middlewares/admin.js:39-59`) checks only
  `role === "scholar" || role === "admin"`. A tajweed specialist passes every scholar-gated route.
- **Cannot be revoked.** There is no `revokeScholar` in `scholarService.js`, no route in
  `scholarRoute.js`, and `AuditLog`'s `revoke_verification` enum value (`auditLogSchema.js:23`) has
  no writer. Once granted, forever.
- **Conflict of interest is built in.** A scholar who sells a Seerah course
  (`courseSchema.js:35` has `category: 'seerah'`) reviewing Seerah links on the same platform is the
  obvious incentive problem, and nothing prevents it.

**What a separate reviewer role requires:**

1. **A grant, not a role.** `userSchema.role` is an exclusive enum
   (`backend/models/userSchema.js:49-53`: `user|scholar|moderator|admin`). A reviewer may also be a
   scholar; a scholar is not automatically a reviewer. Model it as an embedded
   `reviewerProfile` on `User` — parallel to how `scholarProfile` is embedded at `userSchema.js:54-77`
   — never as a fifth enum value.
2. **Per-domain grants.** `reviewerProfile.domains: ['hadith-grading' | 'asbab-al-nuzul' | 'seerah-chronology' | 'tafsir-attribution']`.
   Middleware `isReviewer(domain)` checks the grant for the *edge type being reviewed*
   (§3.3). This is the piece `isScholar` cannot provide.
3. **Admin-granted only, with a recorded basis.** `grantedBy`, `grantedAt`, `basis` (free text: what
   credential was actually inspected). No self-application flow in v1.
4. **Revocable, with consequences.** `revokedAt` + `revokedReason`. Revocation must be *visible on the
   decisions that reviewer made* (§1.5) — not silently remove them.
5. **Scope limits.** Reviewers cannot create or edit edges they review; the author of a `draft`
   cannot be a reviewer of it. Enforce in service, not UI.

The dead `moderator` role (in the enum, referenced by zero middleware — `grep moderator backend/`
finds only the enum and its copy in `seedAdmin.js:29`) is a warning: roles added to the enum without
authorization code become decorative.

### 1.4 Disagreement — the boolean-approval problem

The research is right that the model is *display* disagreement, not resolve it. A single-approver
boolean cannot represent "al-Wahidi reports X, al-Suyuti reports Y, both transmitted, neither
preferred." Either the approver picks (resolving what the tradition doesn't), or the edge sits
unapproved forever.

**Correct structure — position attached to reviewer, separate collection:**

- `KnowledgeLink` (the edge) carries the *claim*: "ayah 8:9 was revealed concerning the du'a at
  Badr, per al-Wahidi."
- `ReviewDecision` is one document per reviewer per edge version:
  `{ link, linkVersion, reviewer, domain, position: 'accept' | 'accept-with-note' | 'object', note, citedSources[] }`.
- The edge's `review.state` is **derived** from its decisions, never set directly: published when
  ≥1 `accept` in the governing domain and zero unresolved `object`; `contested` when it has both.
- **`contested` is a publishable state.** It renders with a "Scholars differ" panel listing each
  reviewer's position and note, by name. That panel *is* the feature the research asks for.

This is not multi-reviewer *consensus* — that resolves disagreement by vote. It is multi-reviewer
*record*. Two reviewers who legitimately differ both stay on the page.

**Where the existing code offers nothing to reuse:** `reviewCourse`
(`backend/services/courseService.js:734-790`) is a single admin writing
`reviewedBy/reviewedAt/rejectionReason` onto the document itself. Second reviewer overwrites the
first. That is fine for "is this course sellable" and unusable here.

### 1.5 Revocation, versioning and drift

Approval must not be permanent, and the reasons are concrete in this repo:

- **The approved text is not stored.** Ayah text comes from `api.alquran.cloud` at request time
  (`backend/services/quranService.js:6-10`, editions from env, `fetchJson` at `:38-44` with no
  timeout). A reviewer approves a link to *text they saw*; if the edition changes upstream, the
  approval now attaches to text nobody reviewed. **Approval must pin a content snapshot hash** of
  every quoted passage at decision time, and the UI must show "reviewed against edition X".
- **Reviewer de-credentialing.** Decisions by a revoked reviewer must not vanish (history) and must
  not keep conferring authority (badge). Mark the decision `authorityWithdrawn: true`; the edge's
  derived state recomputes; if it drops below the publish threshold it becomes `unreviewed` again,
  *not* hidden.
- **Source correction.** A hadith re-graded by Darussalam, a corrected asbab attribution: this is a
  new **edge version**, not an in-place edit. `KnowledgeLink.version` increments; `supersedes` points
  to the prior version; prior decisions are bound to `linkVersion` and do not carry forward.
  Re-review is triggered automatically.
- **Challenge from outside.** A reader "report" on an edge creates a `ReviewDecision` with
  `position: 'challenge'` from a non-reviewer — it never affects derived state but appears in the
  reviewer queue. Reuse the *shape* of `reportSchema.js`, not the collection.
- **Expiry.** Do not add time-based expiry. Nothing in the sources changes on a calendar; re-review
  should be event-driven (new version, reviewer revoked, challenge filed).

**Audit trail — the analogy to `auditLogSchema` breaks.** `AuditLog.targetType` is an enum of
`["user","post","stream","report"]` (`auditLogSchema.js:27-31`) and `action` is a closed list of
moderation verbs (`:11-26`). It is written only by `moderationService.js` (8 call sites: `:78-206`).
Course review and scholar review **do not write to it at all** — they call `logger.info`
(`courseService.js:756,764`; `scholarService.js:174,179`). Extending the enums to cover every
knowledge-graph verb would bloat a moderation log with content-governance events. **Verdict:** write
a separate `KnowledgeAuditEvent` collection; leave `AuditLog` to moderation.

### 1.6 The failure mode you have not named: the review queue starves

The workflow assumes a reviewer population. **Today it is zero.** The repo has one seeded admin
(`seedAdmin.js`), scholars who are course sellers, and — instructive — a `TopicReflection` schema with
`isScholarVerified / scholarName / scholarNote` fields (`backend/models/topicReflectionSchema.js:37-49`)
that **no code path has ever set** (`reflectionService.js:139` only reads it). That is the previous
attempt at "scholar verification" and it shipped as a permanent `false`.

If visibility is gated on approval, one of two things happens: every Badr edge sits in `pending` and
the feature is invisible, or the owner self-approves and the green badge means "the developer clicked
a button." Both are worse than no workflow. The second is actively misleading to users — it is the
`isScholarVerified` failure with a UI.

**Design against it:**

- Visibility gate = **machine-checkable provenance completeness** (source citation present,
  grading label present, confidence set, disagreement flag set). Enforced by Mongoose validators and
  the Zod schema. An edge missing any of these cannot be `published`, period.
- Authority badge gate = **human review**. Three visible tiers on every edge: *Unreviewed* (grey),
  *Reviewed* (named reviewer, domain), *Contested* (positions shown). Never a bare check mark.
- The author (you) is **never** a reviewer of their own edges — service-enforced.
- Ship A1 with everything *Unreviewed* and honest about it. That is the state the research
  recommends for v1 anyway: "ship that to one or two qualified reviewers before writing another line."

---

## Task 2 — Fit against the existing codebase

### 2.1 Does it belong in DeenVerse at all?

**Yes — as a bounded module. Not as a separate product.** Reasoning, not compromise:

**What it genuinely shares (and would have to duplicate elsewhere):**

- Ayah identity and text. `quranService.js` already exposes `getAyah` (`:79`), the verse-key
  resolver `findAyahIdBySurah` via `quran-meta`, and a validated `GET /quran/ayah/by-key/:verseKey`
  (`quranRoute.js:17`, controller validation at `quranController.js:42-64`). Frontend has
  `useAyahByVerseKey` (`frontend/src/features/quran/useQuranReader.ts:19-30`) and an `AyahCard`
  component (`frontend/src/features/quran-topics/components/AyahCard.tsx:10-15`) rendering the
  `AyahItem` type (`quran-topics/types.ts:16-30`) with tafsir toggle and audio.
- Cross-linking precedent. `topicService.getTopicAyahs` (`backend/services/topicService.js:67-119`)
  already joins topics ↔ tafakkur ↔ tazkia ↔ tadabbur by verse key and returns `crossLinks`. A
  Seerah event is one more thing an ayah page can link to.
- Identity, roles, admin guard, notifications (`createAndEmitNotification`,
  `notificationService.js:109` with `type: "system"`), share cards (`postSchema.js:22-26` already
  enumerates `ayah|hadith|ruku|...` share types — `seerah-event` is one more).
- Content-seeding conventions (`scripts/seedSigns.js`, curated data under `backend/data/`).

**What it does not share, and must stay isolated:**

- Its own schemas, own route prefix, own `features/seerah/` folder, own review subsystem. No
  foreign keys *from* social/LMS code *into* graph collections in v1.
- Its authority model. Nothing about "who may assert a hadith grading" should touch `isScholar`.

A separate product sharing only auth would mean a second deploy target for a repo that already has
three contradictory ones (`vercel.json`, S3/CloudFront in `ci.yml`, Render in
`frontend/.env.production`), a second Mongo, and a duplicated Quran service — for a solo operator
whose biggest documented risk is uncommitted, untracked work (`docs/01_Project_Overview.md:22`).

**The honest scope note:** this feature is closer to DeenVerse's *stated* identity
("hadith/Quran content", `.claude/PROJECT_CONTEXT.md:3`) than the LMS is. It is not a foreign body.

### 2.2 Build before the security fixes? **No.**

Direct answer: **No. Fix three things first, then build. Do not block on frontend tests.**

Why these three specifically block *this* feature and not just the platform:

1. **CSRF via refresh cookie** (`backend/config/auth.js:49,89-91` accepts `req.cookies.refreshToken`
   as full auth on every route). Every reviewer/admin mutation this plan adds — `POST /seerah/review/decisions`,
   `PUT /admin/seerah/reviewers/:id` — inherits it. A forged cross-site POST from a logged-in
   reviewer's browser could record an `accept` decision. The entire point of the review workflow is
   that a decision is a deliberate act by a credentialed person. Fix: cookie auth only on
   `POST /user/refresh`. One file.
2. **NoSQL operator injection** (`backend/middlewares/security.js:98-100` copies object keys
   verbatim; no `express-mongo-sanitize`). Edge queries take `fromRef`/`toRef` from the query
   string. Add key rejection for `$`/`.`-prefixed keys. One function.
3. **Paid enrollment broken** (`CheckoutPage.tsx:12` vs `CourseDetailPage.tsx:106` param mismatch;
   `paymentSessionId` absent from the frontend). This does not touch the graph, but it is the thing
   charging users money and failing — it outranks any new feature on priority alone.

Priority order: **paid enrollment → CSRF → mongo-sanitize → this feature (A1) → moderation UI →
frontend test harness.** The three fixes are days, not weeks; the feature is weeks, not days.

Frontend tests: the platform has zero and no runner (`frontend/package.json` has no vitest/jest).
Do not gate A1 on retrofitting that. **Do** make the reviewer queue (A2) the first thing in the repo
with a Vitest test, because it is the first UI whose wrong click has content-authority consequences.

### 2.3 Datastore: Mongo, typed edge collection

**Verdict: model the graph in Mongo as typed edge documents. Do not add Neo4j. Do not add Postgres.**

The research recommends a property graph because that is the *conceptually* right shape. It is. But
the operational question is different:

| Consideration | Reality for this graph |
|---|---|
| Size | Badr v1: ~15 events, ~50–120 edges. Full Seerah at research's own coverage (~570 ayat with asbab): low thousands of edges. |
| Query depth | Event → its edges → the nodes on the other end. Ayah → its edges → events. That is 1 hop. "Events sharing an ayah with this event" is 2 hops. Nothing deeper is in scope. |
| Write pattern | Curated, low-frequency, human-authored, versioned. Not a streaming graph. |
| Operator | One person, Render/Vercel/Atlas. Every additional stateful service is a page that fails at 2am. |
| Existing capability | Mongo already runs; `$graphLookup` exists if 3+ hops ever matter; compound indexes on `(fromType, fromRef)` and `(toType, toRef)` make 1-hop reads index-only. |

Neo4j buys Cypher and traversal performance the workload never exercises, at the cost of a second
datastore, a second backup story, a second auth surface, and a sync problem between the graph and
the `User` documents that hold reviewer grants. Postgres buys nothing here except a migration.

**The one rule that makes Mongo work as a graph:** edges are **first-class documents in their own
collection**, never arrays embedded on the event or on any node. Embedded arrays make edge-level
review state, versioning and per-edge indexes impossible — that is the trap `courseSchema.modules[].lessons[]`
(`courseSchema.js:71-92`) already fell into for lessons (content access at
`courseService.js:639-651` is a nested linear scan).

Revisit only if a query needs ≥3 hops in a hot path, or the graph exceeds ~10⁵ edges. Neither is on
any plausible horizon.

---

## Task 3 — Concrete integration plan

### 3.1 Data model (NEW — `backend/models/`)

Conventions matched from the existing 25 schemas: `mongoose.Schema` with `{ timestamps: true }`,
named export `export const X = mongoose.model("X", schema)` (the `signSchema.js:134` default-export
style is the outlier — follow `courseSchema.js:155`), field-level JSDoc, explicit compound indexes
at the bottom.

**Ayahs are not a stored node.** Ayah identity is the verse key `"8:9"`, validated the way
`quranController.js:44-63` does it (regex + `findAyahIdBySurah` bounds). Text is fetched via
`quranService.getAyah`. Storing 6,236 ayah documents would duplicate `quran-meta` and re-import a
licensing question the repo has already sidestepped.

#### `seerahEventSchema.js`

```js
import mongoose from "mongoose";
import slugify from "slugify";

const seerahEventSchema = new mongoose.Schema(
  {
    /** URL-safe id, auto-generated from title (see courseSchema.js:132-147 for the pattern) */
    slug: { type: String, lowercase: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    titleArabic: { type: String, default: "" },

    /** Segment grouping — v1 has exactly one value */
    segment: { type: String, enum: ["badr"], required: true, index: true },

    /**
     * Dating is plural on purpose. Sources disagree on day/month; store each
     * attested dating with its source. Never collapse to one field.
     */
    dating: [
      {
        source: { type: String, required: true },      // e.g. "Ibn Hisham, Sira 1/606"
        hijriYear: { type: Number, required: true },
        hijriMonth: { type: Number, min: 1, max: 12 },
        hijriDay: { type: Number, min: 1, max: 30 },
        note: { type: String, default: "" },
      },
    ],

    /** Ordering within the segment for narrative display (curatorial, not a historical claim) */
    narrativeOrder: { type: Number, required: true },

    /**
     * Your own summary. Must be original prose — never pasted from a copyrighted
     * Seerah translation (see §3.5 licensing).
     */
    summary: { type: String, required: true, maxlength: 2000 },

    /** People/places as plain labels in v1 — no Person/Place nodes yet (Task 4) */
    participants: [{ type: String, maxlength: 120 }],
    places: [{ type: String, maxlength: 120 }],

    /** Light node-level review: is this a real, defensibly-summarised event */
    review: {
      state: { type: String, enum: ["draft", "unreviewed", "reviewed", "retired"], default: "draft", index: true },
      snapshotHash: { type: String, default: null }, // sha256 of summary at last review
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

seerahEventSchema.index({ slug: 1 }, { unique: true });
seerahEventSchema.index({ segment: 1, narrativeOrder: 1 });

export const SeerahEvent = mongoose.model("SeerahEvent", seerahEventSchema);
```

#### `hadithRefSchema.js` — a *reference* node, not a text store

```js
const hadithRefSchema = new mongoose.Schema(
  {
    /** Canonical citation — the identity of the node */
    collection: { type: String, required: true, enum: ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "ahmad", "other"], index: true },
    number: { type: String, required: true },           // string: "3953" or "1763a"
    /** Optional secondary ids — the repo's existing hadith identity is HadeethEnc (postSchema.js:17-18) */
    hadeethencId: { type: String, default: null, index: true, sparse: true },
    sunnahComUrl: { type: String, default: null },

    /**
     * Gradings are plural and attributed. The research is explicit that graders differ.
     * Never store a single unattributed "grade".
     */
    gradings: [
      {
        grade: { type: String, required: true, enum: ["sahih", "hasan", "daif", "mawdu", "mursal", "ungraded"] },
        grader: { type: String, required: true },       // "al-Albani", "Darussalam", "Zubair Ali Zai", "Bukhari/Muslim (by inclusion)"
        source: { type: String, required: true },       // where the grading is recorded
      },
    ],

    /** Short English gloss of the matn, in your own words, for the card. Not the translation. */
    gloss: { type: String, required: true, maxlength: 500 },
    /** Arabic matn excerpt — only from a source whose terms permit it (see §3.5) */
    matnArabicExcerpt: { type: String, default: null, maxlength: 1000 },
  },
  { timestamps: true }
);
hadithRefSchema.index({ collection: 1, number: 1 }, { unique: true });
export const HadithRef = mongoose.model("HadithRef", hadithRefSchema);
```

> **Conflict with the research:** it recommends Sunnah.com/LK Corpus as the hadith backbone. The
> repo's existing hadith identity is **HadeethEnc** — `frontend/src/features/hadith/useHadith.ts:4`
> fetches `hadeethenc.com/api/v1` directly, `postSchema.js:17-18` stores `hadithRef` as a HadeethEnc
> ID, and `userSchema.saved` holds HadeethEnc IDs. HadeethEnc is a curated subset with its own
> `grade` field (`HadithCard.tsx:105-107` renders it) — it does not cover the canonical collections.
> **Resolution:** the node's identity is the *canonical citation* (`collection` + `number`) so it is
> source-independent; `hadeethencId` is an optional join to the app's existing hadith surface. For a
> Badr v1 of 20–40 hadith, every record is hand-entered from the printed collections; no bulk source
> is needed and no scraping happens.

#### `tafsirPassageSchema.js`

```js
const tafsirPassageSchema = new mongoose.Schema(
  {
    work: { type: String, required: true, enum: ["ibn-kathir", "tabari", "qurtubi", "jalalayn", "saadi", "wahidi-asbab", "suyuti-lubab", "other"], index: true },
    verseKey: { type: String, required: true, match: /^\d{1,3}:\d{1,3}$/, index: true },
    /** Locator inside the work — volume/page or edition-specific anchor */
    locator: { type: String, required: true },
    /** Your summary of what the passage says about this ayah. Original prose. */
    summary: { type: String, required: true, maxlength: 1500 },
    /** Where a reader can consult the passage. A link, not a copy. */
    externalUrl: { type: String, default: null },
    /** Arabic excerpt only when licence permits; null otherwise (see §3.5) */
    arabicExcerpt: { type: String, default: null, maxlength: 1500 },
  },
  { timestamps: true }
);
tafsirPassageSchema.index({ work: 1, verseKey: 1 }, { unique: true });
export const TafsirPassage = mongoose.model("TafsirPassage", tafsirPassageSchema);
```

#### `knowledgeLinkSchema.js` — the edge. This is the whole product.

```js
const NODE_TYPES = ["ayah", "seerahEvent", "hadithRef", "tafsirPassage"];

const knowledgeLinkSchema = new mongoose.Schema(
  {
    // ── Endpoints ─────────────────────────────────────
    fromType: { type: String, enum: NODE_TYPES, required: true },
    /** ObjectId string for stored nodes; verse key ("8:9") when fromType === "ayah" */
    fromRef: { type: String, required: true },
    toType: { type: String, enum: NODE_TYPES, required: true },
    toRef: { type: String, required: true },

    /**
     * The verb is the honest label. "revealed_concerning" is a strong historical claim
     * that needs an asbab report. "thematically_related" is a curatorial claim. They are
     * not interchangeable and the UI renders them differently.
     */
    relation: {
      type: String,
      required: true,
      enum: [
        "revealed_concerning",   // ayah → event, requires an asbab source
        "references",            // ayah → event, the ayah names/describes the event
        "thematically_related",  // ayah → event, curatorial, no sabab claim
        "attested_by",           // event → hadithRef
        "explained_by",          // ayah → tafsirPassage
        "dated_by",              // event → hadithRef (the report is the dating evidence)
      ],
      index: true,
    },

    // ── Provenance (all REQUIRED — this is the visibility gate) ──
    source: {
      work: { type: String, required: true },          // "al-Wahidi, Asbab al-Nuzul"
      locator: { type: String, required: true },       // "on 8:9" / "vol. 2 p. 14"
      url: { type: String, default: null },
    },
    /** Authenticity of the *link's evidence*, not of the nodes */
    grading: {
      label: { type: String, required: true, enum: ["sahih", "hasan", "daif", "mursal", "no-isnad", "curatorial", "textual"] },
      basis: { type: String, required: true, maxlength: 500 }, // why this label
    },
    confidence: { type: String, required: true, enum: ["established", "reported", "contested", "weak"] },
    disagreement: {
      flag: { type: Boolean, required: true },
      summary: { type: String, default: "", maxlength: 1000 }, // what the disagreement is, neutrally
    },

    // ── Versioning ────────────────────────────────────
    version: { type: Number, default: 1, min: 1 },
    supersedes: { type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeLink", default: null },
    /** sha256 over the quoted material at authoring time (ayah text edition + excerpts) */
    snapshotHash: { type: String, required: true },
    snapshotNote: { type: String, default: "" },          // "alquran.cloud quran-uthmani / en.sahih"

    // ── Review state (DERIVED — written only by knowledgeReviewService) ──
    review: {
      state: {
        type: String,
        enum: ["draft", "unreviewed", "reviewed", "contested", "returned", "retired"],
        default: "draft",
        index: true,
      },
      /** which reviewer domain governs this edge — derived from relation */
      domain: { type: String, enum: ["hadith-grading", "asbab-al-nuzul", "seerah-chronology", "tafsir-attribution"], required: true },
      acceptCount: { type: Number, default: 0 },
      objectCount: { type: Number, default: 0 },
      lastDecisionAt: { type: Date, default: null },
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// One live edge per (from, to, relation, version)
knowledgeLinkSchema.index({ fromType: 1, fromRef: 1, toType: 1, toRef: 1, relation: 1, version: 1 }, { unique: true });
// The two 1-hop reads
knowledgeLinkSchema.index({ fromType: 1, fromRef: 1, "review.state": 1 });
knowledgeLinkSchema.index({ toType: 1, toRef: 1, "review.state": 1 });
// Reviewer queue
knowledgeLinkSchema.index({ "review.domain": 1, "review.state": 1, updatedAt: -1 });

// Structural rule: "revealed_concerning" without an asbab-class source is not a valid edge.
knowledgeLinkSchema.pre("validate", function (next) {
  if (this.relation === "revealed_concerning" && this.grading.label === "curatorial") {
    return next(new Error('"revealed_concerning" requires transmitted evidence; use "thematically_related"'));
  }
  next();
});

export const KnowledgeLink = mongoose.model("KnowledgeLink", knowledgeLinkSchema);
```

#### `reviewDecisionSchema.js` — position attached to reviewer

```js
const reviewDecisionSchema = new mongoose.Schema(
  {
    link: { type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeLink", required: true, index: true },
    /** Decisions bind to a version. A new edge version starts with zero decisions. */
    linkVersion: { type: Number, required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    domain: { type: String, required: true },             // must match link.review.domain AND reviewer's grant
    position: { type: String, required: true, enum: ["accept", "accept-with-note", "object", "challenge"] },
    note: { type: String, default: "", maxlength: 3000 },
    citedSources: [{ work: String, locator: String, url: String }],
    /** What the reviewer actually looked at */
    snapshotHash: { type: String, required: true },
    /** Set when the reviewer's grant is revoked — decision stays, authority does not */
    authorityWithdrawn: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);
reviewDecisionSchema.index({ link: 1, linkVersion: 1, reviewer: 1 }, { unique: true });
export const ReviewDecision = mongoose.model("ReviewDecision", reviewDecisionSchema);
```

`position: "challenge"` is the only value a non-reviewer may write (reader report). It never counts
toward `acceptCount/objectCount`; it surfaces in the queue.

#### `knowledgeAuditEventSchema.js`

Separate from `AuditLog` for the reasons in §1.5. Shape: `{ actor, action (enum of graph verbs:
link_created, link_versioned, decision_recorded, state_derived, reviewer_granted, reviewer_revoked,
link_retired), targetType, targetId, previousState: Mixed, details }`. Copy the `previousState`
snapshot idea from `auditLogSchema.js:40-44` — it is the one genuinely good thing there.

#### `userSchema.js` — **EXTENDS** (`backend/models/userSchema.js`, after `scholarProfile` at `:54-77`)

```js
reviewerProfile: {
  domains: [{ type: String, enum: ["hadith-grading", "asbab-al-nuzul", "seerah-chronology", "tafsir-attribution"] }],
  grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: undefined },
  grantedAt: { type: Date, default: undefined },
  basis: { type: String, default: "" },        // what credential was inspected, by whom
  revokedAt: { type: Date, default: undefined },
  revokedReason: { type: String, default: undefined },
},
```

Not a `role` enum value. A user can be `scholar` *and* hold a reviewer grant; a reviewer need not be
a scholar.

#### Shared Zod schemas — **NEW** `packages/shared/src/schemas/knowledge.ts`

Re-export from `packages/shared/src/schemas/index.ts:4-7` alongside `scholar/payment/course/classroom`.
Mirror the pattern of `courseReviewSchema` (`course.ts:146-149`) and `enrollCourseSchema`
(`course.ts:99-101`): the backend controller parses with `.safeParse` exactly as
`courseController.js:257-260` does. Define `knowledgeRelationEnum`, `gradingLabelEnum`,
`confidenceEnum`, `reviewDomainEnum`, `createKnowledgeLinkSchema`, `recordDecisionSchema`,
`grantReviewerSchema`. Remember `packages/shared` must be rebuilt (`npm run build:shared`) before the
backend or frontend sees new exports — `jest.config.cjs` maps `@deenverse/shared` straight to `dist/`.

### 3.2 Review workflow

**What the course pattern gives you (EXISTS, reuse the shape):**

- Status enum on the document with a submit transition: `courseSchema.js:109-113`,
  `publishCourse` moving `draft → pending-review` after content validation (`courseService.js:342-373`).
- Admin queue with status tabs and pagination: `getAdminCourses` (`courseService.js:702-729`),
  `AdminCourseReviewPage.tsx` (537 lines; tabs at `:23`, select/approve/reject handlers at `:50-82`),
  `useAdminCourses/useReviewCourse` hooks (`useCourseAdmin.ts:9-43`).
- Notification to the author on decision: `courseService.js:769-783` via `createAndEmitNotification`
  with `type: "system"` and a `link`.
- Route shape: `adminCourseRoute.js:12-13` — `isAuthenticated, isAdmin` then handler; body validated
  by a shared Zod schema in the controller.

**Where the analogy breaks and needs new machinery:**

| Course review | Knowledge review | Why |
|---|---|---|
| One decision overwrites (`reviewedBy/reviewedAt` on the doc, `courseService.js:745-748`) | Decisions are separate documents, N per edge version | Disagreement must be preserved (§1.4) |
| State is *set* by the reviewer | State is *derived* from decisions | No single actor decides visibility |
| Reviewer = any admin | Reviewer = holder of a domain grant matching the edge's domain | Authority scoping (§1.3) |
| Rejection returns to `draft` with a reason | `object` leaves the edge visible as `contested` | Objection is information for readers, not a veto |
| No versioning | Edge version + snapshot hash; decisions bound to version | Drift (§1.5) |
| No audit record (only `logger.info`) | `KnowledgeAuditEvent` on every transition | Governance |
| Author and reviewer may be the same admin | Service rejects self-review | Conflict of interest |

**State machine for `KnowledgeLink.review.state`:**

```
draft ──(author submits; provenance validators pass)──▶ unreviewed
unreviewed ──(≥1 accept in domain, 0 unresolved object)──▶ reviewed
unreviewed ──(≥1 object)──▶ contested
reviewed   ──(new object)──▶ contested
contested  ──(objector withdraws OR author versions the edge)──▶ unreviewed (new version) / reviewed
any        ──(author or admin returns for rework)──▶ returned  (not public)
any        ──(admin retires)──▶ retired  (not public; kept for history)
```

**Public visibility:** `unreviewed`, `reviewed`, `contested` are all public. `draft`, `returned`,
`retired` are not. The badge differs; the visibility does not. This is the decision from §1.6 and it
is deliberate — reversing it reintroduces the starving queue.

**Who may do what (enforced in `knowledgeReviewService.js`, not in UI):**

| Transition | Actor | Middleware |
|---|---|---|
| create `draft`, edit `draft`/`returned` | author (any admin in v1; later a `curator` grant) | `isAuthenticated, isAdmin` |
| submit `draft → unreviewed` | author | `isAuthenticated, isAdmin` |
| record `accept / accept-with-note / object` | holder of grant in `link.review.domain`, **not the author** | `isAuthenticated, isReviewer(domain)` — NEW |
| record `challenge` | any authenticated user | `isAuthenticated`, rate-limited |
| `returned`, `retired` | admin | `isAuthenticated, isAdmin` |
| version an edge | author | `isAuthenticated, isAdmin` |
| grant/revoke reviewer | admin | `isAuthenticated, isAdmin` |

Revoking a reviewer: set `reviewerProfile.revokedAt`, then `ReviewDecision.updateMany({reviewer}, {authorityWithdrawn: true})`,
then re-derive state for every affected link. One service function, one audit event per link.

### 3.3 API surface (NEW routes; mount in `backend/index.js` after `:148`)

Follow the layering and middleware order already in place: route file → controller (Zod `safeParse`
→ `AppError(message, 400)`) → service → model. `AppError` is `(message, statusCode, errors?)`
(`backend/utils/AppError.js:2`). Literal paths before param paths, as `ruhaniRoute.js:55-63` and
`quranRoute.js:16-17` do.

```
# ── Public read ──────────────────────────────── routes/seerahRoute.js
GET  /api/v1/seerah/segments                          → [{ segment, eventCount, publishedLinkCount }]
GET  /api/v1/seerah/events?segment=badr               → events ordered by narrativeOrder, with published-link counts
GET  /api/v1/seerah/events/:slug                      → event + all public edges (unreviewed|reviewed|contested), each with resolved node summary
GET  /api/v1/seerah/ayah/:verseKey                    → validate like quranController.js:44-63; return public edges touching this ayah + event stubs
GET  /api/v1/seerah/links/:id                         → one edge with its decisions (reviewer names, positions, notes) — the "Scholars differ" panel
GET  /api/v1/seerah/hadith/:id                        → HadithRef + edges
GET  /api/v1/seerah/tafsir/:id                        → TafsirPassage + edges

# ── Reader challenge ──────────────────────────── (auth, rate-limited)
POST /api/v1/seerah/links/:id/challenge               → ReviewDecision{position:"challenge"}   isAuthenticated + new challengeLimiter (rateLimiter.js:35 factory)

# ── Reviewer ─────────────────────────────────── routes/knowledgeReviewRoute.js  mounted at /api/v1/review/knowledge
GET  /api/v1/review/knowledge/queue?domain=&state=    → edges in reviewer's granted domains       isAuthenticated + isReviewer()
GET  /api/v1/review/knowledge/links/:id               → full edge incl. snapshot + prior decisions isAuthenticated + isReviewer(link.domain)
POST /api/v1/review/knowledge/links/:id/decisions     → { position, note, citedSources }         isAuthenticated + isReviewer(link.domain); rejects author==reviewer
GET  /api/v1/review/knowledge/mine                    → the reviewer's own decisions              isAuthenticated + isReviewer()

# ── Curator / admin ──────────────────────────── routes/adminKnowledgeRoute.js mounted at /api/v1/admin/knowledge
POST   /api/v1/admin/knowledge/events                 → create SeerahEvent (draft)               isAuthenticated + isAdmin
PUT    /api/v1/admin/knowledge/events/:slug
POST   /api/v1/admin/knowledge/hadith                 → create HadithRef
POST   /api/v1/admin/knowledge/tafsir                 → create TafsirPassage
POST   /api/v1/admin/knowledge/links                  → create KnowledgeLink (draft); computes snapshotHash server-side
PUT    /api/v1/admin/knowledge/links/:id              → edit while draft/returned
POST   /api/v1/admin/knowledge/links/:id/submit       → draft → unreviewed (runs provenance validators)
POST   /api/v1/admin/knowledge/links/:id/version      → new version, supersedes old; old → retired
POST   /api/v1/admin/knowledge/links/:id/return
POST   /api/v1/admin/knowledge/links/:id/retire
GET    /api/v1/admin/knowledge/reviewers
PUT    /api/v1/admin/knowledge/reviewers/:userId      → grant { domains[], basis }
DELETE /api/v1/admin/knowledge/reviewers/:userId      → revoke { reason } → cascades authorityWithdrawn + re-derive
GET    /api/v1/admin/knowledge/audit                  → KnowledgeAuditEvent, paginated
```

**New authorization middleware — `backend/middlewares/reviewer.js` (NEW):**

```js
/**
 * isReviewer(domain?) — requires an active reviewer grant. If `domain` is given (or resolved
 * from the target link by the controller and placed on req.reviewDomain), the grant must
 * include it. Mirrors the shape of isScholar (middlewares/admin.js:39-59) but checks
 * reviewerProfile, not role, and is domain-scoped.
 */
export const isReviewer = (domain) => async (req, _res, next) => {
  const user = await User.findById(req.user).select("reviewerProfile").lean();
  const rp = user?.reviewerProfile;
  if (!rp?.grantedAt || rp.revokedAt) return next(new AppError("Reviewer grant required", 403));
  const needed = domain || req.reviewDomain;
  if (needed && !rp.domains.includes(needed)) return next(new AppError(`Not granted for domain: ${needed}`, 403));
  next();
};
```

Admins do **not** bypass `isReviewer`. `isScholar` lets admins through (`admin.js:41-45`); that is
correct for selling courses and wrong for asserting a hadith grading. An admin who is qualified gets a
grant like anyone else.

**Cache invalidation:** public reads should use `cacheGet/cacheSet` (`cacheService.js:34,51`) keyed
`knowledge:v1:event:<slug>` / `knowledge:v1:ayah:<verseKey>` with a modest TTL, and every state
transition calls `cacheDelPattern("knowledge:v1:*")` (`cacheService.js:82`). Do **not** use
`TTL.QURAN` (7 days) as `topicService.js:11` does — edge state changes.

### 3.4 Frontend

**Routes — EXTENDS `frontend/src/App.tsx`.** Add inside the `<MainLayout />` block (`:264-537`),
lazy-loaded with the existing pattern (`:15-17`). Literal before param, as `:333-334` already does for
`/quran-topics/mood/:moodId` vs `/quran-topics/:slug`.

```tsx
<Route path="/seerah" element={<SeerahHubPage />} />
<Route path="/seerah/ayah/:verseKey" element={<SeerahAyahPage />} />
<Route path="/seerah/links/:id" element={<KnowledgeLinkPage />} />
<Route path="/seerah/:segment" element={<SeerahSegmentPage />} />
<Route path="/seerah/:segment/:slug" element={<SeerahEventPage />} />
<Route path="/review/knowledge" element={<ReviewerGuard><ReviewQueuePage /></ReviewerGuard>} />
<Route path="/review/knowledge/:id" element={<ReviewerGuard><ReviewLinkPage /></ReviewerGuard>} />
<Route path="/admin/knowledge" element={<AdminGuard><AdminKnowledgePage /></AdminGuard>} />
<Route path="/admin/knowledge/reviewers" element={<AdminGuard><AdminReviewersPage /></AdminGuard>} />
```

Public read pages are unguarded, matching `/quran-topics/:slug` (`:334`). The challenge action
inside them checks `isAuthenticated` from `useAuthStore` and routes to `/login` the way
`CourseDetailPage.tsx:89-93` does.

**`ReviewerGuard` — NEW `frontend/src/features/auth/ReviewerGuard.tsx`.** Copy `AdminGuard.tsx`
(31 lines) and check `user?.reviewerProfile?.grantedAt && !user.reviewerProfile.revokedAt`. Requires
`reviewerProfile` to be included in the `/user/me` and login payloads (EXTENDS `userService`) and in
`frontend/src/types/user.ts`. Same caveat as `AdminGuard.tsx:26` — this gates UI only; the backend
`isReviewer` is the real gate, and `authStore.ts:65-68` persists the user object to localStorage.

**Feature folder — NEW `frontend/src/features/seerah/`**, following the `ruhani/` layout
(`api/`, `components/`, `hooks/`, pages at root, `types.ts`):

- `useSeerah.ts` — TanStack Query hooks. Query keys `['seerah', 'event', slug]`,
  `['seerah', 'ayah', verseKey]`, `['seerah', 'link', id]`. `staleTime` short (edges change), unlike
  `useQuranReader.ts:13` which uses 7 days for immutable text.
- `SeerahEventPage.tsx` — event header (title, dating list with sources, summary), then edges
  grouped by relation. **Each edge renders an `EvidenceBadge`** (grading label + confidence +
  review-tier: *Unreviewed* / *Reviewed by N* / *Scholars differ*). Ayah edges render the ayah with
  the existing `AyahCard` (`quran-topics/components/AyahCard.tsx:15`) fed by `useAyahByVerseKey`
  (`quran/useQuranReader.ts:19`) mapped to `AyahItem` (`quran-topics/types.ts:16-30`) — **EXISTS,
  reuse**. Hadith edges render a `HadithRefCard` (NEW) showing collection/number, the *gloss*, and
  every attributed grading — never a single grade.
- `SeerahAyahPage.tsx` — the mirror: ayah at top (AyahCard), then events/hadith/tafsir that touch it.
  This is the page `TopicDetailPage.tsx` should later link to from each ayah (EXTENDS `AyahCard`
  with an optional "In the Seerah" affordance — one prop, one link).
- `KnowledgeLinkPage.tsx` — the "Scholars differ" panel: the edge's claim, source, grading basis,
  then each `ReviewDecision` by reviewer name, domain, position and note. This page is the product's
  credibility surface; it deserves the most design attention.
- `EvidenceBadge.tsx` — reuse `Badge` (`components/ui/badge.tsx`) with a fixed colour map:
  `established` emerald, `reported` blue, `contested` amber, `weak` slate, and a grey outline for
  *Unreviewed*. Do **not** reuse `ScholarBadge` (`components/ScholarBadge.tsx:11-16`) — its green
  check means "sells courses" and must not be visually confused with "reviewed."
- `ReviewQueuePage.tsx` / `ReviewLinkPage.tsx` — model on `AdminCourseReviewPage.tsx` (tabs by
  state, list, detail pane) but the detail pane shows the snapshot, prior decisions, and a form with
  `position` / `note` / `citedSources`. No "approve" button; the verbs are *Accept*, *Accept with
  note*, *Object*.
- `AdminKnowledgePage.tsx` — curator forms for events, hadith refs, tafsir passages, and links.
  `react-hook-form` + `zodResolver` with the shared schemas, exactly as the course builder does.

**Navigation — EXTENDS** `Sidebar.tsx:45-62`, `MobileNav.tsx:20-36`, `CommandPalette.tsx:35-43`:
add `{ name: 'Seerah', href: '/seerah', icon: Map }` after 'Quran by Topic'. Add a card to
`LearnQuranHub.tsx:5-69` with `status: 'Available'` — and while there, **remove** the
"Ask-the-Quran Assistant" and "AI Tajweed Coach" `Coming Soon` cards (`:43-58`). Shipping a real
Seerah graph next to two AI promises with `href: '#'` undercuts the credibility this feature depends on.

**Share cards — EXTENDS** `postSchema.js:26` share-type enum with `"seerah-event"`, and
`features/share/ShareActionsMenu` accordingly. Cheap, and it is how the graph reaches the feed.

### 3.5 Ingestion

**Pattern — EXISTS:** `backend/scripts/seedSigns.js` — loads `.env` via `dotenv` from the script's
own directory (`:22`), dynamic-imports the model after env (`:25`), idempotent by natural key
(`:53-61`), `--force` to reset (`:33,44-47`), explicit connect/disconnect. Copy it.

**NEW `backend/scripts/seedSeerah.js`** reading `backend/data/seerah/badr/`:

```
backend/data/seerah/badr/
  events.json      # SeerahEvent documents (slug as natural key)
  hadith.json      # HadithRef documents (collection+number as natural key)
  tafsir.json      # TafsirPassage documents (work+verseKey as natural key)
  links.json       # KnowledgeLink documents; endpoints referenced by natural key, resolved at seed time
```

Seed order: events → hadith → tafsir → links. Every seeded link is created as `draft` with
`author = ADMIN_IDS[0]`, then the script runs the same provenance validators the API runs and
`submit`s the ones that pass to `unreviewed`. Print the ones that fail; do not silently drop them.
`snapshotHash` is computed at seed time from the ayah text fetched via `quranService.getAyah` plus
the stored excerpts — which means the seed needs `MONGO_URI` **and** network to `api.alquran.cloud`;
say so in the script header.

**No bulk ingestion in v1.** For Badr, every record is hand-authored from the printed sources. The
research's bulk sources are for *later* segments, and each one has a licensing problem a paying
platform cannot ignore. The platform **is** commercial: `userSchema.js:100-106` holds a Stripe
subscription, `courseSchema.js:60-69` sells courses, `.env.example` sets `COURSE_COMMISSION_RATE`.

| Source (research §3) | Research's licence note | What it means here |
|---|---|---|
| **spa5k/tafsir_api — al-Wahidi Asbab (ID 86)** | "scraped copy of a copyrighted translation (Guezzou / Royal Aal al-Bayt); content redistribution rights unclear" | **Do not store or display the English text.** Use it as a *finding aid* while authoring: read it, then write `TafsirPassage.summary` in your own words, set `work: "wahidi-asbab"`, `locator: "on 8:9"`, `externalUrl` to altafsir.com. The graph cites al-Wahidi; it does not republish Guezzou. |
| **altafsir.com** | copyrighted; scraping = legal risk | Link only. Never fetch. |
| **Quranpedia API** | live use only; no bulk scrape/republish | Not used in v1. If used later, live calls only, never cached beyond their terms. |
| **OpenITI (Ibn Hisham, Tabari, Ibn Sa'd)** | "likely CC BY-NC-SA — verify before any commercial use" | NC clause + Stripe = **cannot ship the text**. Use as a research source; cite by URI in `source.locator`; store no excerpt until the licence is confirmed in writing. |
| **Sunnah.com API** | "explicitly prohibits scraping and mass reproduction" | Store citation + `sunnahComUrl`. Hand-entered `gloss`. No `matnArabicExcerpt` from Sunnah.com. |
| **LK Hadith Corpus** | open (academic) | Acceptable source for `matnArabicExcerpt` on the canonical six. Record the corpus + row id in `source`. |
| **HadeethEnc** | already used live by the app (`useHadith.ts:4`) | Join via `hadeethencId` only; keep fetching live as the app does today. |
| **Tanzil** | CC BY 3.0, no modification, link back | Not needed — Arabic ayah text already comes via `api.alquran.cloud` (`quranService.js:6-8`). If you ever store Arabic text, Tanzil verbatim with attribution is the clean path. |
| **QUL (Tarteel)** | MIT *code*; "verify each resource's content terms" | Not needed for Badr. Revisit for tafsir excerpts only after per-resource terms are read. |
| **Chronology tables** | public domain / academic | Fine — but **out of v1** (Task 4). |

Two schema consequences of this table: `TafsirPassage.arabicExcerpt` and `HadithRef.matnArabicExcerpt`
are `default: null` and stay null for anything sourced from a restricted origin; `summary`/`gloss`
are `required` because they are the only text the platform owns.

### 3.6 Sequencing — Badr-only v1

| # | Milestone | "Done" means | Must be true before next |
|---|---|---|---|
| **M0** | Security prerequisites | Cookie auth restricted to `/user/refresh` (`config/auth.js`); `$`-key rejection in `security.js:98`; paid enrollment flow fixed. Backend suite green in CI. | All three merged to `main`. |
| **M1** | Schemas + shared contracts + seed | 5 new models; `reviewerProfile` on `User`; `knowledge.ts` in shared with types exported; `seedSeerah.js` loads ≥10 events, ≥25 hadith refs, ≥10 tafsir passages, ≥60 links for Badr, all `unreviewed`. Model unit tests in `backend/__tests__/knowledgeModel.test.js` (pattern: `courseModel.test.js`) cover every validator, esp. the `revealed_concerning` pre-validate. | Seed runs idempotently twice with identical counts. |
| **M2** | Public read API + reader UI | 7 public routes live; `SeerahHubPage`, `SeerahSegmentPage`, `SeerahEventPage`, `SeerahAyahPage`, `KnowledgeLinkPage` shipped; every edge shows `EvidenceBadge` with *Unreviewed*; ayah ↔ event navigation works both directions; `AyahCard` reused. supertest smoke in `__tests__/smoke/knowledge.smoke.test.js` (pattern: `phase2.smoke.test.js`). `tsc`, `eslint`, `vite build` clean. | **External gate:** one qualified reviewer walks every Badr edge on the live UI and signs off on the *model*. Edge fixes are M2 follow-ups; model changes send you back to M1. |
| **M3** | Review machinery | `isReviewer`, `ReviewerGuard`, reviewer/admin routes, `ReviewQueuePage`, `ReviewLinkPage`, `AdminReviewersPage`; derived-state service with tests for every transition incl. revocation cascade; `KnowledgeAuditEvent` written on every transition. **First Vitest test in the repo** covers the decision form. | ≥2 real reviewers granted (distinct domains) and ≥1 real `object` recorded and rendered as *Scholars differ*. |
| **M4** | Curator tooling + polish | `AdminKnowledgePage` forms replace JSON editing; share-to-feed for events; `TopicDetailPage` ayah cards link into Seerah; `LearnQuranHub` card added and AI `Coming Soon` cards removed. | Backlog from M3 reviewers cleared. |
| **M5** | Decision point | Retro against the research's v1 success metric: did the model survive scrutiny without model changes? | Only if yes: scope segment #2. |

---

## Task 4 — What not to build in v1

| Leave out | Why it is a trap now |
|---|---|
| **Option C (grounded RAG assistant)** | Research's own numbers; no review board; no correction policy. Also see the two `Coming Soon` AI cards already lying in `LearnQuranHub.tsx:43-58`. |
| **Option B as a user-facing surface** | Produces plausible unsourced links to readers. Build it later as a *reviewer-only* suggestion queue, if M3 reviewers say they want it. |
| **Multiple surah chronology orderings (Nöldeke, Egyptian, Bazargan…)** | Real and important — and irrelevant to Badr, which is anchored by event dating, not surah order. Adds a `ChronologyScheme` model and a timeline UI before the edge model is proven. |
| **Person / Place nodes, CIDOC-CRM alignment** | Right eventual shape. For 15 events, `participants: [String]` is enough and reviewable. Promoting Abu Jahl to a node with edges triples the review surface for zero reader benefit at Badr scale. |
| **Full asbab coverage (~570 ayat) or al-Suyuti parsing** | Coverage story is a scaling story. Badr first. |
| **Any bulk text ingestion (OpenITI, spa5k text, QUL tafsir dumps)** | Every one has a licence problem for a paying platform (§3.5). Citations and your own summaries only. |
| **Storing ayah text** | Duplicates `quran-meta` + `alquran.cloud`; reopens Tanzil no-modify question. Reference by verse key. |
| **Reviewer self-application flow** | The scholar application (`scholarService.js:19-55`) shows what a self-application produces: self-reported credentials rubber-stamped by one admin. Reviewer grants are admin-initiated with a recorded `basis`. |
| **Reusing `isScholar`, `ScholarBadge`, or `AuditLog` for the graph** | §1.3, §3.4, §1.5 respectively. Each looks like reuse and is actually a category error. |
| **Approval-gated visibility** | §1.6. Guarantees an empty feature or a meaningless badge. |
| **Time-based re-review / approval expiry** | Nothing in the sources changes on a schedule. Event-driven re-review only. |
| **Embeddings / semantic search over the Badr corpus** | 60–120 edges. A `SearchBar` filter over titles is sufficient and `fuse.js` is already a dependency. |
| **Mobile screens** | `packages/mobile` is excluded from CI and unverified. Don't add scope to a package nobody builds. |
| **Certificates, quizzes, or course integration** | Tempting because the LMS exists. Don't couple the graph to the thing that sells until the graph has survived review. |
| **Arabic excerpts from any restricted source** | `null` is a valid, honest value. A link to the source is not a copy of it. |

---

## Appendix — what already exists vs. what this plan adds

| Layer | EXISTS (reuse) | EXTENDS | NEW |
|---|---|---|---|
| Models | `userSchema.js` (embedding pattern), `courseSchema.js` (status/slug patterns), `auditLogSchema.js` (`previousState` idea) | `userSchema.js` + `reviewerProfile`; `postSchema.js` share-type enum | `seerahEventSchema`, `hadithRefSchema`, `tafsirPassageSchema`, `knowledgeLinkSchema`, `reviewDecisionSchema`, `knowledgeAuditEventSchema` |
| Shared | `schemas/course.ts` review/enroll shapes | `schemas/index.ts` re-export | `schemas/knowledge.ts` |
| Services | `quranService.getAyah`, `findAyahIdBySurah`, `cacheService`, `createAndEmitNotification` | `userService` (`/me` payload) | `knowledgeService`, `knowledgeReviewService`, `reviewerService` |
| Middleware | `isAuthenticated`, `isAdmin`, `rateLimiter()` factory | — | `isReviewer(domain)`, `challengeLimiter` |
| Routes | mount pattern `index.js:128-149` | `index.js` (3 mounts) | `seerahRoute`, `knowledgeReviewRoute`, `adminKnowledgeRoute` |
| Frontend | `AyahCard`, `useAyahByVerseKey`, `AdminGuard`, `Badge`, `AdminCourseReviewPage` (shape), TanStack/RHF/Zod patterns | `App.tsx`, `Sidebar/MobileNav/CommandPalette`, `LearnQuranHub`, `AyahCard` (one prop), `types/user.ts` | `features/seerah/*`, `ReviewerGuard`, `EvidenceBadge`, `HadithRefCard` |
| Scripts/data | `seedSigns.js` pattern | — | `seedSeerah.js`, `data/seerah/badr/*.json` |
| Tests | jest + supertest + `courseModel.test.js` pattern | — | `knowledgeModel.test.js`, `knowledgeReview.test.js`, `smoke/knowledge.smoke.test.js`, first Vitest test |
