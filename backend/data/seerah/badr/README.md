# Badr seed data

All four files hold **human-verified content**, entered from specifications supplied by the
project owner. None of them holds placeholders.

## Provenance and what is still missing

Event summaries are original prose written to a supplied description, not copied from any
source. Most datings carry year only (`Ibn Hisham, Sira`, 2 AH) — month and day were not
sourced for them and are deliberately absent rather than guessed. Two events now carry a
supplied day: `reluctant-departure` (12 Ramadan 2 AH) and `battle-of-badr`
(17 Ramadan 2 AH).

### `tafsir.json` — summaries, not excerpts

The nine passages cover 8:1, 8:5, 8:9, 8:17 and 8:67 across two works: Ibn Kathir on all
five verses, al-Jalalayn on four of them. Every `summary` is original prose describing what
the named work says about that ayah — not a translation and not a quotation of either work.

`externalUrl` and `arabicExcerpt` are `null` on all nine. No licensed source for the Arabic
was available for these passages, and §3.5 is explicit that the field stays null rather than
carrying text from a restricted origin; an `externalUrl` was likewise not supplied, and a
plausible-looking one is not something to infer.

**There is deliberately no al-Jalalayn passage on 8:1.** Four verses carry both works and
8:1 carries only Ibn Kathir. That asymmetry is the record of a research result — no distinct
Jalalayn passage on 8:1 was confirmed — not an oversight to be tidied up by writing one.

### Ayat outside Surah al-Anfal

Two linked ayat sit outside al-Anfal: `22:19` (the disputants, tied to the opening single
combat) and `2:249` (Talut's river crossing, tied to the size of the Muslim force). That is
expected rather than a data error — Badr-related reports legitimately cite verses from
elsewhere in the Qur'an, and the graph keys ayah endpoints by verse key alone, so nothing
constrains an edge to one surah.

### `narrativeOrder` is chronological, and is a curatorial call

`narrativeOrder` runs 1-5 in the order the events happened, so the segment reads straight
through: `reluctant-departure` (1), `dua-for-reinforcement` (2), `battle-of-badr` (3),
`spoils-dispute` (4), `captives-deliberation` (5). The array in `events.json` is kept in the
same order so the file cannot drift from the field. The schema comment is worth keeping in
view - this is "curatorial, not a historical claim".

Only one placement needed a judgement. `dua-for-reinforcement` sits **before**
`battle-of-badr`, not after: the supplication and the answer of Q 8:9 come while the outcome
is still open, and `battle-of-badr` is the entry that carries the outcome ("The day ended in
victory"). Placing the supplication after it would put an event after its own resolution.
Its own `dating` carries year only, so the field is doing the ordering here, not the date.

Two schema-required fields were not in the supplied specification and hold minimal
restatements of the fields that were, pending author sign-off:

| Field | What is there now |
|---|---|
| `links[].source.locator` | `"on <verseKey>"` — positional only, adds no citation. Two exceptions: the `8:17` link, whose locator carries the volume/page citation, and the nine `explained_by` links, where `"on <verseKey>"` *is* the citation because it matches the locator of the passage being cited |
| `links[].grading.basis` | a one-line restatement of `source.work` + `grading.label` |

### `8:17` — entered, ungraded, and blocked

`8:17` (the dust-throwing incident) was previously excluded outright because no specific
sahih hadith was confirmed for it. It is now **entered, but deliberately not published**:

- `hadith.json` carries the Musnad Ahmad report as **`ungraded`**, grader
  `"unverified — pending scholar review"`. It is **not** graded sahih, and must not be
  regraded without a scholar examining the chain.
- `links.json` carries `8:17 -[references]-> battle-of-badr` with `grading.label`
  **`no-isnad`** — the weakest label the enum offers. `sahih`/`hasan` would assert a grade
  nobody has given, and `textual`/`curatorial` would misdescribe what the edge rests on.
- Both records are marked **`_needsScholarReview: true`**, and the link is **held at
  `draft`** by the seed script (see below). `draft` is the one link state that is neither
  publishable nor queued to a reviewer, so the edge is invisible until the flag is cleared.

**Do not remove `_needsScholarReview` until a human has verified the isnad.** Clearing it
is what submits the edge — that is the whole point of the flag.

## Outstanding

- **`ahmad:1/368` is a dangling node — the only one.** The Musnad Ahmad ref is cited in the
  `8:17` link's `source.work`, but `source.work` is a string, not an edge — nothing points
  *at* the node, so a dangling-node check reports it. The fix is an `attested_by` edge from
  `battle-of-badr` to it, which was not authored because the edge would carry the same
  unverified isnad and would need holding at `draft` too. Until then the node is
  unreachable from the graph, which is also what keeps it out of the UI: `HadithRef` has
  no `review.state` of its own, so unreachability is its only visibility gate.

  `bukhari:3969` and `bukhari:3957` dangled for a while for the same structural reason —
  each was cited only in the `source.work` of the `22:19` and `2:249` links. They now carry
  `attested_by` edges from `battle-of-badr` and are reachable. That was the ordinary fix,
  available to them because both are sahih by inclusion; `ahmad:1/368` cannot take it while
  its isnad is unverified. **A citation in `source.work` never makes a node reachable** —
  if you add a hadith ref and cite it only there, expect it to dangle.
- **Volume.** M1's targets are ≥10 events, ≥25 hadith refs, ≥10 tafsir passages and ≥60
  links. Current: 5 / 7 / 9 / 23 (22 submitted to `unreviewed`, 1 held at `draft`). The
  tafsir axis is one passage short of its target; events, hadith and links are all still
  well under.

## Holding an edge at `draft`: `_needsScholarReview`

A link record marked `"_needsScholarReview": true` is created and validated as normal, but
the seed script **skips the submit step** and leaves `review.state` at `draft` instead of
`unreviewed`. A run announces every held edge under a `🔒` heading.

Like every `_`-prefixed key here it is a seed-data annotation, stripped by `stripMeta`
before the record reaches Mongoose — it never becomes a document field, so no schema
change or migration is involved. The flag governs *whether the edge is submitted*, and
removing it is the deliberate act of submitting.

`hadith.json` records may carry the same flag, but there it is **documentation only**:
`HadithRef` has no review state to hold, and the node is inserted normally.

## The one deliberate failure

`links.json` ends with a single record marked `_seedFixture: true`. It is **not content**.
It is a seed-mechanism fixture: `revealed_concerning` paired with a `curatorial` grading,
which `knowledgeLinkSchema`'s `pre("validate")` hook must reject. It exists so that a seed
run demonstrates the script *reports* invalid records rather than silently dropping them —
the `fail()` path and the "failed validation and were NOT seeded" report.

Its ayah/event pairing is deliberate nonsense and asserts nothing. It never reaches the
database.

**A seed run should report exactly 1 failure.** Zero means the reporting path or the
pre-validate hook has broken. More than one means something real stopped validating.

Model validator coverage is independent of this directory:
`__tests__/knowledgeModel.test.js` constructs its own bad documents inline and never reads
these files — including both the bad-`collection`-enum case and the `revealed_concerning` +
`curatorial` case.

## Files

| File | Natural key |
|---|---|
| `events.json` | `slug` (explicit; the model honours it over the title-derived one) |
| `hadith.json` | `collection` + `number` |
| `tafsir.json` | `work` + `verseKey` |
| `links.json` | endpoints by natural key, resolved at seed time |
