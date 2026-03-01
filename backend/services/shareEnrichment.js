/**
 * Share content enrichment utilities.
 * Extracted to avoid circular dependency between shareService ↔ postService.
 */

import { AppError } from "../utils/AppError.js";

export const SUPPORTED_KINDS = ["hadith", "ayah", "ruku", "juzz", "mood", "sign"];

/**
 * Feed-template metadata per kind — used for enrichment & config response.
 */
export const FEED_TEMPLATES = {
  hadith: {
    titlePrefix: "Hadith Reflection",
    fallbackExcerpt: "A hadith worth reflecting on today.",
    suggestedHashtags: ["hadith", "reflection", "deenverse"],
    metaLabels: ["collection", "narrator", "grade"],
  },
  ayah: {
    titlePrefix: "Quran Ayah",
    fallbackExcerpt: "A Quran ayah for reflection.",
    suggestedHashtags: ["quran", "ayah", "deenverse"],
    metaLabels: ["surah", "ayah number", "juzz"],
  },
  ruku: {
    titlePrefix: "Quran Ruku",
    fallbackExcerpt: "A meaningful Quran ruku to revisit.",
    suggestedHashtags: ["quran", "ruku", "deenverse"],
    metaLabels: ["surah", "ruku number", "verse range"],
  },
  juzz: {
    titlePrefix: "Quran Juzz",
    fallbackExcerpt: "A Quran juzz shared for daily learning.",
    suggestedHashtags: ["quran", "juzz", "deenverse"],
    metaLabels: ["juzz number", "surah range", "theme"],
  },
  mood: {
    titlePrefix: "Quran by Mood",
    fallbackExcerpt: "A mood-based Quran selection for today.",
    suggestedHashtags: ["quran", "mood", "deenverse"],
    metaLabels: ["mood", "surah", "theme"],
  },
  sign: {
    titlePrefix: "Iman Boost",
    fallbackExcerpt: "A reminder sign to strengthen iman.",
    suggestedHashtags: ["iman", "reflection", "deenverse"],
    metaLabels: ["category", "source"],
  },
};

// ──────────────────────────────────────────────────────
//  enrichSharedContent — fill missing fields & cap lengths
// ──────────────────────────────────────────────────────
/**
 * Enrich a `sharedContent` payload before it's stored on a Post.
 * Fills fallback title / excerpt, trims / caps lengths, ensures `meta`
 * always has the kind label, and adds the `translation` field when present.
 *
 * @param {object} raw  - raw sharedContent from the client
 * @returns {object|null}  enriched sharedContent (new object, does not mutate input)
 */
export function enrichSharedContent(raw) {
  if (!raw || typeof raw !== "object") return null;

  const kind = raw.kind?.toLowerCase();
  if (!kind || !SUPPORTED_KINDS.includes(kind)) return null;

  const template = FEED_TEMPLATES[kind];

  // ── Normalise meta array ──────────────────────────
  const rawMeta = Array.isArray(raw.meta)
    ? raw.meta
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 8)
    : [];

  // Auto-prepend the kind label as the first meta badge if not present
  const kindBadge = template.titlePrefix;
  const meta = rawMeta.some(
    (m) => m.toLowerCase() === kindBadge.toLowerCase()
  )
    ? rawMeta
    : [kindBadge, ...rawMeta].slice(0, 8);

  // ── Build enriched object ─────────────────────────
  const enriched = {
    kind,
    title:
      typeof raw.title === "string" && raw.title.trim()
        ? raw.title.trim().slice(0, 200)
        : template.titlePrefix,
    sourceRef:
      typeof raw.sourceRef === "string" ? raw.sourceRef.trim().slice(0, 200) : undefined,
    sourceRoute:
      typeof raw.sourceRoute === "string" ? raw.sourceRoute.trim().slice(0, 500) : undefined,
    excerpt:
      typeof raw.excerpt === "string" && raw.excerpt.trim()
        ? raw.excerpt.trim().slice(0, 800)
        : template.fallbackExcerpt,
    arabic:
      typeof raw.arabic === "string" && raw.arabic.trim()
        ? raw.arabic.trim().slice(0, 2000)
        : undefined,
    translation:
      typeof raw.translation === "string" && raw.translation.trim()
        ? raw.translation.trim().slice(0, 1200)
        : undefined,
    meta,
  };

  // Remove undefined keys so Mongoose doesn't store them
  Object.keys(enriched).forEach((k) => {
    if (enriched[k] === undefined) delete enriched[k];
  });

  return enriched;
}

// ──────────────────────────────────────────────────────
//  buildShareHashtags — suggest hashtags for the caption
// ──────────────────────────────────────────────────────
/**
 * Return hashtag suggestions (without `#`) for a given kind.
 * Merges user-provided hashtags from content with template suggestions.
 *
 * @param {string} kind
 * @param {string[]} existingHashtags - already parsed from content
 * @returns {string[]}  merged unique hashtags
 */
export function buildShareHashtags(kind, existingHashtags = []) {
  const template = FEED_TEMPLATES[kind?.toLowerCase()];
  if (!template) return existingHashtags;

  const merged = new Set([
    ...existingHashtags.map((h) => h.toLowerCase()),
    ...template.suggestedHashtags,
  ]);
  return [...merged];
}

// ──────────────────────────────────────────────────────
//  getSharePreview — returns a preview of the share card
// ──────────────────────────────────────────────────────
/**
 * Preview how a shared content card would look without actually posting.
 *
 * @param {object} sharedContent
 * @returns {object} enriched preview data
 */
export function getSharePreview(sharedContent) {
  const enriched = enrichSharedContent(sharedContent);
  if (!enriched) {
    throw new AppError("Invalid shared content for preview", 400);
  }

  const template = FEED_TEMPLATES[enriched.kind];
  return {
    card: enriched,
    suggestedCaption: `${template.titlePrefix}: ${enriched.title || template.fallbackExcerpt}`,
    suggestedHashtags: template.suggestedHashtags.map((h) => `#${h}`),
  };
}
