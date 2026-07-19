/**
 * Tests for getSurahList — the static surah index built from quran-meta.
 * No network or DB involved.
 */

jest.mock("../services/cacheService.js", () => ({
  cacheGet: jest.fn().mockResolvedValue(null),
  cacheSet: jest.fn().mockResolvedValue(undefined),
}));

import { getSurahList } from "../services/quranService.js";

describe("getSurahList", () => {
  const surahs = getSurahList();

  it("returns all 114 surahs in order", () => {
    expect(surahs).toHaveLength(114);
    expect(surahs[0].number).toBe(1);
    expect(surahs[113].number).toBe(114);
  });

  it("has correct data for Al-Faatiha", () => {
    expect(surahs[0]).toMatchObject({
      number: 1,
      englishName: "Al-Faatiha",
      englishTranslation: "The Opening",
      ayahCount: 7,
      firstAyahId: 1,
      isMeccan: true,
    });
  });

  it("has correct data for Al-Baqarah (surah:ayah → global mapping anchor)", () => {
    expect(surahs[1]).toMatchObject({
      number: 2,
      ayahCount: 286,
      firstAyahId: 8,
      isMeccan: false,
    });
    // Ayat al-Kursi (2:255) → global 262
    expect(surahs[1].firstAyahId + 255 - 1).toBe(262);
  });

  it("covers exactly 6236 ayahs end to end", () => {
    const last = surahs[113];
    expect(last.firstAyahId + last.ayahCount - 1).toBe(6236);

    const totalAyahs = surahs.reduce((sum, s) => sum + s.ayahCount, 0);
    expect(totalAyahs).toBe(6236);
  });

  it("has contiguous firstAyahId ranges", () => {
    for (let i = 1; i < surahs.length; i++) {
      expect(surahs[i].firstAyahId).toBe(
        surahs[i - 1].firstAyahId + surahs[i - 1].ayahCount
      );
    }
  });

  it("returns the same memoized list on repeat calls", () => {
    expect(getSurahList()).toBe(surahs);
  });
});
