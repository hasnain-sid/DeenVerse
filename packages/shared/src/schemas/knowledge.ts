import { z } from 'zod';

// ===== Knowledge Graph Enums =====

export const knowledgeNodeTypeEnum = z.enum([
  'ayah',
  'seerahEvent',
  'hadithRef',
  'tafsirPassage',
]);

/**
 * The verb is the honest label. `revealed_concerning` is a strong historical claim
 * that needs a transmitted asbab report; `thematically_related` is a curatorial
 * claim. They are not interchangeable.
 */
export const knowledgeRelationEnum = z.enum([
  'revealed_concerning',
  'references',
  'thematically_related',
  'attested_by',
  'explained_by',
  'dated_by',
]);

/** Authenticity of the *link's evidence*, not of the nodes it joins. */
export const gradingLabelEnum = z.enum([
  'sahih',
  'hasan',
  'daif',
  'mursal',
  'no-isnad',
  'curatorial',
  'textual',
]);

export const confidenceEnum = z.enum([
  'established',
  'reported',
  'contested',
  'weak',
]);

export const reviewDomainEnum = z.enum([
  'hadith-grading',
  'asbab-al-nuzul',
  'seerah-chronology',
  'tafsir-attribution',
]);

export const reviewPositionEnum = z.enum([
  'accept',
  'accept-with-note',
  'object',
  'challenge',
]);

export const linkReviewStateEnum = z.enum([
  'draft',
  'unreviewed',
  'reviewed',
  'contested',
  'returned',
  'retired',
]);

export const hadithCollectionEnum = z.enum([
  'bukhari',
  'muslim',
  'abudawud',
  'tirmidhi',
  'nasai',
  'ibnmajah',
  'ahmad',
  'other',
]);

export const tafsirWorkEnum = z.enum([
  'ibn-kathir',
  'tabari',
  'qurtubi',
  'jalalayn',
  'saadi',
  'wahidi-asbab',
  'suyuti-lubab',
  'other',
]);

/** Verse key, e.g. "8:9". Bounds are checked server-side via quran-meta. */
export const verseKeySchema = z
  .string()
  .regex(/^\d{1,3}:\d{1,3}$/, 'verseKey must look like "surah:ayah", e.g. 8:9');

// ===== Knowledge Link =====

export const knowledgeSourceSchema = z.object({
  work: z.string().min(1, 'Source work is required'),
  locator: z.string().min(1, 'Source locator is required'),
  url: z.string().url().nullish(),
});

export const knowledgeGradingSchema = z.object({
  label: gradingLabelEnum,
  basis: z.string().min(1, 'Grading basis is required').max(500),
});

export const knowledgeDisagreementSchema = z.object({
  flag: z.boolean(),
  summary: z.string().max(1000).optional().default(''),
});

/**
 * Provenance is required in full — it is the machine-checkable visibility gate
 * (§1.6). An edge missing a source, a grading label or a confidence cannot be
 * published, and the `revealed_concerning` rule is enforced here as well as in
 * the Mongoose pre-validate hook.
 */
export const createKnowledgeLinkSchema = z
  .object({
    fromType: knowledgeNodeTypeEnum,
    fromRef: z.string().min(1),
    toType: knowledgeNodeTypeEnum,
    toRef: z.string().min(1),
    relation: knowledgeRelationEnum,
    source: knowledgeSourceSchema,
    grading: knowledgeGradingSchema,
    confidence: confidenceEnum,
    disagreement: knowledgeDisagreementSchema,
    snapshotNote: z.string().optional().default(''),
  })
  .refine(
    (data) =>
      !(
        data.relation === 'revealed_concerning' &&
        data.grading.label === 'curatorial'
      ),
    {
      message:
        '"revealed_concerning" requires transmitted evidence; use "thematically_related"',
      path: ['grading', 'label'],
    }
  );

