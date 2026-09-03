/**
 * Which reviewer domain governs an edge, derived from its relation.
 *
 * `KnowledgeLink.review.domain` is required and the plan (§3.1) specifies it is
 * "derived from relation" without enumerating the mapping. This is that mapping,
 * kept in one place so the seed script, the review service (M3) and the reviewer
 * middleware cannot drift apart.
 *
 * The reasoning, since it is a judgement call and not a transcription:
 *   - revealed_concerning / references  → the claim is about an ayah's occasion of
 *     revelation, which is the asbab specialist's call.
 *   - thematically_related              → curatorial rather than transmitted, but it
 *     still joins an ayah to an event, so it stays in the same domain.
 *   - attested_by                       → the evidence is a hadith; grading it is the
 *     hadith specialist's call.
 *   - dated_by                          → the report is being used as dating evidence,
 *     which is a chronology question.
 *   - explained_by                      → tafsir attribution.
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
  references: "asbab-al-nuzul",
  thematically_related: "asbab-al-nuzul",
  attested_by: "hadith-grading",
  dated_by: "seerah-chronology",
  explained_by: "tafsir-attribution",
};

export { RELATION_DOMAINS };
