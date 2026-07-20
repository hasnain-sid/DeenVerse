/**
 * Ruhani spiritual-practice tests.
 *
 * Regression guard for the validator/payload mismatch that made every
 * POST /api/v1/ruhani/practice return 422: savePracticeValidationRules
 * validated `type`/`content` while the client sends `practiceType`/`reflectionText`.
 *
 * Runs the real validator + real controller + real service against
 * mongodb-memory-server, so the request contract is exercised end to end.
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import express from "express";
import request from "supertest";

jest.mock("../config/logger.js", () => ({
    __esModule: true,
    default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { SpiritualPractice } from "../models/spiritualPracticeSchema.js";
import {
    savePracticeValidationRules,
    updatePracticeValidationRules,
} from "../middlewares/validators.js";
import {
    saveSpiritualPractice,
    getUserPractices,
    getPracticeById,
    updatePractice,
    deletePractice,
    exportJournal,
} from "../controller/ruhaniController.js";
import { getPractices } from "../services/ruhaniService.js";

// ── Helpers ─────────────────────────────────────────────────────────

const USER_A = new mongoose.Types.ObjectId().toString();
const USER_B = new mongoose.Types.ObjectId().toString();

/** The exact payload shape TafakkurPage sends (see ruhaniApi.ts SpiritualPracticePayload). */
const tafakkurPayload = (overrides = {}) => ({
    practiceType: "tafakkur",
    sourceRef: "the-sun",
    sourceTitle: "The Sun",
    reflectionText: "The sun rises without fail. I take that for granted.",
    ...overrides,
});

/**
 * Minimal app mirroring ruhaniRoute.js, with auth stubbed.
 * The rate limiter is deliberately omitted — it is Redis-backed and not under test.
 */
function buildApp(userId = USER_A) {
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
        req.user = userId;
        next();
    });
    app.post("/practice", savePracticeValidationRules(), saveSpiritualPractice);
    app.get("/practices", getUserPractices);
    app.get("/practices/:id", getPracticeById);
    app.patch("/practices/:id", updatePracticeValidationRules(), updatePractice);
    app.delete("/practices/:id", deletePractice);
    app.get("/journal/export", exportJournal);
    // Mirrors the shape of the global error handler
    app.use((err, _req, res, _next) => {
        res.status(err.statusCode || 500).json({ message: err.message });
    });
    return app;
}

// ── Global state ────────────────────────────────────────────────────

jest.setTimeout(60000);

let mongod;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

afterEach(async () => {
    await SpiritualPractice.deleteMany({});
});

// ── The regression test ─────────────────────────────────────────────

describe("POST /practice — client contract", () => {
    it("accepts the exact payload the frontend sends (regression: used to 422)", async () => {
        const res = await request(buildApp()).post("/practice").send(tafakkurPayload());

        expect(res.status).toBe(201);
        expect(res.body.practiceType).toBe("tafakkur");
        expect(res.body.sourceRef).toBe("the-sun");
        expect(res.body.reflectionText).toBe(tafakkurPayload().reflectionText);
    });

    it("persists the practice against the authenticated user", async () => {
        await request(buildApp(USER_A)).post("/practice").send(tafakkurPayload());

        const stored = await SpiritualPractice.find({ userId: USER_A });
        expect(stored).toHaveLength(1);
        expect(stored[0].isPrivate).toBe(true); // private by default
    });

    it("accepts the Tadabbur payload shape", async () => {
        const res = await request(buildApp()).post("/practice").send({
            practiceType: "tadabbur",
            sourceRef: "7:57",
            sourceTitle: "Quran 7:57",
            reflectionText: "Mercy arrives in stages.",
        });
        expect(res.status).toBe(201);
    });

    it("accepts the Tazkia payload shape, with rating and habit checks", async () => {
        const res = await request(buildApp()).post("/practice").send({
            practiceType: "tazkia",
            sourceRef: "sabr",
            sourceTitle: "Sabr (Patience)",
            reflectionText: "I will stay silent for ten seconds when provoked.",
            traitRating: 3,
            habitChecks: [
                { habit: "Prayed Fajr on time", completed: true },
                { habit: "Read a portion of Quran", completed: false },
            ],
        });

        expect(res.status).toBe(201);
        expect(res.body.traitRating).toBe(3);
        expect(res.body.habitChecks).toHaveLength(2);
        expect(res.body.habitChecks[0].completed).toBe(true);
    });

    it("round-trips guidedAnswers", async () => {
        const guidedAnswers = [
            { prompt: "What would happen if the sun did not rise tomorrow?", answer: "Everything ends." },
            { prompt: "How does your service to others compare?", answer: "Conditional. It shouldn't be." },
        ];

        const res = await request(buildApp())
            .post("/practice")
            .send(tafakkurPayload({ guidedAnswers }));

        expect(res.status).toBe(201);
        expect(res.body.guidedAnswers).toHaveLength(2);
        expect(res.body.guidedAnswers[0].prompt).toBe(guidedAnswers[0].prompt);
        expect(res.body.guidedAnswers[0].answer).toBe(guidedAnswers[0].answer);

        const stored = await SpiritualPractice.findOne({ userId: USER_A });
        expect(stored.guidedAnswers[1].answer).toBe("Conditional. It shouldn't be.");
    });
});