export const updateKnowledgeLinkSchema = z.object({
  source: knowledgeSourceSchema.optional(),
  grading: knowledgeGradingSchema.optional(),
  confidence: confidenceEnum.optional(),
  disagreement: knowledgeDisagreementSchema.optional(),
  snapshotNote: z.string().optional(),
});

// ===== Review =====

export const citedSourceSchema = z.object({
  work: z.string().optional(),
  locator: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
});

export const recordDecisionSchema = z.object({
  position: reviewPositionEnum,
  note: z.string().max(3000).optional().default(''),
  citedSources: z.array(citedSourceSchema).optional().default([]),
});

export const grantReviewerSchema = z.object({
  domains: z
    .array(reviewDomainEnum)
    .min(1, 'At least one domain is required'),
  basis: z
    .string()
    .min(1, 'Record what credential was inspected')
    .max(1000),
});

export const revokeReviewerSchema = z.object({
  reason: z.string().min(1, 'A revocation reason is required').max(1000),
});

// ===== Node creation =====

export const createSeerahEventSchema = z.object({
  title: z.string().min(1).max(200),
  titleArabic: z.string().optional().default(''),
  segment: z.enum(['badr']),
  dating: z
    .array(
      z.object({
        source: z.string().min(1),
        hijriYear: z.number(),
        hijriMonth: z.number().min(1).max(12).optional(),
        hijriDay: z.number().min(1).max(30).optional(),
        note: z.string().optional().default(''),
      })
    )
    .optional()
    .default([]),
  narrativeOrder: z.number(),
  summary: z.string().min(1).max(2000),
  participants: z.array(z.string().max(120)).optional().default([]),
  places: z.array(z.string().max(120)).optional().default([]),
});

export const createHadithRefSchema = z.object({
  collection: hadithCollectionEnum,
  number: z.string().min(1),
  hadeethencId: z.string().nullish(),
  sunnahComUrl: z.string().url().nullish(),
  gradings: z
    .array(
      z.object({
        grade: z.enum(['sahih', 'hasan', 'daif', 'mawdu', 'mursal', 'ungraded']),
        grader: z.string().min(1),
        source: z.string().min(1),
      })
    )
    .optional()
    .default([]),
  gloss: z.string().min(1).max(500),
  matnArabicExcerpt: z.string().max(1000).nullish(),
});

export const createTafsirPassageSchema = z.object({
  work: tafsirWorkEnum,
  verseKey: verseKeySchema,
  locator: z.string().min(1),
  summary: z.string().min(1).max(1500),
  externalUrl: z.string().url().nullish(),
  arabicExcerpt: z.string().max(1500).nullish(),
});

// ===== Inferred types =====

export type KnowledgeNodeType = z.infer<typeof knowledgeNodeTypeEnum>;
export type KnowledgeRelation = z.infer<typeof knowledgeRelationEnum>;
export type GradingLabel = z.infer<typeof gradingLabelEnum>;
export type Confidence = z.infer<typeof confidenceEnum>;
export type ReviewDomain = z.infer<typeof reviewDomainEnum>;
export type ReviewPosition = z.infer<typeof reviewPositionEnum>;
export type LinkReviewState = z.infer<typeof linkReviewStateEnum>;
export type CreateKnowledgeLinkInput = z.infer<typeof createKnowledgeLinkSchema>;
export type UpdateKnowledgeLinkInput = z.infer<typeof updateKnowledgeLinkSchema>;
export type RecordDecisionInput = z.infer<typeof recordDecisionSchema>;
export type GrantReviewerInput = z.infer<typeof grantReviewerSchema>;
export type RevokeReviewerInput = z.infer<typeof revokeReviewerSchema>;
export type CreateSeerahEventInput = z.infer<typeof createSeerahEventSchema>;
export type CreateHadithRefInput = z.infer<typeof createHadithRefSchema>;
export type CreateTafsirPassageInput = z.infer<typeof createTafsirPassageSchema>;
