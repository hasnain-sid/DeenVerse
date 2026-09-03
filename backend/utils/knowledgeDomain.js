/**
 * Which reviewer domain governs an edge, derived from its relation.
 *
 * `KnowledgeLink.review.domain` is required and the plan (§3.1) specifies it is
 * "derived from relation" without enumerating the mapping. This is that mapping,
 * kept in one place so the seed script, the review service (M3) and the reviewer
 * middleware cannot drift apart.
 *
 * The reasoning, since it is a judgement call and not a transcription:
 *   - revealed_concerning → an occasion-of-revelation claim; the defining case for
 *     the asbab specialist.
 *   - references          → asserts the ayah names or describes the event, which is a
 *     reading of the text rather than a transmitted sabab report.
 *   - thematically_related → makes no transmitted claim at all (its grading label is
 *     literally "curatorial"), so it routes to `curatorial` — see below.
 *   - attested_by         → the edge stands or falls on whether the hadith is sound.
 *   - dated_by            → see the note below; hadith-grading, not chronology.
 *   - explained_by        → asserts a named tafsir work says this about this ayah.
 *
 * `curatorial` has no grantable counterpart: User.reviewerProfile.domains omits it, so
 * no reviewer can hold it, no accept can ever be recorded, and edges routed there stay
 * `unreviewed` permanently. That is deliberate. `unreviewed` is a publishable state
 * (§1.6) and the badge then says exactly what the edge is, instead of implying a review
 * that a curatorial claim does not admit of.
 *
 * @param {string} relation
 * @returns {string} reviewer domain
 */
export function domainForRelation(relation) {
  const domain = RELATION_DOMAINS[relation];
  if (!domain) {
    throw new Error(`No reviewer domain is defined for relation: ${relation}`);
  }
  return domain;
}

const RELATION_DOMAINS = {
  revealed_concerning: "asbab-al-nuzul",
  references: "tafsir-attribution",
  thematically_related: "curatorial",
  attested_by: "hadith-grading",
  /**
   * `dated_by` routes to hadith-grading, not seerah-chronology, even though the claim
   * it supports is a date.
   *
   * The edge is event → hadithRef: a report is being offered as dating evidence. A
   * chronology specialist can judge whether the report *establishes* the date, but only
   * a hadith specialist can judge whether the report is sound in the first place — and
   * soundness has no other review gate anywhere in the model. Routing by evidence type
   * puts the question that nothing else can catch in front of someone qualified to
   * answer it; routing by claim type would leave it unasked.
   *
   * A report that genuinely needs both signatures is the concrete case for making
   * review.domain an array rather than a single value. Not something to solve now: it
   * changes the derived-state rules in §1.4 (what does "≥1 accept in the governing
   * domain" mean across two domains?) and the reviewer queue with it. Revisit if real
   * reviewers hit it.
   */
  dated_by: "hadith-grading",
  explained_by: "tafsir-attribution",
};

export { RELATION_DOMAINS };