// ── Validation boundaries ───────────────────────────────────────────

describe("POST /practice — validation", () => {
    const expectRejected = async (payload) => {
        const res = await request(buildApp()).post("/practice").send(payload);
        expect(res.status).toBe(422);
        expect(await SpiritualPractice.countDocuments({})).toBe(0);
        return res;
    };

    it("rejects a missing practiceType", async () => {
        const { practiceType, ...rest } = tafakkurPayload();
        const res = await expectRejected(rest);
        expect(res.body.message).toMatch(/Practice type is required/);
    });

    it("rejects an unknown practiceType", async () => {
        const res = await expectRejected(tafakkurPayload({ practiceType: "dhikr" }));
        expect(res.body.message).toMatch(/Invalid practice type/);
    });

    it("reports only one error for a missing practiceType (bail)", async () => {
        const { practiceType, ...rest } = tafakkurPayload();
        const res = await request(buildApp()).post("/practice").send(rest);
        expect(res.body.message).not.toMatch(/Invalid practice type/);
    });

    it("rejects a missing sourceRef", async () => {
        const { sourceRef, ...rest } = tafakkurPayload();
        await expectRejected(rest);
    });

    it("rejects a missing sourceTitle", async () => {
        const { sourceTitle, ...rest } = tafakkurPayload();
        await expectRejected(rest);
    });

    it("rejects reflectionText over 10,000 characters", async () => {
        const res = await expectRejected(tafakkurPayload({ reflectionText: "a".repeat(10001) }));
        expect(res.body.message).toMatch(/10,000 characters/);
    });

    it("accepts reflectionText at exactly 10,000 characters", async () => {
        const res = await request(buildApp())
            .post("/practice")
            .send(tafakkurPayload({ reflectionText: "a".repeat(10000) }));
        expect(res.status).toBe(201);
    });

    it("rejects traitRating below 1", async () => {
        await expectRejected(tafakkurPayload({ practiceType: "tazkia", traitRating: 0 }));
    });

    it("rejects traitRating above 5", async () => {
        await expectRejected(tafakkurPayload({ practiceType: "tazkia", traitRating: 6 }));
    });

    it("accepts traitRating at the 1 and 5 boundaries", async () => {
        for (const traitRating of [1, 5]) {
            const res = await request(buildApp())
                .post("/practice")
                .send(tafakkurPayload({ practiceType: "tazkia", traitRating }));
            expect(res.status).toBe(201);
        }
    });

    it("rejects more than 20 guidedAnswers", async () => {
        const guidedAnswers = Array.from({ length: 21 }, (_, i) => ({
            prompt: `Q${i}`,
            answer: `A${i}`,
        }));
        await expectRejected(tafakkurPayload({ guidedAnswers }));
    });

    it("rejects more than 50 habitChecks", async () => {
        const habitChecks = Array.from({ length: 51 }, (_, i) => ({
            habit: `Habit ${i}`,
            completed: true,
        }));
        await expectRejected(tafakkurPayload({ habitChecks }));
    });
});

// ── Ownership isolation ─────────────────────────────────────────────

