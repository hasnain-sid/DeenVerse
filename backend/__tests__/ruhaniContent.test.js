/**
 * Integrity tests for the curated Ruhani content.
 *
 * These files are hand-authored, and their cross-links are what make the
 * Tafakkur → Tadabbur → Tazkia → Tafakkur spiral work. A typo in a slug does not
 * throw — it silently drops the "continue" button and quietly breaks the feature's
 * core concept. That is exactly the kind of failure worth catching in CI.
 */

import { tafakkurTopics } from "../data/tafakkurTopics.js";
import { tadabburAyahs } from "../data/tadabburAyahs.js";
import { tazkiaTraits } from "../data/tazkiaTraits.js";

const topicSlugs = new Set(tafakkurTopics.map((t) => t.slug));
const traitSlugs = new Set(tazkiaTraits.map((t) => t.slug));
const ayahKeys = new Set(tadabburAyahs.map((a) => a.verseKey));

const VERSE_KEY = /^\d{1,3}:\d{1,3}(-\d{1,3})?$/;

describe("content shape", () => {
    it("has the expected volume of curated content", () => {
        expect(tafakkurTopics.length).toBeGreaterThanOrEqual(30);
        expect(tadabburAyahs.length).toBeGreaterThanOrEqual(31);
        expect(tazkiaTraits.length).toBeGreaterThanOrEqual(20);
    });

    it.each([
        ["tafakkurTopics", tafakkurTopics],
        ["tadabburAyahs", tadabburAyahs],
        ["tazkiaTraits", tazkiaTraits],
    ])("%s has unique slugs", (_name, list) => {
        const slugs = list.map((x) => x.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
    });

    it("every Tafakkur topic is complete", () => {
        for (const t of tafakkurTopics) {
            expect(typeof t.title).toBe("string");
            expect(t.title.length).toBeGreaterThan(0);
            expect(typeof t.contemplate).toBe("string");
            expect(Array.isArray(t.guidedQuestions)).toBe(true);
            expect(t.guidedQuestions.length).toBeGreaterThanOrEqual(3);
            expect(t.guidedQuestions.every((q) => typeof q === "string" && q.trim())).toBe(true);
        }
    });

    it("every Tadabbur ayah is complete", () => {
        for (const a of tadabburAyahs) {
            expect(a.verseKey).toMatch(VERSE_KEY);
            expect(a.arabicText.trim().length).toBeGreaterThan(0);
            expect(a.translation.trim().length).toBeGreaterThan(0);
            expect(a.guidedQuestions.length).toBeGreaterThanOrEqual(3);
        }
    });

    it("every Tazkia trait is complete", () => {
        for (const t of tazkiaTraits) {
            expect(t.primaryAyah).toMatch(VERSE_KEY);
            expect(t.primaryHadith.trim().length).toBeGreaterThan(0);
            expect(t.muhasabaPrompts.length).toBeGreaterThanOrEqual(3);
            expect(typeof t.actionTemplate).toBe("string");
        }
    });
});

describe("cross-links resolve", () => {
    it("every Tafakkur linkedAyahKey points at a curated Tadabbur ayah", () => {
        for (const t of tafakkurTopics) {
            if (!t.linkedAyahKey) continue;
            expect(ayahKeys.has(t.linkedAyahKey)).toBe(true);
        }
    });

    it("every Tafakkur linkedTazkiaTraits entry points at a real trait", () => {
        for (const t of tafakkurTopics) {
            for (const slug of t.linkedTazkiaTraits ?? []) {
                expect(traitSlugs.has(slug)).toBe(true);
            }
        }
    });

    it("every Tadabbur linkedTraitSlug points at a real trait", () => {
        for (const a of tadabburAyahs) {
            if (!a.linkedTraitSlug) continue;
            expect(traitSlugs.has(a.linkedTraitSlug)).toBe(true);
        }
    });

    it("every Tadabbur linkedTafakkurSlugs entry points at a real topic", () => {
        for (const a of tadabburAyahs) {
            for (const slug of a.linkedTafakkurSlugs ?? []) {
                expect(topicSlugs.has(slug)).toBe(true);
            }
        }
    });

    // The leg that closes the loop — added in Phase C
    it("every Tazkia trait suggests a real Tafakkur topic", () => {
        for (const t of tazkiaTraits) {
            expect(typeof t.suggestedTafakkurSlug).toBe("string");
            expect(topicSlugs.has(t.suggestedTafakkurSlug)).toBe(true);
        }
    });

    it("every Tazkia trait has a transition prompt to carry the user back", () => {
        for (const t of tazkiaTraits) {
            expect(typeof t.transitionPrompt).toBe("string");
            expect(t.transitionPrompt.trim().length).toBeGreaterThan(20);
        }
    });

    it("the spiral can be walked from any Tafakkur topic back to a Tafakkur topic", () => {
        const topicsWithFullSpiral = tafakkurTopics.filter((t) => t.linkedAyahKey);
        expect(topicsWithFullSpiral.length).toBeGreaterThan(0);

        for (const topic of topicsWithFullSpiral) {
            const ayah = tadabburAyahs.find((a) => a.verseKey === topic.linkedAyahKey);
            expect(ayah).toBeDefined();

            if (!ayah.linkedTraitSlug) continue;
            const trait = tazkiaTraits.find((t) => t.slug === ayah.linkedTraitSlug);
            expect(trait).toBeDefined();

            // …and back to the start
            expect(topicSlugs.has(trait.suggestedTafakkurSlug)).toBe(true);
        }
    });
});
