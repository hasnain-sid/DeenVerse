# Ruhani Space — Audit & Improvement Plan

> **Scope**: `/ruhani` feature end-to-end — frontend pages, API layer, backend routes/services/data, cross-feature integration.
> **Date**: 2026-07-20
> **Verdict**: 🟢 **Phases A, B and C shipped (2026-07-20 → 2026-07-21).** The original verdict was 🔴 *non-functional in production; every save returns HTTP 422*.
>
> The feature now works, is trustworthy, and does what it was designed to do: guided questions are answerable fields rather than decoration, the Tafakkur → Tadabbur → Tazkia → Tafakkur spiral is a walkable cycle, Tadabbur works on all 6,236 ayahs, and the journal supports edit, delete, search, and export. **505 backend tests across 26 suites, all passing.**
>
> **Remaining**: Phase D (Guided Session, per-user rotation, custom habits, canonical ayah text + audio + tafsir) and Phase E (seasonal content, annual review, scholarly review process). Neither is required for the feature to stand on its own.
> **Companion doc**: [`docs/ruhani-hub-design.md`](../ruhani-hub-design.md) (original design). This document audits reality against it and proposes what to build next.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Verified Current State](#2-verified-current-state)
3. [P0 — Feature-Breaking Defects](#3-p0--feature-breaking-defects)
4. [P1 — Serious Defects & Trust Gaps](#4-p1--serious-defects--trust-gaps)
5. [Dead Code & Unwired Capability](#5-dead-code--unwired-capability)
6. [The Central Design Failure: Decorative Prompts](#6-the-central-design-failure-decorative-prompts)
7. [Improvement Ideas — Tier 1 (Foundational)](#7-improvement-ideas--tier-1-foundational)
8. [Improvement Ideas — Tier 2 (Depth)](#8-improvement-ideas--tier-2-depth)
9. [Improvement Ideas — Tier 3 (Differentiating)](#9-improvement-ideas--tier-3-differentiating)
10. [Content Strategy](#10-content-strategy)
11. [Accessibility, Performance & Privacy](#11-accessibility-performance--privacy)
12. [Testing Plan](#12-testing-plan)
13. [Phased Roadmap](#13-phased-roadmap)
14. [Measuring Success Without Gamifying](#14-measuring-success-without-gamifying)
15. [Appendix — File Reference Map](#15-appendix--file-reference-map)

---

## 1. Executive Summary

Ruhani Space is the most conceptually distinctive feature in DeenVerse. The design doc's core insight — that Tafakkur → Tadabbur → Tazkia form a **self-reinforcing spiral** rather than three tabs — is genuinely original and worth building well. The static content (30 Tafakkur topics, 31 Tadabbur ayahs, 20 Tazkia traits) is thoughtfully written and scholarly-sound.

But three things are true right now:

**One — it is broken.** A validation middleware added in commit `9d830cc` ("validation hardening") validates field names that the frontend never sends. Every attempt to save a reflection — Tafakkur, Tadabbur, or Tazkia — fails with `422 Validation failed: Practice type is required, Invalid practice type`. This was verified empirically, not inferred. See [§3.1](#31-every-practice-save-returns-422--p0).

**Two — the guided questions, which are the feature's entire pedagogical value, are decorative.** The backend has a complete `guidedAnswers: [{prompt, answer}]` pipeline through types, API client, service validation, and Mongo schema. Not one page ever populates it. All three practices render their carefully-authored questions as a static `<ul>` and then hand the user one undifferentiated textarea. The design doc explicitly warned against this: *"Guided questions are not optional in Phase 1 — they scaffold the reflection."* See [§6](#6-the-central-design-failure-decorative-prompts).

**Three — the spiral doesn't close.** Tafakkur → Tadabbur → Tazkia is wired. Tazkia → Tafakkur is not, and `TazkiaPage` actively navigates the user away 1.5 seconds after saving. The loop that the entire design rests on terminates in a redirect.

Everything else in this document follows from those three facts. The good news: item one is a ten-line fix, item two is a focused day of work, and item three is mostly data authoring.

**Recommended immediate sequence**: fix the validator → add regression tests → wire `guidedAnswers` → add journal delete → close the spiral. That sequence takes the feature from "broken" to "the best thing in the app" without touching architecture.

---

## 2. Verified Current State

### 2.1 What exists and works

| Layer | Artifact | State |
|---|---|---|
| Route | `/ruhani`, `/tafakkur`, `/tadabbur`, `/tazkia`, `/journal` | ✅ Wired in [`App.tsx:346-356`](../../frontend/src/App.tsx) |
| Nav | Sidebar + MobileNav entries | ✅ Present |
| Content API | 8 public GET endpoints | ✅ Working |
| Content data | 30 topics / 31 ayahs / 20 traits | ✅ Authored, good quality |
| Reading UX | Browse → select → read → reflect | ✅ Working |
| Cross-link | Tafakkur → Tadabbur → Tazkia | ⚠️ Partial (see §4.3) |
| Quran integration | "Enter Tadabbur Mode" button | ⚠️ Works for 31 of 6,236 ayahs (see §4.2) |
| Persistence | Save any reflection | 🔴 **Broken — 422** |
| Journal | List, paginate | ⚠️ Read-only, no delete/filter/search |
| Guided session | Phase 3 | ❌ Not built (store exists, unused) |

### 2.2 Content inventory (verified counts)

```
backend/data/tafakkurTopics.js   → 30 topics   (517 lines)
backend/data/tadabburAyahs.js    → 31 ayahs    (486 lines)
backend/data/tazkiaTraits.js     → 20 traits   (282 lines)
```

Content quality is high. Sample from `tafakkurTopics.js`:

> *"The moon marks time for humanity, waxing and waning in perfect rhythm. It has no light of its own — it only reflects. What does its humble glow teach you about your own light?"*

This is genuinely good spiritual writing. The problem is delivery, not substance.

### 2.3 The data model is richer than the UI

`spiritualPracticeSchema.js` supports `guidedAnswers`, `habitChecks`, `traitRating`, `linkedPracticeId`, `linkedSessionId`, `isPrivate`, `sharedToFeed`. The UI populates only `reflectionText`, `traitRating` (Tazkia only), and `habitChecks` (Tazkia only). **Roughly half the schema is unreachable from the product.**

---

## 3. P0 — Feature-Breaking Defects

### 3.1 Every practice save returns 422 — **P0** — ✅ FIXED (2026-07-20)

> **Status**: Fixed. `savePracticeValidationRules` now validates the real payload; 26 tests in
> [`backend/__tests__/ruhaniPractice.test.js`](../../backend/__tests__/ruhaniPractice.test.js) guard it.
> The regression test was verified to fail (422) against the old validator before the fix landed.
> The analysis below is retained as the record of the defect.

**Location**: [`backend/middlewares/validators.js:203-213`](../../backend/middlewares/validators.js#L203) *(pre-fix line numbers)*

```js
export const savePracticeValidationRules = () => [
    body('type')                                   // ← frontend sends `practiceType`
        .notEmpty().withMessage('Practice type is required')
        .isIn(['tafakkur', 'tadabbur', 'tazkia'])
        .withMessage('Invalid practice type'),
    body('content')                                // ← frontend sends `reflectionText`
        .optional()
        .isString()
        .isLength({ max: 2000 }),                  // ← schema allows 10,000
    handleValidationErrors
];
```

Mounted at [`ruhaniRoute.js:36`](../../backend/routes/ruhaniRoute.js#L36), which is mounted at [`index.js:143`](../../backend/index.js#L143).

The frontend payload ([`ruhaniApi.ts:4-13`](../../frontend/src/features/ruhani/api/ruhaniApi.ts#L4)) is `{ practiceType, sourceRef, sourceTitle, reflectionText, guidedAnswers?, habitChecks?, traitRating?, isPrivate? }`. Field `type` is never present, so `notEmpty()` fails and `isIn()` fails on the coerced empty string.

**Empirical verification** — a minimal Express harness mounting the real validator with the real frontend payload:

```
STATUS: 422
BODY  : {"msg":"Validation failed: Practice type is required, Invalid practice type"}
```

**Blast radius**: 100% of writes. Tafakkur, Tadabbur, and Tazkia saves all fail. Every journal is empty. `SpiritualPractice` has almost certainly received zero documents since `9d830cc` shipped.

**Why it wasn't caught**: there are no Ruhani tests. `backend/__tests__/` contains 21 test files; none touch Ruhani.

**Fix** — replace with a validator matching the actual contract and the actual schema limits:

```js
export const savePracticeValidationRules = () => [
    body('practiceType')
        .notEmpty().withMessage('Practice type is required')
        .bail()
        .isIn(['tafakkur', 'tadabbur', 'tazkia'])
        .withMessage('Invalid practice type'),

    body('sourceRef')
        .trim()
        .notEmpty().withMessage('sourceRef is required')
        .isLength({ max: 200 }).withMessage('sourceRef too long'),

    body('sourceTitle')
        .trim()
        .notEmpty().withMessage('sourceTitle is required')
        .isLength({ max: 500 }).withMessage('sourceTitle cannot exceed 500 characters'),

    body('reflectionText')
        .optional()
        .isString().withMessage('reflectionText must be a string')
        .isLength({ max: 10000 }).withMessage('Reflection cannot exceed 10,000 characters'),

    body('guidedAnswers')
        .optional()
        .isArray({ max: 20 }).withMessage('Too many guided answers'),
    body('guidedAnswers.*.prompt')
        .optional().isString().isLength({ max: 500 }),
    body('guidedAnswers.*.answer')
        .optional().isString().isLength({ max: 5000 }),

    body('habitChecks')
        .optional()
        .isArray({ max: 50 }).withMessage('Too many habit checks'),
    body('habitChecks.*.habit')
        .optional().isString().isLength({ max: 200 }),
    body('habitChecks.*.completed')
        .optional().isBoolean(),

    body('traitRating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('traitRating must be between 1 and 5'),

    body('isPrivate')
        .optional()
        .isBoolean(),

    handleValidationErrors
];
```

`.bail()` after `notEmpty()` prevents the confusing double error message.

**Note on layering**: `ruhaniService.savePractice()` ([`ruhaniService.js:79-126`](../../backend/services/ruhaniService.js#L79)) already duplicates all of these checks. Once the validator is correct, the service checks become redundant defence-in-depth. Keep them — the service is also reachable from future internal callers — but ensure the two never disagree on limits. Today they disagree on `reflectionText` max (2,000 vs 10,000).

### 3.2 Regression guard (ship with the fix)

Create `backend/__tests__/ruhaniPractice.test.js`. Minimum contract coverage:

```js
import request from 'supertest';
// ... existing test harness conventions from courseService.test.js

describe('POST /api/v1/ruhani/practice', () => {
  it('accepts the exact payload the frontend sends', async () => {
    const res = await agent.post('/api/v1/ruhani/practice').send({
      practiceType: 'tafakkur',
      sourceRef: 'the-sun',
      sourceTitle: 'The Sun',
      reflectionText: 'A reflection.',
    });
    expect(res.status).toBe(201);
  });

  it('persists guidedAnswers', async () => { /* ... */ });
  it('rejects an unknown practiceType with 422', async () => { /* ... */ });
  it('rejects reflectionText over 10,000 chars', async () => { /* ... */ });
  it('rejects traitRating outside 1–5', async () => { /* ... */ });
});
```

**The general lesson**: this class of bug — a validator written against an imagined schema — is invisible to type checking because the boundary is JSON over HTTP. Every `body('x')` in `validators.js` deserves an audit against its actual caller. This is likely not the only instance.

---

## 4. P1 — Serious Defects & Trust Gaps

### 4.1 A private spiritual journal with no delete — **P1, trust-critical** — ✅ FIXED (Phase B)

There is no `DELETE /api/v1/ruhani/practices/:id`. There is no edit endpoint. Once written, a reflection is permanent and unmodifiable.

This matters more here than almost anywhere else in the product. Muhasaba prompts explicitly invite users to record their failures: *"When did I lose my temper or complain today?"*, *"Am I using the health/wealth/time Allah gave me to disobey Him?"* Users are being asked to confess sins into a permanent, un-deletable, plaintext store.

A user who realises they cannot delete a confession will stop writing honestly — and dishonest muhasaba is worthless muhasaba. **This single gap can hollow out the feature's value even after the P0 is fixed.**

**Fix**:

```js
// routes
router.patch("/practices/:id", isAuthenticated, updatePracticeValidationRules(), updatePractice);
router.delete("/practices/:id", isAuthenticated, deletePractice);

// service — always scope to userId, never trust the id alone
export async function deletePractice(userId, practiceId) {
    if (!mongoose.Types.ObjectId.isValid(practiceId)) {
        throw new AppError("Invalid practice ID", 400);
    }
    const result = await SpiritualPractice.findOneAndDelete({ _id: practiceId, userId });
    if (!result) throw new AppError("Practice not found", 404);
    return { deleted: true };
}
```

Pair with a UI affordance on each journal card and an "Export my journal" action (JSON or plain text). Ownership of one's own spiritual record should be explicit and visible, not merely technically true.

### 4.2 "Enter Tadabbur Mode" silently fails for 99.5% of the Quran — **P1** — ✅ FIXED (Phase C)

[`QuranReaderPage.tsx:314-325`](../../frontend/src/features/quran/QuranReaderPage.tsx#L314) navigates with `preselectedAyahKey: ayahQuery.data?.referenceId`. `referenceId` is `` `${surah}:${ayah}` `` ([`quranService.js:89`](../../backend/services/quranService.js#L89)) — the format is correct.

But [`TadabburPage.tsx:21-26`](../../frontend/src/features/ruhani/TadabburPage.tsx#L21) resolves it against the 31 curated ayahs only:

```ts
const ayah = ayahs.find(a => a.verseKey === preselectedAyahKey);
if (ayah) setSelectedAyah(ayah);     // no else branch
```

For any of the other ~6,205 ayahs the user lands on the generic ayah-picker with no explanation of why the verse they chose isn't there. From the user's side this reads as a broken button.

**Fix — support free Tadabbur on any ayah.** This is the right answer, not a workaround: the practice of Tadabbur is not supposed to be restricted to a curated list.

```ts
// TadabburPage — fall back to fetching the real ayah
const curated = ayahs?.find(a => a.verseKey === preselectedAyahKey);
const { data: fetchedAyah } = useAyahByKey(preselectedAyahKey, { enabled: !!preselectedAyahKey && !curated });

// Build a synthetic TadabburAyah with the three generic methodology questions
const GENERIC_TADABBUR_QUESTIONS = [
  'What is Allah telling us in this verse?',
  'How does this verse relate to your life right now?',
  'What is one thing you will change after reading this?',
];
```

Curated ayahs keep their bespoke `context` + tailored questions and their `linkedTraitSlug`; uncurated ayahs get the generic scaffold. Store with `sourceRef = verseKey` exactly as now — the schema needs no change.

This also unlocks the far more valuable flow: **read the Quran normally → hit a verse that moves you → reflect on it immediately.** That is what Tadabbur actually is.

### 4.3 The spiral doesn't close — **P1, design-critical** — ✅ FIXED (Phase C)

The design doc's §6 specifies three mappings. Only two exist:

| Mapping | Data field | Status |
|---|---|---|
| Tafakkur → Tadabbur | `linkedAyahKey` | ✅ Wired ([`TafakkurPage.tsx:57-63`](../../frontend/src/features/ruhani/TafakkurPage.tsx#L57)) |
| Tadabbur → Tazkia | `linkedTraitSlug` | ✅ Wired ([`TadabburPage.tsx:182-190`](../../frontend/src/features/ruhani/TadabburPage.tsx#L182)) |
| Tazkia → Tafakkur | *(field does not exist)* | ❌ Missing |

Worse, `TazkiaPage` does the opposite of continuing the loop — it force-navigates home:

```ts
// TazkiaPage.tsx:93-95
timerRef.current = setTimeout(() => { navigate('/ruhani'); }, 1500);
```

So the user is ejected 1.5s after committing an action, with no chance to re-read what they wrote and no onward path. The spiral is a line segment.

**Fix**:
1. Add `suggestedTafakkurSlug` + `transitionPrompt` to each trait in `tazkiaTraits.js` (20 short authoring tasks).
2. Replace the auto-navigate with the same post-save choice UI the other two pages use — `Return to Hub` / `Continue to Tafakkur →`.
3. Set `linkedPracticeId` on each save so the journal can render the chain as one connected session.

Also unused: `TafakkurTopic.linkedTazkiaTraits` (a `string[]` on every topic, [`types.ts:13`](../../frontend/src/features/ruhani/types.ts#L13)) is authored in data but referenced nowhere. It enables a direct Tafakkur → Tazkia shortcut for users who want a two-step session.

### 4.4 Writing a long reflection while logged out destroys it — **P1** — ✅ FIXED (Phase B)

All three pages check auth *after* the user has written ([`TafakkurPage.tsx:31-35`](../../frontend/src/features/ruhani/TafakkurPage.tsx#L31)):

```ts
if (!isAuthenticated) {
    toast.error('Please log in to save your reflection');
    navigate('/login');       // reflection state is gone forever
    return;
}
```

A user can spend fifteen minutes on a deep reflection and lose all of it to a redirect. For a feature whose whole premise is unhurried depth, this is the worst possible failure mode.

**Fix — three parts, all cheap**:

1. **Draft autosave to localStorage**, debounced, keyed by practice + source:
   ```ts
   const draftKey = `ruhani-draft-${practiceType}-${sourceRef}`;
   // restore on mount, clear on successful save
   ```
   This also protects against accidental refresh, tab close, and mobile backgrounding — all common during a 20-minute reflection.

2. **Return-to destination on the login redirect**: `navigate('/login', { state: { from: location } })`.

3. **Tell the user up front**, not at the end — a quiet inline note when unauthenticated: *"You're not signed in. Your reflection is saved on this device; sign in to keep it in your journal."*

### 4.5 Everyone in the world gets the same topic on the same day — **P1 (product)**

[`ruhaniService.js:16-22`](../../backend/services/ruhaniService.js#L16) rotates by day-of-year modulo list length, globally. Combined with a 30-topic list, every user sees an identical 30-day loop, forever, in the same order.

Beyond the sameness, there's a subtler bug: the rotation is computed from **server local time**, so the "day" boundary is wrong for most of the world's Muslims and the topic changes mid-afternoon in some timezones.

**Fix**: seed the rotation per-user and exclude recent history.

```js
// Deterministic per-user rotation — same topic all day, different across users
export function getTodayTafakkurTopic(userId = null) {
    const dayIndex = Math.floor(Date.now() / 86_400_000);          // UTC-stable
    const seed = userId ? hashToInt(userId.toString()) : 0;
    return tafakkurTopics[(dayIndex + seed) % tafakkurTopics.length];
}
```

Then layer history-awareness (design doc Phase 4): exclude any topic the user has a `SpiritualPractice` for in the last 21 days before selecting. This is pure rule-based logic — no AI, no new infrastructure, and it makes the app feel like it knows the user.

---

## 5. Dead Code & Unwired Capability

Everything below is written, tested by nothing, and reachable by no one. This is *latent product* — it mostly needs wiring, not building.

| Artifact | Location | Status | Recommendation |
|---|---|---|---|
| `useRuhaniStore` (Zustand) | [`stores/ruhaniStore.ts`](../../frontend/src/features/ruhani/stores/ruhaniStore.ts) | Never imported anywhere | Keep — it is the Phase 3 session scaffold. Add a `// Phase 3` note so it isn't deleted as dead. |
| `useTodayTafakkurTopic` | [`useRuhani.ts:14`](../../frontend/src/features/ruhani/api/useRuhani.ts#L14) | Unused hook, live endpoint | **Wire into hub** — "Today's suggestion" (see §7.1) |
| `useTodayTadabburAyah` | [`useRuhani.ts:38`](../../frontend/src/features/ruhani/api/useRuhani.ts#L38) | Unused hook, live endpoint | **Wire into hub** |
| `useTadabburAyahByVerseKey` | [`useRuhani.ts:46`](../../frontend/src/features/ruhani/api/useRuhani.ts#L46) | Unused hook, live endpoint | Use for the §4.2 deep-link fix |
| `useRuhaniStats` | [`useRuhani.ts:90`](../../frontend/src/features/ruhani/api/useRuhani.ts#L90) | Unused hook, live endpoint | **Wire into journal** as a quiet private summary |
| `guidedAnswers` | Full stack | Never populated | **See §6 — highest-value fix in this document** |
| `journal?type=` filter | [`useRuhani.ts:81`](../../frontend/src/features/ruhani/api/useRuhani.ts#L81) accepts `type`; [`RuhaniJournalPage.tsx:12`](../../frontend/src/features/ruhani/RuhaniJournalPage.tsx#L12) never passes it | Backend filter works | Add three filter chips — ~20 lines |
| `TafakkurTopic.linkedTazkiaTraits` | Authored in all 30 topics | Referenced nowhere | Enables Tafakkur → Tazkia shortcut |
| `sharedToFeed` | Schema field | No UI, no service path | Decide: build it or drop it (see §9.4) |
| `isPrivate` | Schema field, always `true` | No UI toggle | Same decision |

There are **five live backend endpoints with zero frontend callers**. The hub page currently makes exactly one API call (`useRuhaniJournal` for a "last entry" date) while five richer endpoints sit idle.

---

## 6. The Central Design Failure: Decorative Prompts

> **Status**: ✅ **Fixed in Phase C.** The prompts are now answerable fields via
> [`GuidedReflectionForm`](../../frontend/src/features/ruhani/components/GuidedReflectionForm.tsx),
> and the journal renders the structure back. The analysis below is retained as the record of the
> problem and the reasoning behind the fix.

This deserves its own section because it is the difference between a journalling app with Islamic wallpaper and a genuine tool for spiritual practice.

### 6.1 What happens now

All three pages render their guided questions identically — as a static list:

```tsx
// TafakkurPage.tsx:137-141 (and TadabburPage.tsx:145-149, TazkiaPage.tsx:223-227)
<ul className="space-y-4 ... border-l-2 ...">
    {selectedTopic.guidedQuestions?.map((q, idx) => (
        <li key={idx} className="leading-relaxed">{q}</li>
    ))}
</ul>

<textarea placeholder="Write your reflection here... Take your time." />
```

Three carefully-authored, methodologically-sequenced questions become grey text above one big empty box.

### 6.2 Why this defeats the feature

The design doc identified the exact risk and the exact mitigation:

> *"Users not knowing how to reflect — Medium — blank journal = no engagement. **Guided questions are not optional in Phase 1 — they scaffold the reflection.** Free-form added in Phase 2."*

The implementation does precisely the inverse: free-form only, questions as decoration. The predicted failure mode — blank-page paralysis — is exactly what a single unlabelled textarea produces.

The questions aren't arbitrary either. Tadabbur's three follow a real methodology, documented in the data file's own header comment:

```
1. Comprehension — what is Allah telling us?
2. Personal application — how does this relate to my life?
3. Action — what will I change?
```

That progression *is* the practice. Collapsing it into one textarea discards the pedagogy and keeps only the prose.

### 6.3 The fix

Build one shared component and use it in all three pages. The backend already accepts the output — no API or schema change required.

```tsx
// components/GuidedReflectionForm.tsx
interface Props {
  prompts: string[];
  values: string[];
  onChange: (index: number, value: string) => void;
  /** Optional free-form field rendered after the guided ones */
  freeform?: { value: string; onChange: (v: string) => void };
}

export function GuidedReflectionForm({ prompts, values, onChange, freeform }: Props) {
  return (
    <div className="space-y-8">
      {prompts.map((prompt, i) => (
        <div key={i} className="space-y-3">
          <label
            htmlFor={`prompt-${i}`}
            className="block text-zinc-700 dark:text-zinc-300 leading-relaxed"
          >
            <span className="text-xs tracking-widest uppercase text-zinc-400 mr-3 tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </span>
            {prompt}
          </label>
          <textarea
            id={`prompt-${i}`}
            value={values[i] ?? ''}
            onChange={(e) => onChange(i, e.target.value)}
            placeholder="Take your time…"
            className="w-full min-h-[120px] resize-none rounded-2xl p-5 ..."
          />
        </div>
      ))}

      {freeform && (
        <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800/50">
          <label htmlFor="freeform" className="block text-zinc-500 text-sm">
            Anything else? (optional)
          </label>
          <textarea id="freeform" value={freeform.value}
                    onChange={(e) => freeform.onChange(e.target.value)} ... />
        </div>
      )}
    </div>
  );
}
```

Then in each page's save handler:

```ts
savePractice({
  practiceType: 'tafakkur',
  sourceRef: selectedTopic.slug,
  sourceTitle: selectedTopic.title,
  guidedAnswers: selectedTopic.guidedQuestions
      .map((prompt, i) => ({ prompt, answer: answers[i]?.trim() ?? '' }))
      .filter(a => a.answer.length > 0),          // don't store empty answers
  reflectionText: freeform.trim() || undefined,
});
```

**Design guardrails** — these matter for a contemplative feature:

- **Never require all fields.** Save should enable when *any* answer has content. Requiring all three turns reflection into homework and reintroduces performance pressure the design explicitly rejects.
- **Keep the free-form field.** Some sessions won't fit the scaffold. The design doc's Phase 2 intent was *both*, not a replacement.
- **Reveal progressively on mobile.** Three stacked textareas on a phone is a wall. Consider one-at-a-time with a soft "next" — this matches the unhurried pacing the feature is going for.

### 6.4 Journal must render the structure

Once `guidedAnswers` is populated, [`RuhaniJournalPage.tsx:99-104`](../../frontend/src/features/ruhani/RuhaniJournalPage.tsx#L99) needs to display it — currently it renders `reflectionText` only, so structured entries would appear blank. Render each Q&A pair with the prompt in a muted tone and the answer in the reading tone.

This upgrade also makes the journal genuinely re-readable: *"what did I say about tawakkul six months ago?"* becomes answerable in a way that a wall of undifferentiated prose never is.

---

## 7. Improvement Ideas — Tier 1 (Foundational)

*High impact, low-to-moderate effort, no architectural risk. Do these first.*

### 7.1 Make the hub alive instead of a static menu

The hub currently renders three hardcoded cards and a "Coming in Phase 3" placeholder at 60% opacity — advertising absence. Five unused endpoints could make it feel considered:

```
┌──────────────────────────────────────────────────────────┐
│  ◌  Ruhani Space                                         │
│  Quiet your mind. Deepen your connection.                │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  TODAY'S CONTEMPLATION                             │  │  ← useTodayTafakkurTopic
│  │  🌙  The Moon                          الـقـمـر    │  │
│  │  "It has no light of its own — it only reflects."  │  │
│  │  [ Begin · about 8 minutes ]                       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Or choose your own path                                 │
│  [ Tafakkur ]  [ Tadabbur ]  [ Tazkia ]                  │  ← smaller, secondary
│                                                          │
│  ─────────────────────────────────────────────────────   │
│  ↩  Continue where you left off                          │  ← unfinished draft
│     "Rain & Water" — started 2 days ago                  │
│                                                          │
│  📓  My Ruhani Journal · 14 entries                      │  ← useRuhaniStats
└──────────────────────────────────────────────────────────┘
```

Three changes, all using existing endpoints: a **today card** as the primary action, the three pillars demoted to secondary, and **resume-a-draft** (falls out of §4.4's autosave for free).

Remove the disabled "Coming in Phase 3" block entirely. A visible placeholder for something that doesn't exist reads as neglect; its absence reads as nothing at all.

### 7.2 Journal: delete, filter, search

- **Delete** per entry with confirmation — see §4.1, trust-critical.
- **Filter chips** — Tafakkur / Tadabbur / Tazkia. Backend and hook already support it; the page just never passes `type`.
- **Search** across `reflectionText` and `guidedAnswers.answer`. Add a Mongo text index:
  ```js
  spiritualPracticeSchema.index({ reflectionText: 'text', 'guidedAnswers.answer': 'text' });
  ```
  Scope every query to `userId` — a text search that leaks across users would be a severe privacy breach in this feature above all others.
- **Group by month** with sticky headers. A timeline of 200 undifferentiated cards is unreadable; *"March 2026 · 9 reflections"* is a spiritual record.

### 7.3 Fix the Tazkia post-save dead end

Covered in §4.3. Replace the 1.5s auto-navigate with the choice UI the other two pages already have. Small change, removes a jarring moment at the emotional peak of the session.

### 7.4 Show the ayah properly in Tadabbur

`arabicText` is a hand-copied snippet in the data file, not the canonical text. Meanwhile `quranService.js` serves verified Arabic, translation, and audio.

- Fetch canonical text by `verseKey` rather than trusting a duplicated string — removes a whole class of transcription risk in Quranic text, which is the highest-stakes accuracy surface in the entire app.
- Add **recitation audio**. Hearing the ayah before pondering it is the traditional practice and the infrastructure already exists.
- Add a **tafsir excerpt** behind a disclosure. Tadabbur without any scholarly anchor risks untethered personal interpretation — a real concern with Quranic text specifically.
- Keep the curated `context` paragraph; it's doing different, complementary work.

### 7.5 Accessibility pass

See §11.1 for the full list. Several are one-line fixes and at least one (the unlabelled rating slider) makes a required field unusable with a screen reader.

---

## 8. Improvement Ideas — Tier 2 (Depth)

### 8.1 Build the Guided Session (design doc Phase 3)

The store exists. The content links exist. This is the feature's headline concept and it's the last major piece unbuilt.

Recommended deviation from the original spec: **make the timer optional and silent by default.** The design philosophy section rightly rejects performance pressure — a visible countdown during contemplation contradicts that. Consider an ambient progress indication with no numbers, and no sound at transitions unless enabled.

Session allocation from the design doc (10/20/40 min) is sound. Persist via the specced `spiritualSessionSchema.js` and set `linkedSessionId` on each of the three practices so the journal can render a completed session as one unit.

### 8.2 Muhasaba habits that are actually the user's

[`TazkiaPage.tsx:9-13`](../../frontend/src/features/ruhani/TazkiaPage.tsx#L9) hardcodes three habits:

```ts
const DEFAULT_HABITS = [
  { id: 'fajr',  text: 'Prayed Fajr on time' },
  { id: 'quran', text: 'Read a portion of Quran' },
  { id: 'smile', text: 'Consciously smiled at someone' },
];
```

They live in localStorage keyed by date, so they don't sync across devices and vanish when the browser clears storage. And they're the same for a new Muslim and a hafiz.

**Improve**: let users add/remove/reorder their own habits, persisted server-side. Suggest defaults on first use rather than imposing them. Someone working on anger has different daily checks than someone working on prayer consistency — and the trait they've selected is a strong hint the app already has.

### 8.3 Rule-based personalisation (design doc Phase 4, no AI needed)

The data already encodes the graph — `linkedTazkiaTraits`, `linkedTraitSlug`, `linkedTafakkurSlugs`, `theme`. Traversing it gives genuinely personal behaviour with plain queries:

- **Rotation with memory** — exclude topics practised in the last 21 days.
- **Trait follow-up** — a `traitRating` of 1–2 surfaces that trait again in ~7 days: *"Last week sabr felt hard. Sit with it again?"*
- **Thematic streaks** — three consecutive reflections tagged `mercy-and-provision` earns a gentle note connecting them.
- **Return after absence** — a lapsed user gets a low-friction re-entry, never a guilt message. Tone here is everything: *"Welcome back"*, never *"You've missed 12 days."*

This is a service-layer feature with no new infrastructure and no model calls.

### 8.4 Rich reflection input

- **Autosave drafts** (§4.4) — the single highest-value input improvement.
- **Voice notes.** Many people reflect far better aloud than in writing, and this materially expands who can use the feature — including users more fluent in a language they don't type comfortably.
- **Word-count-free UI.** No counters, no minimums. Counters convert reflection into output.

### 8.5 Notification suppression while in the hub

The design doc calls for it: *"the hub should suppress notification badges while active."* Currently nothing in `/ruhani` touches notification state — the sacred-space contract is asserted in the doc but not enforced in code. Given a notification bell renders in the shell above every Ruhani page, this is a visible gap.

---

## 9. Improvement Ideas — Tier 3 (Differentiating)

### 9.1 Seasonal and temporal awareness

Islamic practice is deeply time-shaped, and the app currently ignores that entirely:

- **Ramadan** — a dedicated 30-day Tadabbur track through a juz-per-day.
- **Last third of the night** — if opened then, acknowledge it. That's when the people this feature is built for are awake.
- **Dhul-Hijjah first ten days**, **Muharram**, **Laylat al-Qadr** — surface matching content.
- **Friday** — a weekly muhasaba, aligning with the traditional weekly rhythm.

None of this requires new architecture — a date-to-content mapping and Hijri conversion.

### 9.2 The annual review

Once a year: *"You reflected 47 times. Sabr appeared most often. Here is what you wrote the first time, and the last time."*

Presented as a private mirror, never a performance summary. This is the kind of artifact users keep for years, and no competing app has it.

### 9.3 Depth over breadth in content

30 Tafakkur topics is a month. Someone practising daily exhausts the app in four weeks.

Rather than racing to 100 shallow topics, consider **multi-day topics** — "The Ocean, day 3 of 5" — each day a different facet. This matches how contemplative traditions actually work and turns 30 topics into a year of material.

### 9.4 Decide the sharing question deliberately

`sharedToFeed` and `isPrivate` exist in the schema with no UI. Before building either, settle the tension:

The design doc is emphatic that Ruhani is a *"side room reserved for i'tikaf"* — no feed, no social. Sharing reflections invites exactly the performative dynamic the whole feature is constructed to avoid, and there's a specific Islamic concern here about *riya* (spiritual showing-off) that the design's own risk table gestures at.

**Recommendation: don't build sharing for reflections.** If sharing is wanted, share the *prompt* — "I'm contemplating The Moon today" — never the reflection. Then either drop `sharedToFeed` from the schema or comment it as deliberately unbuilt, so a future contributor doesn't wire it up on the assumption it was merely forgotten.

---

## 10. Content Strategy

### 10.1 Scholarly review is a prerequisite, not a nicety

Every trait carries a Hadith rendered as a direct quotation, and every Tadabbur entry carries Arabic Quranic text plus translation. Right now these are hand-entered strings in JS files with **no attribution grading, no reviewer, and no provenance record.**

The design doc's own risk table rates this *High impact*: *"incorrect Quran refs or weak Hadiths would be harmful."* The mitigation it specifies — content restricted to Bukhari/Muslim and verified references — has no enforcement mechanism in the codebase.

**Recommended**:
1. Add `gradeNote` and `source` fields to every Hadith entry (e.g. `"Sahih al-Bukhari 6114"`), and display attribution in the UI. `TazkiaPage` currently shows the Hadith text with only a parenthetical collection name inside the string.
2. Pull Quranic Arabic from `quranService` rather than duplicating it in a data file (§7.4).
3. Record a reviewer and date in each data file's header comment.
4. Add a checklist item to `.agents/workflows/new-feature.md` for any PR touching `backend/data/*`.

This is the one area where a bug is not merely a bug.

### 10.2 Content gaps worth filling

- **Tadabbur is Tafakkur-shaped.** Many of the 31 ayahs were chosen to link to creation topics. Missing: hardship, grief, forgiveness after sin, death of a loved one, doubt, loneliness — the states in which people actually reach for the Quran.
- **No content for spiritual low points.** Someone opening this app at 2am in despair finds a menu of creation topics. A "when your heart is heavy" entry path would serve real need.
- **Trait balance.** 20 traits skew toward the inward (sabr, zuhd, khushoo). Lighter coverage of the social (justice in dealings, speech, parents, neighbours) where character is most tested.

### 10.3 Language

Arabic titles exist for topics and traits but everything else is English-only. Given the audience, Urdu/Arabic/Indonesian translation of prompts would be significant reach. Structure the data files for it now — a `translations` key — even before any translation exists, so it isn't a migration later.

---

## 11. Accessibility, Performance & Privacy

### 11.1 Accessibility findings

| Issue | Location | Fix |
|---|---|---|
| Rating slider has no accessible name | [`TazkiaPage.tsx:209-216`](../../frontend/src/features/ruhani/TazkiaPage.tsx#L209) | `aria-label` + `aria-valuetext="3 of 5"`. This field is **required to save** — currently a screen-reader user cannot complete Tazkia. |
| Every textarea is unlabelled | All three pages | Real `<label htmlFor>`; placeholder is not a label |
| Habit checkboxes are `<button>`, not checkboxes | [`TazkiaPage.tsx:131-143`](../../frontend/src/features/ruhani/TazkiaPage.tsx#L131) | `role="checkbox"` + `aria-checked`, or a real `<input type="checkbox">` |
| Low contrast body text | Pervasive — `text-zinc-500` on `zinc-950` | ≈3.6:1, below WCAG AA 4.5:1. Move to `zinc-400` for body copy. The muted aesthetic is right; it just needs to clear the floor. |
| Animations ignore reduced-motion | `animate-in fade-in duration-700` throughout | Gate on `prefers-reduced-motion` |
| Arabic text lacks language/direction attributes | Tadabbur, all Arabic titles | `lang="ar" dir="rtl"` — affects screen-reader pronunciation |
| ~~`dir-rtl` is not a Tailwind class~~ | `TadabburPage.tsx:87,121` | ✅ Fixed — **and this document's original claim was overstated.** `dir-rtl` is indeed undefined, but `.font-arabic` in [`globals.css:103-106`](../../frontend/src/globals.css#L103) already sets `direction: rtl`, so Arabic was **always rendering correctly**. `dir-rtl` was dead code, not a visual bug. Replaced with the `dir="rtl" lang="ar"` attributes the rest of the codebase uses. |
| No focus-visible styling on cards | Topic/trait/ayah grids | Keyboard users can't see where they are |
| Loading states are unannounced spinners | All pages | `role="status"` + `aria-live="polite"` |

### 11.2 Performance

Largely fine — static content, 1-hour `staleTime`, lazy-loaded routes. Two notes:

- **No server-side caching.** The design doc specifies Redis for topic/trait content. Currently every request re-serves from a module import. Low urgency (data is in-process and tiny) but the endpoints are public and unauthenticated — worth a cache header at minimum: `Cache-Control: public, max-age=3600`.
- **The full list is fetched to resolve one item.** `useRuhaniTopics()` pulls all 30 topics with full prompt text to render a grid. Fine at this size; revisit past ~100 items with a list/detail split.

### 11.3 Privacy

This feature stores the most sensitive data in the product — confessed sins, spiritual struggles, personal failures.

| Concern | Current | Recommendation |
|---|---|---|
| Deletion | ✅ Hard delete, ownership-scoped (Phase B) | Done |
| Export | ✅ JSON download (Phase B) | Done |
| Encryption at rest | Plaintext in Mongo | Consider field-level encryption for `reflectionText`/`guidedAnswers`. Weigh against losing text search — but this content warrants the tradeoff conversation. |
| Admin access | Unaudited | Verify no admin/moderation tooling can read `SpiritualPractice`. If any exists, it should be explicitly excluded. |
| Retention | Indefinite | Offer opt-in auto-delete (e.g. "keep 1 year") |
| Search leakage | N/A yet | When adding text search (§7.2), scope to `userId` in the query itself, never filter after |
| Rate limit | 30/hr ([`rateLimiter.js:202`](../../backend/middlewares/rateLimiter.js#L202)) | Reasonable. Note it's keyed `req.user \|\| req.ip` — shared-IP users could collide when unauthenticated, though saves require auth anyway. |

A short, human privacy note inside the journal — *"Only you can read this. We never show it to anyone."* — would do real work for a feature that depends on candour.

---

## 12. Testing Plan

Ruhani has **zero test coverage**. That is how §3.1 shipped and stayed shipped.

**Backend** — `backend/__tests__/ruhaniService.test.js` + `ruhaniPractice.test.js`:
- Contract test posting the literal frontend payload (would have caught the P0)
- Validation boundaries: bad `practiceType`, oversized `reflectionText`, `traitRating` 0/6, oversized arrays
- `guidedAnswers` round-trip persistence
- **Ownership isolation**: user A cannot read, update, or delete user B's practice — assert on `getPracticeById`, and on delete/update once added
- Pagination correctness and clamping (`limit` > 100, `page` < 1)
- Rotation determinism: same day → same topic; per-user seed → different users differ
- Content integrity: every `linkedAyahKey` resolves to a real ayah; every `linkedTraitSlug` resolves to a real trait; every slug unique. *This class of test catches broken cross-links at CI time rather than in a user's session.*

**Frontend** — component tests:
- Save is disabled with empty input, enabled with content
- Guided answers are assembled into the right payload shape
- Draft autosave restores after unmount
- Unauthenticated save preserves text rather than discarding it

**One end-to-end spiral test**: Tafakkur → save → Continue to Tadabbur → save → Continue to Tazkia → save → all three appear in journal. That single test protects the feature's core concept.

---

## 13. Phased Roadmap

### Phase A — Restore function (½ day) — ✅ COMPLETE 2026-07-20

| # | Task | Files | Status |
|---|---|---|---|
| A1 | Fix `savePracticeValidationRules` | [`validators.js:202-257`](../../backend/middlewares/validators.js#L202) | ✅ Done |
| A2 | Contract + validation tests | [`__tests__/ruhaniPractice.test.js`](../../backend/__tests__/ruhaniPractice.test.js) | ✅ 26 tests passing |
| A3 | Align service limits with schema | `ruhaniService.js:100` | ✅ No change needed — see note |
| A4 | Verify all three save paths | — | ✅ Covered by A2 |

**A1 — what changed.** The validator now checks `practiceType` / `sourceRef` / `sourceTitle` /
`reflectionText` / `guidedAnswers[]` / `habitChecks[]` / `traitRating` / `isPrivate`, matching
`SpiritualPracticePayload` and `spiritualPracticeSchema`. `.bail()` after the `practiceType`
presence check prevents the double error message. Note it validates `guidedAnswers` — so the
Phase C work in §6 needs no further backend change.

**A2 — the tests.** 26 tests across four groups: client contract (all three practice types +
`guidedAnswers` round-trip), validation boundaries (missing/unknown fields, length and rating
limits, including exact-boundary accept cases), ownership isolation (user B cannot read or list
user A's practices), and pagination clamping. They run the real validator + real controller +
real service against `mongodb-memory-server`, so the full request contract is exercised rather
than mocked.

**Verification that the guard works**: the validator was temporarily reverted to the buggy
version and the contract test failed with `Expected: 201, Received: 422`, then passed again once
restored. A regression test that has never been observed failing is not a regression test.

**A3 — correction to this document's original claim.** The roadmap said to change
`ruhaniService.js:100` from 2,000 to 10,000. That was wrong: the *service* already capped at
10,000 correctly, matching `spiritualPracticeSchema`. The 2,000 limit existed only in the broken
validator, so A1 resolved the mismatch on its own. No service change was made.

**A4.** Verification is automated rather than manual — the A2 tests exercise the Tafakkur,
Tadabbur, and Tazkia payload shapes end-to-end through the real stack and assert persistence.
Not yet exercised through the browser UI with a real session.

**Full-suite status**: 446 of 455 backend tests pass. The 9 failures are all in
`scholarEarnings.test.js` and are **pre-existing and unrelated** — a `MongoMemoryReplSet`
startup timeout under parallel load. Confirmed by running the suite without the new Ruhani file
(identical 9 failures) and by running `scholarEarnings` in isolation (all 9 pass in ~10s).
Worth fixing separately: raise that suite's instance-start timeout or mark it `--runInBand`.

**Next**: Phase B (trust — delete/export, draft autosave, accessibility), then Phase C, which is
where the feature starts doing what it was designed to do.

### Phase B — Trust & integrity — ✅ COMPLETE 2026-07-21

| # | Task | Status |
|---|---|---|
| B1 | `DELETE` + `PATCH /practices/:id` with ownership scoping, plus journal UI | ✅ Done |
| B2 | Draft autosave; preserve text through the login redirect | ✅ Done |
| B3 | Accessibility pass | ✅ Done |
| B4 | Journal export | ✅ Done |
| B5 | Ownership-isolation tests | ✅ Done — 41 tests total |

**B1 — editing and erasure.** New `updatePractice` / `deletePractice` in
[`ruhaniService.js`](../../backend/services/ruhaniService.js), exposed as `PATCH` and `DELETE
/practices/:id`. Both scope the Mongo query by `userId` — ownership is enforced in the query
itself, never by checking the document after lookup. `practiceType`, `sourceRef`, and
`sourceTitle` are deliberately **immutable**: they identify what was contemplated, and letting
them change would detach an entry from its source. A test asserts they survive a client that
tries to send them. Deletion is a **hard delete**, not a soft flag — a user who asks for a
confession to be erased should have it erased.

Journal UI gained per-entry edit (inline textarea) and delete behind a two-step inline confirm.
No `window.confirm`, and no dialog dependency added.

**B2 — drafts.** New [`useReflectionDraft`](../../frontend/src/features/ruhani/hooks/useReflectionDraft.ts)
hook, wired into all three practice pages. Debounced (600ms) localStorage writes keyed by
practice + source; restores on mount and when switching topic; cleared on successful server save;
drafts older than 30 days are swept so storage cannot grow without bound. The stored record
carries `practiceType` / `sourceTitle` / `updatedAt` so the Phase C "continue where you left off"
surface (§7.1) can enumerate drafts without a format change.

The login redirect now passes `{ from: location }`. **Correction to this document**: §4.4
implied this needed building on both ends — in fact [`LoginPage.tsx:108`](../../frontend/src/features/auth/LoginPage.tsx#L108)
already read `state.from.pathname`, so only the caller needed fixing. Combined with drafts, a
reflection now survives the sign-in round trip twice over.

Unauthenticated users are also told *up front* via `DraftStatus` that their writing is kept
locally — replacing the old behaviour of revealing the auth requirement only at the moment of
saving, after the writing was done.

**B3 — accessibility.** The rating slider now has a real `<label>`, `aria-valuetext`
("3 of 5 — Mixed"), and a visible textual value; previously it had no accessible name at all
while being **required to save**, so Tazkia was uncompletable with a screen reader. Habit
buttons became `role="checkbox"` with `aria-checked`. Every textarea gained a real label.
Body-copy contrast raised off `zinc-500` (≈3.6:1) to `zinc-400`/`zinc-600`. Focus-visible rings
added to all card grids and controls. Spinners announce via `role="status"`.

A `prefers-reduced-motion` block was added to [`globals.css`](../../frontend/src/globals.css) —
note this is **app-wide, not Ruhani-scoped**, as the app had no reduced-motion handling anywhere.
Durations collapse to ~0 rather than `animation: none`, so anything awaiting `animationend`
still fires.

**B4 — export.** `GET /journal/export` returns the full journal as a downloadable JSON
attachment, stripped of `userId` and `__v`.

**Verification**: 41 Ruhani tests pass; full backend suite **470/470**; `tsc --noEmit` clean;
production build succeeds.

**Note on the flaky suite**: an intermediate full-suite run showed 121 failures across 5 suites,
all `mongodb-memory-server` startup timeouts, while the machine was loaded from the frontend
build (447s vs the usual ~37s). A clean re-run passed 470/470. This is the same load-sensitive
flake described under Phase A — real, worth fixing, and unrelated to feature code.

### Phase C — Deliver the design's intent — ✅ COMPLETE 2026-07-21

| # | Task | Status |
|---|---|---|
| C1 | **`GuidedReflectionForm` — wire `guidedAnswers` in all three pages** | ✅ Done |
| C2 | Journal renders structured Q&A | ✅ Done |
| C3 | Close the spiral: Tazkia → Tafakkur; remove auto-navigate | ✅ Done |
| C4 | Set `linkedPracticeId` to chain a session | ✅ Done |
| C5 | Free Tadabbur on any ayah | ✅ Done |
| C6 | Hub: today's suggestion, resume draft, stats | ✅ Done |
| C7 | Journal filter chips + search | ✅ Done |

**C1 — the prompts are now answerable.** [`GuidedReflectionForm`](../../frontend/src/features/ruhani/components/GuidedReflectionForm.tsx)
renders each prompt as a numbered label bound to its own textarea, plus an optional free-form
field. All three pages use it, and the `guidedAnswers` pipeline that had been dead since it was
written is now populated end to end. Blank answers are filtered out before saving — **answering
one of three prompts is a complete reflection, not a partial one**, and saving is enabled as soon
as *anything* is written. Requiring every field would have turned reflection into homework, which
is the performance pressure the design explicitly rejects.

In Tazkia the free-form field is relabelled "Your commitment — what will you do differently?"
with `actionTemplate` as its placeholder, so the muhasaba scaffold is added *without* losing the
action commitment the practice was built around.

**C2 — journal.** Entries render each prompt above its answer, with the free note separated
below. This was required rather than cosmetic: without it every new structured entry would have
displayed blank. Edit mode was extended to match — it edits each guided answer individually,
with prompts preserved from the original entry (a user revises their answers, not the questions).

**C3 — the spiral closes.** Added `suggestedTafakkurSlug` + `transitionPrompt` to all 20 traits
in [`tazkiaTraits.js`](../../backend/data/tazkiaTraits.js), each pairing a trait with a fitting
sign in creation — sabr → trees-and-seasons, rahma → rain-and-water, tawadu → the-moon,
husn-al-dhann → clouds ("the heaviest, darkest clouds are the ones carrying the rain"). Twenty
distinct topics, no repeats.

The 1.5s auto-navigate is gone. Tazkia now ends with the transition prompt and a
"Continue to Tafakkur" button, and `TafakkurPage` honours `preselectedTopicSlug` so the loop
actually lands. **Tafakkur → Tadabbur → Tazkia → Tafakkur is now a walkable cycle.**

**C4 — chaining.** `linkedPracticeId` flows through router state at each hand-off. The server
verifies the referenced practice belongs to the same user before storing it; a stale or foreign
link is **dropped rather than failing the save**, because the user's reflection matters more than
the chain metadata. Tested in both directions.

**C5 — free Tadabbur.** New `GET /quran/ayah/by-key/:verseKey` resolves "7:57" via
`findAyahIdBySurah` and returns canonical text. `TadabburPage` falls back to it whenever a
preselected ayah isn't in the curated 31, applying the generic three-question methodology.
**The Quran reader's "Enter Tadabbur Mode" button now works for all 6,236 ayahs instead of 31** —
and the more valuable flow is unlocked: read normally, hit a verse that moves you, reflect on it
there and then. A failed fetch now shows an explanation instead of silently dumping the user on
the picker.

**C6 — the hub is alive.** Today's contemplation is the primary action (using the
`useTodayTafakkurTopic` hook that had never been called), the three pillars are demoted to
secondary, entry count comes from `useRuhaniStats`, and an unfinished draft surfaces as
"Continue where you left off" *above* any new suggestion. The disabled "Coming in Phase 3" block
is gone — a visible placeholder for something that doesn't exist reads as neglect.

**C7 — search.** Server-side, case-insensitive, across `reflectionText`, `sourceTitle`, and
`guidedAnswers.answer`. The term is regex-escaped (a test asserts `.*` matches nothing) and the
`$or` sits **inside** the `userId`-scoped filter rather than being applied afterwards, so results
can never cross users. Debounced 350ms client-side.

**Verification**: 505 backend tests across 26 suites, all passing — including 14 new content-integrity
tests that walk every cross-link in the curated data and fail if any slug stops resolving. That
class of bug (a typo silently dropping a "continue" button) is exactly what previously had no guard.
`tsc --noEmit` clean; production build succeeds.

**Not done, deliberately**: progressive one-prompt-at-a-time reveal on mobile (§6.3 lists it as a
"consider"). Three stacked textareas is still a lot on a phone — worth revisiting with real usage.

### Phase D — Depth (1–2 weeks) 🟢

Guided Session (Phase 3); per-user rotation with history; custom habits; canonical ayah text + audio + tafsir; notification suppression.

### Phase E — Differentiation (ongoing) 🔵

Seasonal content; annual review; multi-day topics; content expansion for hardship/grief; translation scaffolding; scholarly review process.

**Effort vs. impact — if only three things get done: A1, C1, B1.** Those are, in order, "it works at all", "it does what it was designed to do", and "users can trust it with honest writing."

---

## 14. Measuring Success Without Gamifying

The design doc's stance — *"this is for the heart, not for performance"* — should extend to analytics. Measuring the wrong thing here will bend the product toward engagement patterns the feature exists to reject.

**Do measure**:
- Completion rate (started → saved) — a proxy for whether the scaffold works
- Median reflection length — depth, not frequency
- Spiral completion — how often users continue rather than stop at one practice
- Return-after-lapse — does the feature welcome people back
- Journal re-reads — high signal that the record has lasting value

**Don't build**: public streaks, leaderboards, badges, comparative stats, "you're in the top 10%" messaging, or push notifications guilting return. Every one of these would work in the short term and corrode the thing being built.

**Never instrument reflection content itself** — not for topic modelling, not for sentiment, not for recommendations. Users must be able to assume nothing reads what they write.

---

## 15. Appendix — File Reference Map

### Frontend
```
frontend/src/features/ruhani/
├── RuhaniHubPage.tsx          Static; 1 API call; disabled Phase 3 block at :86-97
├── TafakkurPage.tsx           Prompts decorative :137-141 · auth-after-write :31-35
├── TadabburPage.tsx           Prompts decorative :145-149 · deep-link no-op :21-26
├── TazkiaPage.tsx             Prompts decorative :223-227 · auto-nav :93-95
│                              hardcoded habits :9-13 · unlabelled slider :209-216
├── RuhaniJournalPage.tsx      No delete/filter/search · renders reflectionText only :99-104
├── types.ts                   linkedTazkiaTraits :13 unused
├── api/ruhaniApi.ts           Correct payload shape :4-13
├── api/useRuhani.ts           4 dead hooks: :14 :38 :46 :90
└── stores/ruhaniStore.ts      Entirely unused — Phase 3 scaffold
```

### Backend
```
backend/
├── middlewares/validators.js  🔴 :203-213 — the P0
├── middlewares/rateLimiter.js practiceLimiter :202
├── routes/ruhaniRoute.js      :36 mounts broken validator · no DELETE/PATCH
├── controller/ruhaniController.js
├── services/ruhaniService.js  Global rotation :16-22 · limit mismatch :100
├── models/spiritualPracticeSchema.js   ~half the fields unreachable
├── models/spiritualSessionSchema.js    ❌ not built (Phase 3)
└── data/
    ├── tafakkurTopics.js      30 topics
    ├── tadabburAyahs.js       31 ayahs
    └── tazkiaTraits.js        20 traits · no suggestedTafakkurSlug (spiral gap)
```

### Cross-feature
```
frontend/src/features/quran/QuranReaderPage.tsx   :314-325  Tadabbur button (99.5% no-op)
frontend/src/components/layout/Sidebar.tsx        :51
frontend/src/components/layout/MobileNav.tsx      :26
frontend/src/App.tsx                              :346-356
backend/index.js                                  :143
```

---

*Audit performed 2026-07-20 against branch `main`. The P0 in §3.1 was verified by executing the real validator against the real frontend payload, not by inspection alone.*
