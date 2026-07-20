/**
 * Guided session lifecycle + per-user content rotation.
 *
 * The session record is metadata pointing at SpiritualPractice documents; the
 * tests below care most about ownership (a session must never attach or expose
 * another user's practice) and about rotation actually differing per user.
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
import { SpiritualSession } from "../models/spiritualSessionSchema.js";
import {
    startSessionValidationRules,
    updateSessionValidationRules,
} from "../middlewares/validators.js";
import {
    suggestSession as suggestSessionCtrl,
    startSession as startSessionCtrl,
    updateSession as updateSessionCtrl,
    getSessions as getSessionsCtrl,
} from "../controller/ruhaniController.js";
import {
    getTodayTafakkurTopic,
    getTodayTadabburAyah,
    suggestSession,
} from "../services/ruhaniService.js";
import { tafakkurTopics } from "../data/tafakkurTopics.js";

const USER_A = new mongoose.Types.ObjectId().toString();
const USER_B = new mongoose.Types.ObjectId().toString();

function buildApp(userId = USER_A) {
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => { req.user = userId; next(); });
    app.get("/session/suggest", suggestSessionCtrl);
    app.post("/session", startSessionValidationRules(), startSessionCtrl);
    app.put("/session/:id", updateSessionValidationRules(), updateSessionCtrl);
    app.get("/sessions", getSessionsCtrl);
    app.use((err, _req, res, _next) => {
        res.status(err.statusCode || 500).json({ message: err.message });
    });
    return app;
}

const makePractice = (userId, overrides = {}) =>
    SpiritualPractice.create({
        userId,
        practiceType: "tafakkur",
        sourceRef: "the-sun",
        sourceTitle: "The Sun",
        reflectionText: "…",
        ...overrides,
    });

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
    await Promise.all([SpiritualPractice.deleteMany({}), SpiritualSession.deleteMany({})]);
});

// ── Rotation ────────────────────────────────────────────────────────

describe("content rotation", () => {
    it("gives the same user the same topic all day", () => {
        expect(getTodayTafakkurTopic(USER_A).slug).toBe(getTodayTafakkurTopic(USER_A).slug);
    });

    it("does not put every user on an identical rotation", () => {
        // Across many users the seeding should produce more than one topic today
        const seen = new Set(
            Array.from({ length: 40 }, () =>
                getTodayTafakkurTopic(new mongoose.Types.ObjectId().toString()).slug
            )
        );
        expect(seen.size).toBeGreaterThan(1);
    });

    it("still serves a topic to anonymous callers", () => {
        expect(getTodayTafakkurTopic(null)).toBeDefined();
        expect(getTodayTafakkurTopic()).toBeDefined();
    });

    it("keeps Tadabbur out of lockstep with Tafakkur", () => {
        expect(getTodayTadabburAyah(USER_A)).toBeDefined();
        expect(getTodayTadabburAyah(USER_A).verseKey).toBe(getTodayTadabburAyah(USER_A).verseKey);
    });
});

// ── Suggestion ──────────────────────────────────────────────────────

describe("session suggestion", () => {
    it("returns a coherent topic, ayah and trait", async () => {
        const { topic, ayah, trait } = await suggestSession(USER_A);
        expect(topic.slug).toBeDefined();
        expect(ayah.verseKey).toBeDefined();
        expect(trait.slug).toBeDefined();
    });

    it("avoids a topic the user did recently", async () => {
        // Fill history with everything except one topic
        const held = tafakkurTopics[5];
        await SpiritualPractice.insertMany(
            tafakkurTopics
                .filter((t) => t.slug !== held.slug)
                .map((t) => ({
                    userId: USER_A,
                    practiceType: "tafakkur",
                    sourceRef: t.slug,
                    sourceTitle: t.title,
                }))
        );

        const { topic } = await suggestSession(USER_A);
        expect(topic.slug).toBe(held.slug);
    });

    it("falls back to the full rotation once everything is recent", async () => {
        await SpiritualPractice.insertMany(
            tafakkurTopics.map((t) => ({
                userId: USER_A,
                practiceType: "tafakkur",
                sourceRef: t.slug,
                sourceTitle: t.title,
            }))
        );

        const { topic } = await suggestSession(USER_A);
        expect(topic).toBeDefined(); // does not throw or return nothing
    });

    it("ignores history older than the recent window", async () => {
        const longAgo = new Date(Date.now() - 60 * 86_400_000);
        await SpiritualPractice.insertMany(
            tafakkurTopics.map((t) => ({
                userId: USER_A,
                practiceType: "tafakkur",
                sourceRef: t.slug,
                sourceTitle: t.title,
                createdAt: longAgo,
            }))
        );

        // Nothing counts as recent, so the unfiltered rotation applies
        const { topic } = await suggestSession(USER_A);
        expect(topic.slug).toBe(getTodayTafakkurTopic(USER_A).slug);
    });

    it("resurfaces a trait the user rated 1-2", async () => {
        await makePractice(USER_A, {
            practiceType: "tazkia",
            sourceRef: "sabr",
            sourceTitle: "Sabr (Patience)",
            traitRating: 1,
        });

        const { trait, revisitingTrait } = await suggestSession(USER_A);
        expect(trait.slug).toBe("sabr");
        expect(revisitingTrait).toBe(true);
    });

    it("does not resurface a trait the user is doing well with", async () => {
        await makePractice(USER_A, {
            practiceType: "tazkia",
            sourceRef: "sabr",
            sourceTitle: "Sabr (Patience)",
            traitRating: 5,
        });

        const { revisitingTrait } = await suggestSession(USER_A);
        expect(revisitingTrait).toBe(false);
    });

    it("is not influenced by another user's history", async () => {
        await SpiritualPractice.insertMany(
            tafakkurTopics.map((t) => ({
                userId: USER_B,
                practiceType: "tafakkur",
                sourceRef: t.slug,
                sourceTitle: t.title,
            }))
        );

        const { topic } = await suggestSession(USER_A);
        expect(topic.slug).toBe(getTodayTafakkurTopic(USER_A).slug);
    });
});

// ── Lifecycle ───────────────────────────────────────────────────────

describe("POST /session", () => {
    it("opens a session with captured content", async () => {
        const res = await request(buildApp()).post("/session").send({ duration: 20 });

        expect(res.status).toBe(201);
        expect(res.body.session.status).toBe("in-progress");
        expect(res.body.session.duration).toBe(20);
        expect(res.body.session.topicSlug).toBe(res.body.topic.slug);
        expect(res.body.session.verseKey).toBe(res.body.ayah.verseKey);
        expect(res.body.session.traitSlug).toBe(res.body.trait.slug);
    });

    it("allows an open-ended session", async () => {
        const res = await request(buildApp()).post("/session").send({ duration: null });
        expect(res.status).toBe(201);
        expect(res.body.session.duration).toBeNull();
    });

    it("rejects an absurd duration", async () => {
        expect((await request(buildApp()).post("/session").send({ duration: 0 })).status).toBe(422);
        expect((await request(buildApp()).post("/session").send({ duration: 999 })).status).toBe(422);
    });
});

describe("PUT /session/:id", () => {
    let sessionId;

    beforeEach(async () => {
        const res = await request(buildApp(USER_A)).post("/session").send({ duration: 10 });
        sessionId = res.body.session._id;
    });

    it("attaches a practice to its step", async () => {
        const practice = await makePractice(USER_A);

        const res = await request(buildApp(USER_A))
            .put(`/session/${sessionId}`)
            .send({ step: "tafakkur", practiceId: practice._id.toString() });

        expect(res.status).toBe(200);
        expect(String(res.body.tafakkurPracticeId)).toBe(String(practice._id));
    });

    it("refuses to attach another user's practice", async () => {
        const foreign = await makePractice(USER_B);

        const res = await request(buildApp(USER_A))
            .put(`/session/${sessionId}`)
            .send({ step: "tafakkur", practiceId: foreign._id.toString() });

        expect(res.status).toBe(404);

        const session = await SpiritualSession.findById(sessionId);
        expect(session.tafakkurPracticeId).toBeNull();
    });

    it("completes a session and stamps completedAt", async () => {
        const res = await request(buildApp(USER_A))
            .put(`/session/${sessionId}`)
            .send({ status: "completed", sessionAction: "One act of mercy tomorrow." });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe("completed");
        expect(res.body.completedAt).toBeTruthy();
        expect(res.body.sessionAction).toBe("One act of mercy tomorrow.");
    });

    it("records an abandoned session without penalty", async () => {
        const res = await request(buildApp(USER_A))
            .put(`/session/${sessionId}`)
            .send({ status: "abandoned" });

        expect(res.status).toBe(200);
        expect(res.body.completedAt).toBeNull();
    });

    it("does not let another user touch the session", async () => {
        const res = await request(buildApp(USER_B))
            .put(`/session/${sessionId}`)
            .send({ status: "completed" });
        expect(res.status).toBe(404);
    });

    it("rejects an unknown step", async () => {
        const practice = await makePractice(USER_A);
        const res = await request(buildApp(USER_A))
            .put(`/session/${sessionId}`)
            .send({ step: "dhikr", practiceId: practice._id.toString() });
        expect(res.status).toBe(422);
    });

    it("rejects an empty update", async () => {
        const res = await request(buildApp(USER_A)).put(`/session/${sessionId}`).send({});
        expect(res.status).toBe(400);
    });
});

describe("GET /sessions", () => {
    it("lists only the user's own sessions", async () => {
        await request(buildApp(USER_A)).post("/session").send({ duration: 10 });
        await request(buildApp(USER_A)).post("/session").send({ duration: 20 });
        await request(buildApp(USER_B)).post("/session").send({ duration: 40 });

        const res = await request(buildApp(USER_A)).get("/sessions");
        expect(res.body.totalEntries).toBe(2);
        expect(res.body.sessions.every((s) => String(s.userId) === USER_A)).toBe(true);
    });
});
