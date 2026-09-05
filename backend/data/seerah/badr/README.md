# Badr seed data

All four files hold **human-verified content**, entered from specifications supplied by the
project owner. None of them holds placeholders.

## Provenance and what is still missing

Event summaries are original prose written to a supplied description, not copied from any
source. Every dating cites `Ibn Hisham, Sira` and 2 AH, and they fall into three groups:

- **Day supplied (3).** `reluctant-departure` (12 Ramadan), `arrival-well-shura`
  (16 Ramadan), `battle-of-badr` (17 Ramadan).
- **Month but no day (4).** `water-carriers-reconnaissance`, `arish-shelter`,
  `martyrs-burial`, `return-to-madinah`. Each carries a `note` that places it relative to
  the events around it and says in as many words that the day was not sourced.
- **Year only (3).** `dua-for-reinforcement`, `spoils-dispute`, `captives-deliberation`.

Month and day are absent wherever they were not sourced, rather than guessed.

### `tafsir.json` — summaries, not excerpts

The ten passages cover 8:1, 8:5, 8:9, 8:17, 8:65 and 8:67 across two works: Ibn Kathir on
all six verses, al-Jalalayn on four of them. Every `summary` is original prose describing
what the named work says about that ayah — not a translation and not a quotation of either
work.

`externalUrl` and `arabicExcerpt` are `null` on all ten. No licensed source for the Arabic
was available for these passages, and §3.5 is explicit that the field stays null rather than
carrying text from a restricted origin; an `externalUrl` was likewise not supplied, and a
plausible-looking one is not something to infer.

**Two verses carry Ibn Kathir alone, and the gap means something different in each case.**
Four verses carry both works; 8:1 and 8:65 carry only Ibn Kathir.

- **8:1** — no distinct al-Jalalayn passage was confirmed to exist. That asymmetry is the
  record of a research result, not an oversight to be tidied up by writing one.
- **8:65** — a Jalalayn passage was neither specified nor looked for. Nothing is claimed
  about whether one exists. If one is confirmed later it belongs here; this absence is a
  gap in coverage, not a finding.

Keeping the two apart matters, because "we checked and there is none" and "we did not
check" look identical in the data and are not the same statement.

### Ayat outside Surah al-Anfal