describe("practice ownership isolation", () => {
    let practiceIdOfA;

    beforeEach(async () => {
        const res = await request(buildApp(USER_A)).post("/practice").send(tafakkurPayload());
        practiceIdOfA = res.body._id;
    });

    it("lets the owner read their own practice", async () => {
        const res = await request(buildApp(USER_A)).get(`/practices/${practiceIdOfA}`);
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(practiceIdOfA);
    });

    it("does not let another user read it", async () => {
        const res = await request(buildApp(USER_B)).get(`/practices/${practiceIdOfA}`);
        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });

    it("does not leak another user's practices into the journal listing", async () => {
        await request(buildApp(USER_B)).post("/practice").send(
            tafakkurPayload({ sourceRef: "the-moon", sourceTitle: "The Moon" })
        );

        const res = await request(buildApp(USER_B)).get("/practices");
        expect(res.body.totalEntries).toBe(1);
        expect(res.body.practices[0].sourceRef).toBe("the-moon");
    });

    it("rejects a malformed practice id", async () => {
        const res = await request(buildApp(USER_A)).get("/practices/not-an-object-id");
        expect(res.status).toBe(400);
    });
});

// ── Pagination ──────────────────────────────────────────────────────

describe("getPractices pagination", () => {
    beforeEach(async () => {
        await SpiritualPractice.insertMany(
            Array.from({ length: 25 }, (_, i) => ({
                userId: USER_A,
                practiceType: i % 2 === 0 ? "tafakkur" : "tazkia",
                sourceRef: `topic-${i}`,
                sourceTitle: `Topic ${i}`,
                reflectionText: `Reflection ${i}`,
            }))
        );
    });

    it("paginates with correct totals", async () => {
        const result = await getPractices(USER_A, { page: 1, limit: 10 });
        expect(result.practices).toHaveLength(10);
        expect(result.totalEntries).toBe(25);
        expect(result.totalPages).toBe(3);
        expect(result.currentPage).toBe(1);
    });

    it("filters by practice type", async () => {
        const result = await getPractices(USER_A, { type: "tazkia", limit: 100 });
        expect(result.totalEntries).toBe(12);
        expect(result.practices.every((p) => p.practiceType === "tazkia")).toBe(true);
    });

    it("clamps an oversized limit to 100", async () => {
        const result = await getPractices(USER_A, { page: 1, limit: 5000 });
        expect(result.practices.length).toBeLessThanOrEqual(100);
    });

    it("clamps a page below 1", async () => {
        const result = await getPractices(USER_A, { page: 0, limit: 10 });
        expect(result.currentPage).toBe(1);
    });

    it("ignores an unknown type filter rather than returning nothing", async () => {
        const result = await getPractices(USER_A, { type: "nonsense", limit: 100 });
        expect(result.totalEntries).toBe(25);
    });
});

// ── Spiral chaining ─────────────────────────────────────────────────

describe("linkedPracticeId — chaining a spiral session", () => {
    it("links a Tadabbur entry to the Tafakkur that preceded it", async () => {
        const first = await request(buildApp(USER_A)).post("/practice").send(tafakkurPayload());

        const second = await request(buildApp(USER_A)).post("/practice").send({
            practiceType: "tadabbur",
            sourceRef: "36:38",
            sourceTitle: "Quran 36:38",
            reflectionText: "Following on from the sun.",
            linkedPracticeId: first.body._id,
        });

        expect(second.status).toBe(201);
        expect(String(second.body.linkedPracticeId)).toBe(String(first.body._id));
    });

    it("refuses to link to another user's practice, without failing the save", async () => {
        const foreign = await request(buildApp(USER_B)).post("/practice").send(tafakkurPayload());

        const mine = await request(buildApp(USER_A)).post("/practice").send(
            tafakkurPayload({ linkedPracticeId: foreign.body._id })
        );

        // The reflection is still saved — only the bogus link is dropped
        expect(mine.status).toBe(201);
        expect(mine.body.linkedPracticeId).toBeNull();
    });

    it("drops a link to a non-existent practice", async () => {
        const orphanId = new mongoose.Types.ObjectId().toString();
        const res = await request(buildApp(USER_A)).post("/practice").send(
            tafakkurPayload({ linkedPracticeId: orphanId })
        );

        expect(res.status).toBe(201);
        expect(res.body.linkedPracticeId).toBeNull();
    });

    it("rejects a malformed linkedPracticeId at validation", async () => {
        const res = await request(buildApp(USER_A)).post("/practice").send(
            tafakkurPayload({ linkedPracticeId: "not-an-id" })
        );
        expect(res.status).toBe(422);
    });
});

