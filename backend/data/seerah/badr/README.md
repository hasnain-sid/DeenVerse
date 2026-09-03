# Badr seed data — PLACEHOLDER CONTENT, NOT SCHOLARSHIP

**Every record in this directory is fictional.** The names, citations, gradings, glosses,
locators and summaries were invented to exercise `scripts/seedSeerah.js` and the Mongoose
validators. None of it is real Seerah, hadith or tafsir content, and none of it may be
displayed to a reader.

M1 delivers the *tooling*. The content is M2's prerequisite and has to be authored by a
qualified human from primary sources — event summaries in original prose, hadith citations
with attributed gradings, tafsir attributions with real locators. Nothing here should be
edited into real content by pattern-matching on its shape; the shape is the only part that
is meant to survive.

## Deliberate failures

Two records fail validation on purpose, to prove the seed reports failures rather than
silently dropping them. Both are expected in the seed output:

| File | Record | Why it fails |
|---|---|---|
| `hadith.json` | `not-a-real-collection` / `PLACEHOLDER-0003` | `collection` is not in the schema enum |
| `links.json` | `test-event-three` ← `9:40` | `revealed_concerning` with a `curatorial` grading — rejected by the `pre("validate")` hook on `knowledgeLinkSchema` |

A run that reports fewer than 2 failures means a validator has stopped working.

## Files

| File | Natural key |
|---|---|
| `events.json` | `slug` (derived from `title`) |
| `hadith.json` | `collection` + `number` |
| `tafsir.json` | `work` + `verseKey` |
| `links.json` | endpoints by natural key, resolved at seed time |

## Real verse keys

The `verseKey` values (`8:9`, `8:17`, `3:123`, `9:40`) are real ayah identifiers, because the
seed resolves them through `quran-meta` and fetches text for the snapshot hash. An identifier
is not a claim — the fictional part is every assertion this data makes *about* those ayat.