Two linked ayat sit outside al-Anfal: `22:19` (the disputants, tied to the opening single
combat) and `2:249` (Talut's river crossing, tied to the size of the Muslim force). That is
expected rather than a data error — Badr-related reports legitimately cite verses from
elsewhere in the Qur'an, and the graph keys ayah endpoints by verse key alone, so nothing
constrains an edge to one surah.

### `narrativeOrder` is chronological, and is a curatorial call

`narrativeOrder` runs 1-10 in the order the events happened, so the segment reads straight
through: `reluctant-departure` (1), `water-carriers-reconnaissance` (2),
`arrival-well-shura` (3), `arish-shelter` (4), `dua-for-reinforcement` (5),
`battle-of-badr` (6), `martyrs-burial` (7), `spoils-dispute` (8),
`captives-deliberation` (9), `return-to-madinah` (10). The array in `events.json` is kept
in the same order so the file cannot drift from the field. The schema comment is worth
keeping in view - this is "curatorial, not a historical claim".

Placements are decided four different ways, and the four are not equally strong: by a date
the sources supply, by a dependency between events, by a transmitted report, or by a
curatorial reading that no source settles. Which one is doing the work is recorded below
for every placement that needed thought.

**By dating.** `arrival-well-shura` (16 Ramadan) falls between `reluctant-departure`
(12 Ramadan) and `battle-of-badr` (17 Ramadan) on its own dating. No judgement needed.

**By dependency.** `water-carriers-reconnaissance` sits at 2, between the departure and the
arrival at Badr. The water-carriers were taken while the Quraysh army was still being
approached, and what the questioning produced — an estimate of that army's size from the
camels slaughtered for it daily — is information wanted before contact, not after. Its
`dating` carries month but no day, so the `note` records that relation ("before arrival at
Badr") instead of a date no source supplied.

**By a transmitted report.** `arish-shelter` sits **before** `dua-for-reinforcement`, and
this one is settled by evidence rather than by judgement. A report in Sahih al-Bukhari's
Kitab al-Maghazi, narrated by Ibn 'Abbas and tied to Q 54:45, has the Prophet make the
supplication and then *come out* — `fa-kharaja`. Coming out presupposes being inside: the
wording only works if there was already a structure around him when he prayed. So the
shelter stood before the supplication was made in it, and the order follows from the report
rather than from a reading of what the two entries are.

This also settles what an earlier draft of this file explicitly declined to claim, that the
supplication was made from inside the shelter. It is claimed now, and it is what the
ordering rests on.

**The report is now in the graph.** It was held out while its number was unconfirmed — the
citation trail was Bukhari, Kitab al-Maghazi, Ibn 'Abbas, referencing 54:45, with no
edition-stable number, and guessing one to make the edge enterable was refused. The number
supplied since is **3953**, so `hadith.json` carries `bukhari:3953` and `links.json` carries
two `attested_by` edges from it: to `arish-shelter` and to `dua-for-reinforcement`. One
report attests both events because it is one report about both — the Prophet praying inside
the shelter, Abu Bakr telling him that was enough, and the Prophet then coming out.

The ordering argument above no longer rests on prose alone. It rests on an edge, and a
reader following `arish-shelter` now reaches the report the placement was argued from.

**By curatorial reading.** `dua-for-reinforcement` sits **before** `battle-of-badr`, not
after: the supplication and the answer of Q 8:9 come while the outcome is still open, and
`battle-of-badr` is the entry that carries the outcome ("The day ended in victory").
Placing the supplication after it would put an event after its own resolution. Its own
`dating` carries year only, so the field is doing the ordering here, not the date.

`martyrs-burial` (7), `spoils-dispute` (8) and `captives-deliberation` (9) are the
genuinely ambiguous stretch, and the order between them is a curatorial call of the same
kind — flagged here rather than made silently. All three plausibly fall inside the same
three-day stay at Badr, and no dating separates them: two carry year only, and
`martyrs-burial` carries a month with a `note` saying the day was not sourced. Two readings
produce the order used:

- **A completed act goes before the questions left open.** The burial is the one of the
  three that is an action carried out and finished on the field. The other two entries
  describe themselves as unresolved for a stretch of time — the spoils disagreement "stood
  unsettled until a ruling was given", and the Prophet "decided the matter" of the
  captives. Putting the burial first is not a claim that nobody argued over the spoils
  until the graves were filled; it is a claim about which of the three entries describes
  something that had an end.
- **Between the two open questions, follow the anchor the graph already holds.**
  `spoils-dispute` is anchored to 8:1 and `captives-deliberation` to 8:67, and al-Anfal
  takes up the spoils before it takes up the captives. This signal is weak and is worth
  naming as weak: **surah order is not chronology**, and no source consulted here says the
  spoils ruling preceded the captives ruling. It is used because it is the only ordering
  signal the graph carries for this pair, and a stated weak reason beats an unstated
  arbitrary one.

`return-to-madinah` is last on the plainest ground available: it is the departure from the
place the other three happened at, and each of them belongs to the stay it ends.

None of this is load-bearing for any edge. `narrativeOrder` is display order within the
segment and no `KnowledgeLink` reads it, so getting this stretch wrong misorders a page and
asserts nothing about revelation or transmission. If a source is found that fixes the
sequence, renumber and say so here.

Two schema-required fields were not in the supplied specification and hold minimal
restatements of the fields that were, pending author sign-off:

| Field | What is there now |
|---|---|
| `links[].source.locator` | `"on <verseKey>"` — positional only, adds no citation. Two exceptions: the `8:17` link, whose locator carries the volume/page citation, and the ten `explained_by` links, where `"on <verseKey>"` *is* the citation because it matches the locator of the passage being cited |
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

### `8:65` — one link or two, and why it is two

`8:65` was already in the graph as `8:65 -[references]-> battle-of-badr`, whose
`source.work` read "Ibn Kathir's tafsir on 8:65, citing Sahih Muslim 1901". That string
named a tafsir passage the graph did not hold. `tafsir.json` now holds it — Ibn Kathir on
8:65, on the command to urge the believers to fight, with Umayr ibn al-Humam's response as
the illustration — and the question was how to connect the two.

**The stored passage cannot be reached by editing the existing link.**
`KnowledgeLink.source.work` is `{ type: String, required: true }`: a free-text citation
field with no `ref`, no type and no endpoint semantics. Writing a `TafsirPassage` ObjectId
into it would put an opaque id where the UI renders a citation — losing the citation and
gaining no connection, because nothing resolves that field as a reference. The endpoints
are the only part of an edge that addresses a node, and `relation: "references"` is
`ayah → event`; it has no reading in which it connects an ayah to a tafsir passage.

So the second option was taken: a **new** edge, `8:65 -[explained_by]-> ibn-kathir:8:65`.
That is exactly the relation the enum defines for `ayah → tafsirPassage`, and it routes to
`tafsir-attribution` through `domainForRelation` without any special-casing. The original
`8:65 -[references]-> battle-of-badr` edge is **untouched**, `source.work` string included.
The two edges say different things and both are wanted: one that the ayah refers to the
battle, one that a named tafsir explains the ayah.

This is the same shape as the other nine `explained_by` edges, and it is the pattern to
repeat. **A `source.work` that names a work is a citation, not a connection** — the same
rule the dangling-node note below states from the other direction.

### Event `review.state`: backed events are `unreviewed`, unbacked ones stay `draft`

`SeerahEvent.review.state` is **not derived by any code.** Unlike `KnowledgeLink.review.state`,
which §1.4 makes a computed value written only by the review service, nothing anywhere writes
an event's state — the seed script inserts whatever `events.json` says and never revisits it.
It is maintained by hand, and a hand-maintained field needs its rule written down or it
drifts. It already did once: `arish-shelter` was promoted when its edge landed while five
equally-backed events were left behind, and the gap survived a commit. So:

> **An event whose slug appears on at least one edge that reaches the database in a
> non-`draft` state is `unreviewed`. An event with no such edge stays `draft`.**

Both halves carry weight. `draft` on an event with real transmitted backing understates what
the graph holds; `unreviewed` on an event with nothing behind it claims a footing it does not
have. Neither is a claim about scholarly review — `unreviewed` means exactly what it says, and
§1.6 makes it a publishable state.

**Two kinds of link record are not backing**, and both are easy to miscount:

- `_seedFixture` records fail validation by design and never reach the database at all.
- `_needsScholarReview` records do reach it, but the seed script holds them at `draft`.
  `8:17 -[references]-> battle-of-badr` is the live example: twelve link records name
  `battle-of-badr` and only eleven of them are backing.

Applied to the data as it stands, the rule gives seven `unreviewed` — `reluctant-departure`,
`arish-shelter`, `dua-for-reinforcement`, `battle-of-badr`, `spoils-dispute`,
`captives-deliberation`, `return-to-madinah` — and three `draft`:
`water-carriers-reconnaissance`, `arrival-well-shura` and `martyrs-burial`. Those three are
exactly the three dangling events below, which is not a coincidence: with no edges at all,
they cannot have a non-`draft` one.

**Re-check this in any batch that adds or removes an edge**, because nothing checks it for
you. An event that gains its first non-`draft` edge moves to `unreviewed` in the same batch
that adds the edge. The rule does not run backwards on its own: a state above `unreviewed`
was set by a human deciding something, and an edge going away is not grounds for undoing
that automatically.

**A correction is the exception, and it has been used once.** When an edge is removed because
it should never have existed, the state it produced goes with it — the promotion rested on a
claim that turned out to be false, so leaving the event `unreviewed` would preserve a
conclusion whose only evidence has been withdrawn. `martyrs-burial` was demoted
`unreviewed` -> `draft` on exactly this ground when its `bukhari:3976` edge was removed (see
below). That is different from an edge being superseded, retired or re-versioned in the
ordinary course, where the guard above applies and the state stands.

### `bukhari:3976` was attached to two wrong events before the right one

Worth keeping because the edge that was wrong looked exactly like the edges that are right.

`bukhari:3976` narrates the aftermath at Badr: the slain Quraysh leaders cast into a well
and addressed by the Prophet, and then — in the same report — his mount being saddled and
the departure. It was first entered on two edges, `martyrs-burial` and `battle-of-badr`.
Both were wrong, and differently wrong:

- **`martyrs-burial`** is the burial of the **Muslim** dead. The report is about the
  **Quraysh** dead. Different act, different people; the report says nothing about the
  fourteen buried at the battlefield. An argument was available that it attested the
  three-day *frame* the event sits in rather than the burial itself — that argument was made
  and it was wrong. `attested_by` says the event stands or falls on whether the report is
  sound (`utils/knowledgeDomain.js`), and a report that never mentions the act cannot carry
  that weight, however well it fits the calendar around it.
- **`battle-of-badr`** is the fighting and its outcome. The report is entirely aftermath —
  it begins after the fighting has stopped. Closer, but still not what the event is.

Both edges are removed. The report now sits on **`return-to-madinah`**, which its own text
supports directly: the mount ordered saddled and the departure from Badr is the start of the
return journey.

The general lesson is the one the graph is built to enforce. Nothing in an edge's own fields
records *scope* — `sahih`, `established`, no disagreement flag looks identical whether the
report is squarely on the event or merely nearby in time. Only the endpoints say what is
being claimed, so the endpoints are where a content mismatch has to be caught. "Related to
the same few days" is not the test; "narrates this event" is.

## Outstanding

- **`ahmad:1/368` is a dangling node.** The Musnad Ahmad ref is cited in the
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
  if you add a hadith ref and cite it only there, expect it to dangle. `muslim:1901` is the
  rule applied on the way in rather than after the fact: the `8:65` link names it in
  `source.work`, so it was given its own `attested_by` edge from `battle-of-badr` in the
  same batch, and never dangled at all. `bukhari:3953` is the same rule applied again: it
  arrived with both its `attested_by` edges in the same batch.
- **Three events carry no edges yet.** `water-carriers-reconnaissance`,
  `arrival-well-shura` and `martyrs-burial` were entered as events in their own right,
  with no `links.json` entry and no hadith ref behind them, so a dangling-node check
  reports them alongside `ahmad:1/368` — **four in total**. This is deliberate and is the
  one case where dangling is the *intended* interim state: inventing a `source.work` string
  to hang an edge on would fabricate provenance, which is worse than an unreachable node.
  All three sit at `review.state` `draft` — the rule above, not a coincidence — so none is
  published while it waits. Citable backing is a later round.

  `arish-shelter` was on this list and has left it, when `bukhari:3953` and its
  `attested_by` edge arrived. `return-to-madinah` has just left it the same way, on
  `bukhari:3976`. **`martyrs-burial` has gone the other way** — it left the list on a
  `bukhari:3976` edge and is back on it now that the edge has been removed as a content
  mismatch. That is the honest state: it has no source behind it and never did.
  `arrival-well-shura` has simply never had one.
- **Volume.** M1's targets are ≥10 events, ≥25 hadith refs, ≥10 tafsir passages and ≥60
  links. Current: **10 / 14 / 10 / 33** (32 submitted to `unreviewed`, 1 held at `draft`).
  Events and tafsir passages have reached their targets. Hadith refs are at 14 of 25 and
  links at 33 of 60 — both still well under.

  The link count is the records that reach the database. `links.json` holds 34 objects: the
  33 above plus the `_seedFixture` record, which fails validation by design and is never
  seeded.

  Three `bukhari:3976` edges were authored on the way to this number and two of them were
  withdrawn before it landed — see the content-mismatch note above. Volume is not the target
  these files optimise for, and an edge removed for pointing at the wrong event is progress
  on the one that is.

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