// ── Search ──────────────────────────────────────────────────────────

describe("journal search", () => {
    beforeEach(async () => {
        await request(buildApp(USER_A)).post("/practice").send(
            tafakkurPayload({ reflectionText: "The ocean is vast and humbling." })
        );
        await request(buildApp(USER_A)).post("/practice").send(
            tafakkurPayload({
                sourceRef: "the-moon",
                sourceTitle: "The Moon",
                reflectionText: "Borrowed light.",
                guidedAnswers: [{ prompt: "Which phase?", answer: "A waning crescent, honestly." }],
            })
        );
        await request(buildApp(USER_B)).post("/practice").send(
            tafakkurPayload({ reflectionText: "The ocean is vast and humbling." })
        );
    });

    it("matches on reflection text", async () => {
        const result = await getPractices(USER_A, { q: "humbling" });
        expect(result.totalEntries).toBe(1);
        expect(result.practices[0].reflectionText).toMatch(/humbling/);
    });

    it("matches on guided answers", async () => {
        const result = await getPractices(USER_A, { q: "waning crescent" });
        expect(result.totalEntries).toBe(1);
        expect(result.practices[0].sourceRef).toBe("the-moon");
    });

    it("matches on source title", async () => {
        const result = await getPractices(USER_A, { q: "moon" });
        expect(result.totalEntries).toBe(1);
    });

    it("is case-insensitive", async () => {
        const result = await getPractices(USER_A, { q: "HUMBLING" });
        expect(result.totalEntries).toBe(1);
    });

    it("never reaches another user's entries", async () => {
        const result = await getPractices(USER_B, { q: "humbling" });
        expect(result.totalEntries).toBe(1); // B's own copy only

        const forA = await getPractices(USER_A, { q: "humbling" });
        expect(forA.practices.every((p) => String(p.userId) === USER_A)).toBe(true);
    });

    it("treats regex metacharacters as literal text", async () => {
        // Would match everything if the term were interpreted as a pattern
        const result = await getPractices(USER_A, { q: ".*" });
        expect(result.totalEntries).toBe(0);
    });

    it("combines with the type filter", async () => {
        const result = await getPractices(USER_A, { q: "humbling", type: "tazkia" });
        expect(result.totalEntries).toBe(0);
    });

    it("returns everything for a blank search", async () => {
        const result = await getPractices(USER_A, { q: "   " });
        expect(result.totalEntries).toBe(2);
    });
});

// ── Editing ─────────────────────────────────────────────────────────

describe("PATCH /practices/:id", () => {
    let idOfA;

    beforeEach(async () => {
        const res = await request(buildApp(USER_A)).post("/practice").send(
            tafakkurPayload({ reflectionText: "First thoughts." })
        );
        idOfA = res.body._id;
    });

    it("updates the owner's reflection text", async () => {
        const res = await request(buildApp(USER_A))
            .patch(`/practices/${idOfA}`)
            .send({ reflectionText: "On reflection, something deeper." });

        expect(res.status).toBe(200);
        expect(res.body.reflectionText).toBe("On reflection, something deeper.");

        const stored = await SpiritualPractice.findById(idOfA);
        expect(stored.reflectionText).toBe("On reflection, something deeper.");
    });

    it("updates guidedAnswers", async () => {
        const res = await request(buildApp(USER_A))
            .patch(`/practices/${idOfA}`)
            .send({ guidedAnswers: [{ prompt: "Q", answer: "A revised answer" }] });

        expect(res.status).toBe(200);
        expect(res.body.guidedAnswers[0].answer).toBe("A revised answer");
    });

    it("leaves the source identity untouched even if the client sends it", async () => {
        await request(buildApp(USER_A)).patch(`/practices/${idOfA}`).send({
            reflectionText: "Edited.",
            practiceType: "tazkia",
            sourceRef: "hacked",
            sourceTitle: "Hacked",
        });

        const stored = await SpiritualPractice.findById(idOfA);
        expect(stored.practiceType).toBe("tafakkur");
        expect(stored.sourceRef).toBe("the-sun");
        expect(stored.sourceTitle).toBe("The Sun");
    });

    it("does not let another user edit it", async () => {
        const res = await request(buildApp(USER_B))
            .patch(`/practices/${idOfA}`)
            .send({ reflectionText: "Not mine to edit." });

        expect(res.status).toBe(404);

        const stored = await SpiritualPractice.findById(idOfA);
        expect(stored.reflectionText).toBe("First thoughts.");
    });

    it("rejects an empty update", async () => {
        const res = await request(buildApp(USER_A)).patch(`/practices/${idOfA}`).send({});
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/No editable fields/);
    });

    it("enforces the reflection length limit on edit", async () => {
        const res = await request(buildApp(USER_A))
            .patch(`/practices/${idOfA}`)
            .send({ reflectionText: "a".repeat(10001) });
        expect(res.status).toBe(422);
    });

    it("rejects a malformed id", async () => {
        const res = await request(buildApp(USER_A))
            .patch("/practices/not-an-id")
            .send({ reflectionText: "x" });
        expect(res.status).toBe(400);
    });
});

