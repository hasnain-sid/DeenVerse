# Badr seed data

`events.json`, `hadith.json` and `links.json` hold **human-verified content**, entered from
a specification supplied by the project owner. They are no longer placeholders.

`tafsir.json` **still holds fictional placeholder records** and was not part of that
specification. See "Outstanding" below.

## Provenance and what is still missing

Event summaries are original prose written to a supplied description, not copied from any
source. Datings carry year only (`Ibn Hisham, Sira`, 2 AH) — month and day were not
sourced and are deliberately absent rather than guessed.

Two schema-required fields were not in the supplied specification and hold minimal
restatements of the fields that were, pending author sign-off:

| Field | What is there now |
|---|---|
| `links[].source.locator` | `"on <verseKey>"` — positional only, adds no citation |
| `links[].grading.basis` | a one-line restatement of `source.work` + `grading.label` |

`8:17` (the dust-throwing incident) is **deliberately excluded**: no specific sahih hadith
was confirmed for it. Do not add it or infer a citation for it.

## Outstanding

- **`tafsir.json` is empty (`[]`).** No verified tafsir content has been supplied, and the
  fictional placeholders that used to sit here are gone. Nothing in `links.json` references
  a `tafsirPassage`, so there is nothing dangling.
- **Volume.** M1's targets are ≥10 events, ≥25 hadith refs, ≥10 tafsir passages and ≥60
  links. Current: 4 / 1 / 0 / 6.

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
