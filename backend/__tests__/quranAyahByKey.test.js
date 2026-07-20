/**
 * GET /quran/ayah/by-key/:verseKey
 *
 * Added so callers that think in verse references ("7:57") — the Quran reader and
 * Ruhani Tadabbur — can resolve an ayah without first converting to a global id.
 * The upstream fetch is mocked; what matters here is key parsing and bounds.
 */

import express from "express";
import request from "supertest";

jest.mock("../config/logger.js", () => ({
    __esModule: true,
    default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

// Only getAyah talks to the network; findAyahIdBySurah is pure quran-meta
jest.mock("../services/quranService.js", () => {
    const actual = jest.requireActual("../services/quranService.js");
    return {
        ...actual,
        getAyah: jest.fn(),
    };
});

import { getAyah } from "../services/quranService.js";
import { getAyahByVerseKey } from "../controller/quranController.js";

function buildApp() {
    const app = express();
    app.get("/ayah/by-key/:verseKey", getAyahByVerseKey);
    app.use((err, _req, res, _next) => {
        res.status(err.statusCode || 500).json({ message: err.message });
    });
    return app;
}

beforeEach(() => {
    jest.clearAllMocks();
    getAyah.mockResolvedValue({
        referenceId: "7:57",
        arabic: "…",
        translation: "…",
        surah: "Al-A'raf",
        globalAyahNumber: 1011,
    });
});

describe("resolving a verse key", () => {
    it("resolves the first ayah of the Quran to global id 1", async () => {
        await request(buildApp()).get("/ayah/by-key/1:1");
        expect(getAyah).toHaveBeenCalledWith(1);
    });

    it("resolves the very last ayah to global id 6236", async () => {
        await request(buildApp()).get("/ayah/by-key/114:6");
        expect(getAyah).toHaveBeenCalledWith(6236);
    });

    it("resolves a mid-Quran reference", async () => {
        const res = await request(buildApp()).get("/ayah/by-key/7:57");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        // Al-A'raf 57 — the ayah the Ruhani rain/mercy content is built around
        expect(getAyah).toHaveBeenCalledWith(1011);
    });
});

describe("rejecting bad keys", () => {
    const expectRejected = async (key, pattern) => {
        const res = await request(buildApp()).get(`/ayah/by-key/${encodeURIComponent(key)}`);
        expect(res.status).toBe(400);
        if (pattern) expect(res.body.message).toMatch(pattern);
        expect(getAyah).not.toHaveBeenCalled();
        return res;
    };

    it("rejects a malformed key", async () => {
        await expectRejected("hello", /surah:ayah/);
    });

    it("rejects a missing ayah part", async () => {
        await expectRejected("7", /surah:ayah/);
    });

    it("rejects surah 0 and surah 115", async () => {
        await expectRejected("0:1", /between 1 and 114/);
        await expectRejected("115:1", /between 1 and 114/);
    });

    it("rejects an ayah beyond the end of its surah", async () => {
        // Al-Fatiha has 7 ayahs
        await expectRejected("1:8", /no ayah/);
    });

    it("rejects ayah 0", async () => {
        await expectRejected("2:0", /no ayah/);
    });

    it("does not treat a negative number as valid", async () => {
        await expectRejected("-1:5");
    });
});
