import { findAyahIdBySurah, findSurahByAyahId, getAyahMeta,
  getSurahMeta, findJuz, meta } from "quran-meta/hafs";
import { cacheGet, cacheSet } from "./cacheService.js";

const ALQURAN_CLOUD_BASE =
  process.env.ALQURAN_CLOUD_BASE_URL || "https://api.alquran.cloud/v1";
const ARABIC_EDITION = process.env.QURAN_ARABIC_EDITION || "quran-uthmani";
const TRANSLATION_EDITION =
  process.env.QURAN_TRANSLATION_EDITION || "en.sahih";

/** Cache TTL: 7 days (content is immutable Quran text) */
const QURAN_TTL = 7 * 24 * 60 * 60;

// ── Content rotation ────────────────────────────────────────────

const TOTALS = {
  ayah: meta.numAyahs, // 6236
  ruku: 556,
  juzz: 30,
};

/**
 * Deterministic daily index for a content type.
 * Varies per year so users don't see the exact same sequence annually.
 */
export function getTodayIndex(type, date = new Date()) {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 86_400_000
  );
  const year = date.getFullYear();
  const total = TOTALS[type];
  return ((year * 367 + dayOfYear) % total) + 1; // 1-indexed
}

// ── AlQuran Cloud fetch helpers ─────────────────────────────────

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`AlQuran Cloud API error ${res.status}: ${url}`);
  }
  return res.json();
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Fetch a single ayah (Arabic + English translation).
 * @param {number} globalAyahNumber 1–6236
 */
export async function getAyah(globalAyahNumber) {
  const cacheKey = `quran:ayah:${globalAyahNumber}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const url = `${ALQURAN_CLOUD_BASE}/ayah/${globalAyahNumber}/editions/${ARABIC_EDITION},${TRANSLATION_EDITION}`;
  const { data } = await fetchJson(url);
  const [arabic, translation] = data;

  const result = {
    referenceId: `${arabic.surah.number}:${arabic.numberInSurah}`,
    arabic: arabic.text,
    translation: translation.text,
    surah: arabic.surah.englishName,
    surahArabic: arabic.surah.name,
    surahNumber: arabic.surah.number,
    ayahNumber: arabic.numberInSurah,
    globalAyahNumber,
    juzNumber: arabic.juz,
    page: arabic.page,
    revelationType: arabic.surah.revelationType,
  };

  await cacheSet(cacheKey, result, QURAN_TTL);
  return result;
}

/**
 * Fetch a complete ruku (all ayahs, Arabic + English).
 * Returns both a combined text for theme detection and a per-ayah array.
 * @param {number} rukuNumber 1–556
 */
export async function getRuku(rukuNumber) {
  const cacheKey = `quran:ruku:${rukuNumber}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const [arabicRes, translationRes] = await Promise.all([
    fetchJson(`${ALQURAN_CLOUD_BASE}/ruku/${rukuNumber}/${ARABIC_EDITION}`),
    fetchJson(`${ALQURAN_CLOUD_BASE}/ruku/${rukuNumber}/${TRANSLATION_EDITION}`),
  ]);

  const arabic = arabicRes.data;
  const translation = translationRes.data;
  const firstAyah = arabic.ayahs[0];

  const ayahs = arabic.ayahs.map((a, i) => ({
    ayahNumber: a.numberInSurah,
    globalAyahNumber: a.number,
    arabic: a.text,
    translation: translation.ayahs[i]?.text || "",
    surahNumber: a.surah.number,
    surah: a.surah.englishName,
    surahArabic: a.surah.name,
    juzNumber: a.juz,
    page: a.page,
  }));

  const result = {
    referenceId: `ruku-${rukuNumber}`,
    rukuNumber,
    arabic: ayahs.map((a) => a.arabic).join(" "),
    translation: ayahs.map((a) => a.translation).join(" "),
    ayahs,
    surah: `${firstAyah.surah.englishName} — Ruku ${rukuNumber}`,
    surahArabic: firstAyah.surah.name,
    surahNumber: firstAyah.surah.number,
    startingAyah: firstAyah.numberInSurah,
    totalAyahsInRuku: arabic.ayahs.length,
    juzNumber: firstAyah.juz,
    revelationType: firstAyah.surah.revelationType,
  };

  await cacheSet(cacheKey, result, QURAN_TTL);
  return result;
}

/**
 * Fetch a complete juzz (all ayahs, Arabic + English).
 * Returns both a combined text for theme detection and a per-ayah array.
 * @param {number} juzNumber 1–30
 */
export async function getJuz(juzNumber) {
  const cacheKey = `quran:juz:${juzNumber}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const [arabicRes, translationRes] = await Promise.all([
    fetchJson(`${ALQURAN_CLOUD_BASE}/juz/${juzNumber}/${ARABIC_EDITION}`),
    fetchJson(`${ALQURAN_CLOUD_BASE}/juz/${juzNumber}/${TRANSLATION_EDITION}`),
  ]);

  const arabic = arabicRes.data;
  const translation = translationRes.data;
  const firstAyah = arabic.ayahs[0];
  const lastAyah = arabic.ayahs[arabic.ayahs.length - 1];

  const ayahs = arabic.ayahs.map((a, i) => ({
    ayahNumber: a.numberInSurah,
    globalAyahNumber: a.number,
    arabic: a.text,
    translation: translation.ayahs[i]?.text || "",
    surahNumber: a.surah.number,
    surah: a.surah.englishName,
    surahArabic: a.surah.name,
    juzNumber: a.juz,
    page: a.page,
  }));

  // Collect unique surahs spanned by this juzz
  const surahsInJuz = [...new Set(arabic.ayahs.map((a) => a.surah.englishName))];

  const result = {
    referenceId: `juz-${juzNumber}`,
    juzNumber,
    arabic: ayahs.map((a) => a.arabic).join(" "),
    translation: ayahs.map((a) => a.translation).join(" "),
    ayahs,
    surah: `Juzz ${juzNumber} — ${firstAyah.surah.englishName} ${firstAyah.surah.number}:${firstAyah.numberInSurah}`,
    surahsIncluded: surahsInJuz,
    startingSurah: firstAyah.surah.englishName,
    startingAyah: firstAyah.numberInSurah,
    endingSurah: lastAyah.surah.englishName,
    endingAyah: lastAyah.numberInSurah,
    totalAyahsInJuz: arabic.ayahs.length,
  };

  await cacheSet(cacheKey, result, QURAN_TTL);
  return result;
}

// ── quran-meta utility re-exports (no API call needed) ──────────

export { getAyahMeta, getSurahMeta, findJuz, findAyahIdBySurah,
  findSurahByAyahId, meta };
