import { TOPICS, MOODS, CATEGORIES, TOPIC_LESSONS, getTopicBySlug, getMoodById } from "../data/quranTopics.js";
import { getAyah, findAyahIdBySurah } from "./quranService.js";
import { cacheGet, cacheSet, TTL } from "./cacheService.js";
import logger from "../config/logger.js";

const TOPIC_CACHE_TTL = TTL.QURAN; // 7 days — ayah text is immutable

// ── Tafsir & Audio editions ─────────────────────────────
const ALQURAN_CLOUD_BASE =
  process.env.ALQURAN_CLOUD_BASE_URL || "https://api.alquran.cloud/v1";
const TAFSIR_EDITION = process.env.QURAN_TAFSIR_EDITION || "en.maududi";
const AUDIO_EDITION = process.env.QURAN_AUDIO_EDITION || "ar.alafasy";

// ── List endpoints ──────────────────────────────────────────────

/**
 * Return the full topic catalogue (without ayah text — lightweight).
 */
export function listTopics() {
  return TOPICS.map(({ slug, name, nameArabic, icon, description, category, ayahRefs }) => ({
    slug,
    name,
    nameArabic,
    icon,
    description,
    category,
    ayahCount: ayahRefs.length,
  }));
}

/**
 * Return all categories.
 */
export function listCategories() {
  return CATEGORIES;
}

/**
 * Return the full mood catalogue.
 */
export function listMoods() {
  return MOODS.map(({ id, name, emoji, description, relatedTopics }) => ({
    id,
    name,
    emoji,
    description,
    relatedTopics,
  }));
}

// ── Detail endpoints ────────────────────────────────────────────

/**
 * Fetch all ayahs for a given topic slug (cached).
 * Each ayahRef [surah, ayah] is resolved via quranService.getAyah().
 * @param {string} slug
 * @returns {Promise<object>}
 */
