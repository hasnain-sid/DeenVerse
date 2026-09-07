import { SeerahEvent } from "../models/seerahEventSchema.js";
import { HadithRef } from "../models/hadithRefSchema.js";
import { TafsirPassage } from "../models/tafsirPassageSchema.js";
import { KnowledgeLink } from "../models/knowledgeLinkSchema.js";

/**
 * Read side of the Seerah knowledge graph.
 *
 * Two rules govern everything here, and both come from the integration plan
 * (docs/quran-seerah-integration-plan.md §1.6) rather than from taste:
 *
 * 1. **Visibility is gated on provenance completeness, not on approval.** An edge
 *    is published because its source, grading and disagreement fields are filled
 *    in — which the Mongoose validators already enforce — not because someone
 *    signed off on it. Gating on approval with no reviewer population produces
 *    either an invisible feature or a self-approved badge meaning "the developer
 *    clicked a button". The repo already shipped that failure once:
 *    `TopicReflection.isScholarVerified` has never been set by any code path.
 *
 * 2. **`review.state` is rendered, never filtered on beyond the unpublished
 *    states.** Every edge carries its state to the client so the UI can badge it
 *    honestly. `unreviewed` is a publishable state and says exactly what it is.
 *
 * The one thing that is filtered: `draft` and `retired`. `draft` is what holds
 * back the `_needsScholarReview` edge (8:17 -> battle-of-badr), whose isnad no
 * human has verified. That edge must not reach a reader, and this is the layer
 * that honours the flag.
 */

/** Link states that may reach a reader. Anything else is unpublished by definition. */
const PUBLISHED_LINK_STATES = ["unreviewed", "reviewed", "contested", "returned"];

/** Event states that may reach a reader. */
const PUBLISHED_EVENT_STATES = ["unreviewed", "reviewed"];

/**
 * Build the whole segment in one payload.
 *
 * Deliberately not paginated and deliberately not split across endpoints. The
 * Badr segment is 10 events, 17 hadith refs, 12 tafsir passages and 38 links —
 * tens of KB. Granular endpoints would cost an N+1 per event and push graph
 * assembly into the browser, for data that fits in one cacheable response.
 *
 * Nodes are resolved **from the edges**, never by listing collections. That is
 * what gives the hadith visibility gate for free: `HadithRef` has no review
 * state of its own, so unreachability is its only gate. Serialising from edges
 * drops `ahmad:1/368` and the three edgeless events automatically — correct
 * behaviour rather than a special case.
 */
export async function getSegment(segment = "badr") {
  const events = await SeerahEvent.find({
    segment,
    "review.state": { $in: PUBLISHED_EVENT_STATES },
  })
    .sort({ narrativeOrder: 1 })
    .select("-author -__v -review.snapshotHash")
    .lean();

  if (!events.length) {
    return { segment, events: [], tafsirEdges: [], counts: emptyCounts() };
  }

  const eventIds = events.map((e) => String(e._id));

  // Every published edge. Ayah -> tafsirPassage edges have no event endpoint at
  // all, so this cannot be scoped to the event ids.
  const links = await KnowledgeLink.find({
    "review.state": { $in: PUBLISHED_LINK_STATES },
  })
    .select("-__v -snapshotHash -supersedes")
    .lean();

  // Resolve only the node ids the surviving edges actually name.
  const hadithIds = new Set();
  const tafsirIds = new Set();
  for (const l of links) {
    if (l.fromType === "hadithRef") hadithIds.add(String(l.fromRef));
    if (l.toType === "hadithRef") hadithIds.add(String(l.toRef));
    if (l.fromType === "tafsirPassage") tafsirIds.add(String(l.fromRef));
    if (l.toType === "tafsirPassage") tafsirIds.add(String(l.toRef));
  }

  const [hadith, tafsir] = await Promise.all([
    HadithRef.find({ _id: { $in: [...hadithIds] } }).select("-__v").lean(),
    TafsirPassage.find({ _id: { $in: [...tafsirIds] } }).select("-__v").lean(),
  ]);

  const hadithById = new Map(hadith.map((h) => [String(h._id), h]));
  const tafsirById = new Map(tafsir.map((t) => [String(t._id), t]));
  const eventById = new Map(events.map((e) => [String(e._id), e]));

  /** Turn one endpoint into something the client can render without a second lookup. */
  const resolve = (type, ref) => {
    const id = String(ref);
    if (type === "ayah") return { type, verseKey: ref };
    if (type === "hadithRef") {
      const h = hadithById.get(id);
      return h
        ? {
            type,
            id,
            collection: h.collection,
            number: h.number,
            gloss: h.gloss,
            gradings: h.gradings,
            sunnahComUrl: h.sunnahComUrl,
          }
        : null;
    }
    if (type === "tafsirPassage") {
      const t = tafsirById.get(id);
      return t
        ? {
            type,
            id,
            work: t.work,
            verseKey: t.verseKey,
            locator: t.locator,
            summary: t.summary,
            externalUrl: t.externalUrl,
          }
        : null;
    }
    if (type === "seerahEvent") {
      const e = eventById.get(id);
      return e ? { type, id, slug: e.slug, title: e.title } : null;
    }
    return null;
  };

  // An edge is renderable only if both endpoints resolve. One naming a node that
  // was filtered out is dropped rather than half-rendered.
  const edges = [];
  for (const l of links) {
    const from = resolve(l.fromType, l.fromRef);
    const to = resolve(l.toType, l.toRef);
    if (!from || !to) continue;
    edges.push({
      id: String(l._id),
      from,
      to,
      relation: l.relation,
      source: l.source,
      grading: l.grading,
      confidence: l.confidence,
      disagreement: l.disagreement,
      review: { state: l.review?.state, domain: l.review?.domain },
    });
  }

  // Attach each event's edges. An edge belongs to an event when the event is one
  // of its endpoints; ayah -> tafsirPassage edges belong to no event and are
  // returned separately so the ayah sections can use them.
  const byEvent = new Map(eventIds.map((id) => [id, []]));
  const unattached = [];
  for (const e of edges) {
    const eventEnd = [e.from, e.to].find((n) => n.type === "seerahEvent");
    if (eventEnd && byEvent.has(eventEnd.id)) byEvent.get(eventEnd.id).push(e);
    else unattached.push(e);
  }

  return {
    segment,
    events: events.map((e) => ({
      ...e,
      id: String(e._id),
      links: byEvent.get(String(e._id)) || [],
    })),
    tafsirEdges: unattached,
    counts: {
      events: events.length,
      links: edges.length,
      hadithRefs: hadithById.size,
      tafsirPassages: tafsirById.size,
    },
  };
}

/**
 * One event by slug, with the same edge treatment as the segment view.
 *
 * Returns null when the slug is unknown *or* the event is not in a published
 * state — the caller turns both into the same 404, so an unpublished event is
 * indistinguishable from a missing one and the response leaks nothing.
 */
export async function getEventBySlug(slug) {
  const event = await SeerahEvent.findOne({
    slug,
    "review.state": { $in: PUBLISHED_EVENT_STATES },
  })
    .select("-author -__v -review.snapshotHash")
    .lean();

  if (!event) return null;

  const segment = await getSegment(event.segment);
  return segment.events.find((e) => e.slug === slug) || null;
}

function emptyCounts() {
  return { events: 0, links: 0, hadithRefs: 0, tafsirPassages: 0 };
}