// ── Deletion ────────────────────────────────────────────────────────

describe("DELETE /practices/:id", () => {
    let idOfA;

    beforeEach(async () => {
        const res = await request(buildApp(USER_A)).post("/practice").send(tafakkurPayload());
        idOfA = res.body._id;
    });

    it("hard-deletes the owner's practice", async () => {
        const res = await request(buildApp(USER_A)).delete(`/practices/${idOfA}`);

        expect(res.status).toBe(200);
        expect(res.body.deleted).toBe(true);
        expect(await SpiritualPractice.findById(idOfA)).toBeNull();
    });

    it("removes it from the journal listing", async () => {
        await request(buildApp(USER_A)).delete(`/practices/${idOfA}`);
        const res = await request(buildApp(USER_A)).get("/practices");
        expect(res.body.totalEntries).toBe(0);
    });

    it("does not let another user delete it", async () => {
        const res = await request(buildApp(USER_B)).delete(`/practices/${idOfA}`);

        expect(res.status).toBe(404);
        expect(await SpiritualPractice.findById(idOfA)).not.toBeNull();
    });

    it("returns 404 for an already-deleted practice", async () => {
        await request(buildApp(USER_A)).delete(`/practices/${idOfA}`);
        const res = await request(buildApp(USER_A)).delete(`/practices/${idOfA}`);
        expect(res.status).toBe(404);
    });

    it("rejects a malformed id", async () => {
        const res = await request(buildApp(USER_A)).delete("/practices/not-an-id");
        expect(res.status).toBe(400);
    });
});

// ── Export ──────────────────────────────────────────────────────────

describe("GET /journal/export", () => {
    beforeEach(async () => {
        await request(buildApp(USER_A)).post("/practice").send(tafakkurPayload());
        await request(buildApp(USER_A)).post("/practice").send(
            tafakkurPayload({ sourceRef: "the-moon", sourceTitle: "The Moon" })
        );
        await request(buildApp(USER_B)).post("/practice").send(
            tafakkurPayload({ sourceRef: "bees", sourceTitle: "Bees" })
        );
    });

    it("returns only the requesting user's entries", async () => {
        const res = await request(buildApp(USER_A)).get("/journal/export");

        expect(res.status).toBe(200);
        expect(res.body.totalEntries).toBe(2);
        const refs = res.body.practices.map((p) => p.sourceRef);
        expect(refs).toEqual(expect.arrayContaining(["the-sun", "the-moon"]));
        expect(refs).not.toContain("bees");
    });

    it("serves as a download and omits internal fields", async () => {
        const res = await request(buildApp(USER_A)).get("/journal/export");

        expect(res.headers["content-disposition"]).toMatch(/attachment; filename="ruhani-journal-/);
        expect(res.body.practices[0].userId).toBeUndefined();
        expect(res.body.practices[0].__v).toBeUndefined();
        expect(res.body.exportedAt).toBeDefined();
    });

    it("returns an empty export for a user with no entries", async () => {
        const res = await request(buildApp(new mongoose.Types.ObjectId().toString()))
            .get("/journal/export");

        expect(res.status).toBe(200);
        expect(res.body.totalEntries).toBe(0);
        expect(res.body.practices).toEqual([]);
    });
});