export async function getTopicAyahs(slug) {
  const topic = getTopicBySlug(slug);
  if (!topic) return null;

  const cacheKey = `quran-topics:v2:topic:${slug}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  // Resolve each ayah reference via AlQuran Cloud
  const ayahs = await resolveAyahRefs(topic.ayahRefs);

  const lessons = TOPIC_LESSONS[slug] || null;

  const result = {
    slug: topic.slug,
    name: topic.name,
    nameArabic: topic.nameArabic,
    icon: topic.icon,
    description: topic.description,
    category: topic.category,
    ayahs,
    lessons,
    ayahCount: ayahs.length,
  };

  await cacheSet(cacheKey, result, TOPIC_CACHE_TTL);
  return result;
}

/**
 * Fetch ayahs for a mood.
 * Resolves the mood's relatedTopics and merges their ayahRefs.
 * @param {string} moodId
 * @returns {Promise<object|null>}
 */
export async function getMoodAyahs(moodId) {
  const mood = getMoodById(moodId);
  if (!mood) return null;

  const cacheKey = `quran-topics:v2:mood:${moodId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  // Collect ayah refs from all related topics (deduplicated)
  const seenKeys = new Set();
  const allRefs = [];

  for (const topicSlug of mood.relatedTopics) {
    const topic = getTopicBySlug(topicSlug);
    if (!topic) continue;

    for (const ref of topic.ayahRefs) {
      const key = `${ref[0]}:${ref[1]}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        allRefs.push(ref);
      }
    }
  }

  const ayahs = await resolveAyahRefs(allRefs);

  // Gather lessons from related topics
  const relatedLessons = mood.relatedTopics
    .filter((slug) => TOPIC_LESSONS[slug])
    .map((slug) => ({
      topicSlug: slug,
      topicName: getTopicBySlug(slug)?.name,
      ...TOPIC_LESSONS[slug],
    }));

  const result = {
    id: mood.id,
    name: mood.name,
    emoji: mood.emoji,
    description: mood.description,
    relatedTopics: mood.relatedTopics.map((slug) => {
      const t = getTopicBySlug(slug);
      return t ? { slug: t.slug, name: t.name, icon: t.icon } : null;
    }).filter(Boolean),
    ayahs,
    lessons: relatedLessons,
    ayahCount: ayahs.length,
  };

  await cacheSet(cacheKey, result, TOPIC_CACHE_TTL);
  return result;
}

/**
 * Keyword search across the Quran using AlQuran Cloud search API.
 * @param {string} keyword
 * @returns {Promise<object>}
 */
export async function searchQuranByKeyword(keyword) {
  const cacheKey = `quran-topics:search:${keyword.toLowerCase().trim()}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const TRANSLATION_EDITION = process.env.QURAN_TRANSLATION_EDITION || "en.sahih";
  const url = `https://api.alquran.cloud/v1/search/${encodeURIComponent(keyword)}/${TRANSLATION_EDITION}`;

  const res = await fetch(url);
  if (!res.ok) {
    logger.warn(`AlQuran Cloud search failed for "${keyword}": ${res.status}`);
    return { keyword, matches: [], count: 0 };
  }

  const json = await res.json();
  const matches = (json.data?.matches || []).map((m) => ({
    surahNumber: m.surah.number,
    ayahNumber: m.numberInSurah,
    globalAyahNumber: m.number,
    text: m.text,
    surahName: m.surah.englishName,
    surahNameArabic: m.surah.name,
    edition: m.edition?.identifier,
  }));

  const result = { keyword, matches, count: matches.length };
  await cacheSet(cacheKey, result, TOPIC_CACHE_TTL);
  return result;
}

// ── Helpers ─────────────────────────────────────────────────────

/**
 * Resolve an array of [surahNumber, ayahNumber] references into
 * full ayah objects using quranService.getAyah(), enriched with
 * tafsir text and audio URL from AlQuran Cloud.
 * Uses Promise.allSettled to gracefully handle individual failures.
 * @param {Array<[number, number]>} refs
 * @returns {Promise<Array<object>>}
 */
async function resolveAyahRefs(refs) {
  const results = await Promise.allSettled(
    refs.map(([surah, ayah]) => {
      const globalNum = findAyahIdBySurah(surah, ayah);
      if (!globalNum) {
        logger.warn(`Could not resolve ayah ${surah}:${ayah} to global number`);
        return Promise.reject(new Error(`Invalid ref ${surah}:${ayah}`));
      }
      return resolveAyahWithExtras(globalNum);
    })
  );

  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
}

/**
 * Fetch a single ayah with tafsir and audio enrichment.
 * First gets the base ayah via quranService, then fetches extras (cached independently).
 * @param {number} globalAyahNumber
 * @returns {Promise<object>}
 */
async function resolveAyahWithExtras(globalAyahNumber) {
  // Base ayah data (Arabic + translation) — already cached in quranService
  const base = await getAyah(globalAyahNumber);

  // Tafsir + audio — separate cache key so base cache isn't invalidated
  const extrasCacheKey = `quran:ayah-extras:${globalAyahNumber}`;
  let extras = await cacheGet(extrasCacheKey);

  if (!extras) {
    extras = { tafsir: null, audioUrl: null };
    try {
      const [tafsirResult, audioResult] = await Promise.allSettled([
        fetchTafsir(globalAyahNumber),
        fetchAudioUrl(globalAyahNumber),
      ]);
      if (tafsirResult.status === "fulfilled") extras.tafsir = tafsirResult.value;
      if (audioResult.status === "fulfilled") extras.audioUrl = audioResult.value;
      await cacheSet(extrasCacheKey, extras, TOPIC_CACHE_TTL);
    } catch (err) {
      logger.warn(`Failed to fetch extras for ayah ${globalAyahNumber}:`, err.message);
    }
  }

  return { ...base, ...extras };
}

/**
 * Fetch tafsir text for a single ayah from AlQuran Cloud.
 * @param {number} globalAyahNumber
 * @returns {Promise<string|null>}
 */
async function fetchTafsir(globalAyahNumber) {
  try {
    const url = `${ALQURAN_CLOUD_BASE}/ayah/${globalAyahNumber}/${TAFSIR_EDITION}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.text || null;
  } catch (err) {
    logger.warn(`Tafsir fetch failed for ayah ${globalAyahNumber}:`, err.message);
    return null;
  }
}

/**
 * Construct audio URL for a single ayah from AlQuran Cloud CDN.
 * Audio files follow the pattern: /audio/{bitrate}/{edition}/{ayahNumber}.mp3
 * @param {number} globalAyahNumber
 * @returns {Promise<string>}
 */
async function fetchAudioUrl(globalAyahNumber) {
  // AlQuran Cloud serves audio at a predictable CDN URL
  return `https://cdn.islamic.network/quran/audio/128/${AUDIO_EDITION}/${globalAyahNumber}.mp3`;
}
