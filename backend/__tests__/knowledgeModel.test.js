import mongoose from "mongoose";
import { SeerahEvent } from "../models/seerahEventSchema.js";
import { HadithRef } from "../models/hadithRefSchema.js";
import { TafsirPassage } from "../models/tafsirPassageSchema.js";
import { KnowledgeLink } from "../models/knowledgeLinkSchema.js";
import { ReviewDecision } from "../models/reviewDecisionSchema.js";
import { KnowledgeAuditEvent } from "../models/knowledgeAuditEventSchema.js";
import { User } from "../models/userSchema.js";
import { domainForRelation } from "../utils/knowledgeDomain.js";

// ── Helpers ──────────────────────────────────────────────

const oid = () => new mongoose.Types.ObjectId();

const validEvent = () => ({
  title: "Test Event One",
  segment: "badr",
  narrativeOrder: 1,
  summary: "Placeholder summary.",
  author: oid(),
});

const validHadithRef = () => ({
  collection: "bukhari",
  number: "PLACEHOLDER-0001",
  gloss: "Placeholder gloss.",
});

const validTafsirPassage = () => ({
  work: "ibn-kathir",
  verseKey: "8:9",
  locator: "Placeholder locator",
  summary: "Placeholder summary.",
});

const validLink = () => ({
  fromType: "ayah",
  fromRef: "8:9",
  toType: "seerahEvent",
  toRef: oid().toString(),
  relation: "revealed_concerning",
  source: { work: "Placeholder Work", locator: "Placeholder locator" },
  grading: { label: "mursal", basis: "Placeholder basis." },
  confidence: "reported",
  disagreement: { flag: false },
  snapshotHash: "a".repeat(64),
  review: { domain: "asbab-al-nuzul" },
  author: oid(),
});

const validDecision = () => ({
  link: oid(),
  linkVersion: 1,
  reviewer: oid(),
  domain: "asbab-al-nuzul",
  position: "accept",
  snapshotHash: "a".repeat(64),
});

const validAuditEvent = () => ({
  actor: oid(),
  action: "link_created",
  targetType: "knowledgeLink",
  targetId: oid(),
});

// ─────────────────────────────────────────────────────────
// SeerahEvent
// ─────────────────────────────────────────────────────────

describe("SeerahEvent model", () => {
  it("passes validation with all required fields", () => {
    expect(new SeerahEvent(validEvent()).validateSync()).toBeUndefined();
  });

  it.each(["title", "segment", "narrativeOrder", "summary", "author"])(
    "rejects when %s is missing",
    (field) => {
      const data = validEvent();
      delete data[field];
      const err = new SeerahEvent(data).validateSync();
      expect(err).toBeDefined();
      expect(err.errors[field]).toBeDefined();
    }
  );

  it("rejects a segment outside the enum", () => {
    const err = new SeerahEvent({ ...validEvent(), segment: "uhud" }).validateSync();
    expect(err?.errors.segment).toBeDefined();
  });

  it("rejects a title over 200 characters", () => {
    const err = new SeerahEvent({ ...validEvent(), title: "x".repeat(201) }).validateSync();
    expect(err?.errors.title).toBeDefined();
  });

  it("rejects a summary over 2000 characters", () => {
    const err = new SeerahEvent({ ...validEvent(), summary: "x".repeat(2001) }).validateSync();
    expect(err?.errors.summary).toBeDefined();
  });

  it("defaults review.state to draft", () => {
    expect(new SeerahEvent(validEvent()).review.state).toBe("draft");
  });

  it("rejects a review.state outside the enum", () => {
    const doc = new SeerahEvent(validEvent());
    doc.review.state = "published";
    expect(doc.validateSync()?.errors["review.state"]).toBeDefined();
  });

  // Dating is plural on purpose — sources disagree and must not be collapsed.
  it("accepts multiple datings", () => {
    const doc = new SeerahEvent({
      ...validEvent(),
      dating: [
        { source: "A", hijriYear: 2, hijriMonth: 9, hijriDay: 17 },
        { source: "B", hijriYear: 2 },
      ],
    });
    expect(doc.validateSync()).toBeUndefined();
    expect(doc.dating).toHaveLength(2);
  });

  it("requires source and hijriYear on each dating", () => {
    const err = new SeerahEvent({
      ...validEvent(),
      dating: [{ hijriMonth: 9 }],
    }).validateSync();
    expect(err).toBeDefined();
    expect(Object.keys(err.errors).join(" ")).toMatch(/dating/);
  });

  it("rejects an out-of-range hijriMonth", () => {
    const err = new SeerahEvent({
      ...validEvent(),
      dating: [{ source: "A", hijriYear: 2, hijriMonth: 13 }],
    }).validateSync();
    expect(err).toBeDefined();
  });

  it("rejects an out-of-range hijriDay", () => {
    const err = new SeerahEvent({
      ...validEvent(),
      dating: [{ source: "A", hijriYear: 2, hijriDay: 31 }],
    }).validateSync();
    expect(err).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────
// HadithRef
// ─────────────────────────────────────────────────────────

describe("HadithRef model", () => {
  it("passes validation with all required fields", () => {
    expect(new HadithRef(validHadithRef()).validateSync()).toBeUndefined();
  });

  it.each(["collection", "number", "gloss"])("rejects when %s is missing", (field) => {
    const data = validHadithRef();
    delete data[field];
    const err = new HadithRef(data).validateSync();
    expect(err?.errors[field]).toBeDefined();
  });

  it("rejects a collection outside the enum", () => {
    const err = new HadithRef({
      ...validHadithRef(),
      collection: "not-a-real-collection",
    }).validateSync();
    expect(err?.errors.collection).toBeDefined();
  });

  it("keeps number a string so ids like 1763a survive", () => {
    const doc = new HadithRef({ ...validHadithRef(), number: "1763a" });
    expect(doc.validateSync()).toBeUndefined();
    expect(doc.number).toBe("1763a");
  });

  it("rejects a gloss over 500 characters", () => {
    const err = new HadithRef({ ...validHadithRef(), gloss: "x".repeat(501) }).validateSync();
    expect(err?.errors.gloss).toBeDefined();
  });

  it("rejects a matnArabicExcerpt over 1000 characters", () => {
    const err = new HadithRef({
      ...validHadithRef(),
      matnArabicExcerpt: "x".repeat(1001),
    }).validateSync();
    expect(err?.errors.matnArabicExcerpt).toBeDefined();
  });

  it("defaults matnArabicExcerpt to null — a link is not a copy", () => {
    expect(new HadithRef(validHadithRef()).matnArabicExcerpt).toBeNull();
  });

  // Gradings are plural and attributed — never a single unattributed grade.
  it("requires grade, grader and source on every grading", () => {
    const err = new HadithRef({
      ...validHadithRef(),
      gradings: [{ grade: "sahih" }],
    }).validateSync();
    expect(err).toBeDefined();
    expect(Object.keys(err.errors).join(" ")).toMatch(/gradings/);
  });

  it("rejects a grade outside the enum", () => {
    const err = new HadithRef({
      ...validHadithRef(),
      gradings: [{ grade: "excellent", grader: "X", source: "Y" }],
    }).validateSync();
    expect(err).toBeDefined();
  });

  it("accepts multiple attributed gradings", () => {
    const doc = new HadithRef({
      ...validHadithRef(),
      gradings: [
        { grade: "sahih", grader: "A", source: "S1" },
        { grade: "hasan", grader: "B", source: "S2" },
      ],
    });
    expect(doc.validateSync()).toBeUndefined();
    expect(doc.gradings).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────
// TafsirPassage
// ─────────────────────────────────────────────────────────

describe("TafsirPassage model", () => {
  it("passes validation with all required fields", () => {
    expect(new TafsirPassage(validTafsirPassage()).validateSync()).toBeUndefined();
  });

  it.each(["work", "verseKey", "locator", "summary"])(
    "rejects when %s is missing",
    (field) => {
      const data = validTafsirPassage();
      delete data[field];
      const err = new TafsirPassage(data).validateSync();
      expect(err?.errors[field]).toBeDefined();
    }
  );

  it("rejects a work outside the enum", () => {
    const err = new TafsirPassage({ ...validTafsirPassage(), work: "my-blog" }).validateSync();
    expect(err?.errors.work).toBeDefined();
  });

  it.each(["8", "8:", "abc", "8:9:1", "1234:9"])(
    "rejects malformed verseKey %s",
    (verseKey) => {
      const err = new TafsirPassage({ ...validTafsirPassage(), verseKey }).validateSync();
      expect(err?.errors.verseKey).toBeDefined();
    }
  );

  it("accepts a well-formed verseKey", () => {
    expect(
      new TafsirPassage({ ...validTafsirPassage(), verseKey: "114:6" }).validateSync()
    ).toBeUndefined();
  });

  it("rejects a summary over 1500 characters", () => {
    const err = new TafsirPassage({
      ...validTafsirPassage(),
      summary: "x".repeat(1501),
    }).validateSync();
    expect(err?.errors.summary).toBeDefined();
  });

  it("defaults arabicExcerpt to null — null is a valid, honest value", () => {
    expect(new TafsirPassage(validTafsirPassage()).arabicExcerpt).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────
// KnowledgeLink
// ─────────────────────────────────────────────────────────

describe("KnowledgeLink model — fields", () => {
  it("passes validation with all required fields", () => {
    expect(new KnowledgeLink(validLink()).validateSync()).toBeUndefined();
  });

  it.each([
    "fromType",
    "fromRef",
    "toType",
    "toRef",
    "relation",
    "confidence",
    "snapshotHash",
    "author",
  ])("rejects when %s is missing", (field) => {
    const data = validLink();
    delete data[field];
    const err = new KnowledgeLink(data).validateSync();
    expect(err?.errors[field]).toBeDefined();
  });

  // Provenance is the machine-checkable visibility gate (§1.6) — all of it is required.
  it.each([
    ["source.work", (d) => delete d.source.work],
    ["source.locator", (d) => delete d.source.locator],
    ["grading.label", (d) => delete d.grading.label],
    ["grading.basis", (d) => delete d.grading.basis],
    ["disagreement.flag", (d) => delete d.disagreement.flag],
  ])("rejects when %s is missing", (path, mutate) => {
    const data = validLink();
    mutate(data);
    const err = new KnowledgeLink(data).validateSync();
    expect(err?.errors[path]).toBeDefined();
  });

  it("requires review.domain", () => {
    const data = validLink();
    delete data.review;
    const err = new KnowledgeLink(data).validateSync();
    expect(err?.errors["review.domain"]).toBeDefined();
  });

  it.each(["fromType", "toType"])("rejects a %s outside the node-type enum", (field) => {
    const err = new KnowledgeLink({ ...validLink(), [field]: "person" }).validateSync();
    expect(err?.errors[field]).toBeDefined();
  });

  it("rejects a relation outside the enum", () => {
    const err = new KnowledgeLink({ ...validLink(), relation: "sort_of_about" }).validateSync();
    expect(err?.errors.relation).toBeDefined();
  });

  it("rejects a grading label outside the enum", () => {
    const data = validLink();
    data.grading.label = "probably-fine";
    const err = new KnowledgeLink(data).validateSync();
    expect(err?.errors["grading.label"]).toBeDefined();
  });

  it("rejects a confidence outside the enum", () => {
    const err = new KnowledgeLink({ ...validLink(), confidence: "certain" }).validateSync();
    expect(err?.errors.confidence).toBeDefined();
  });

  it("rejects a review.domain outside the enum", () => {
    const data = validLink();
    data.review.domain = "vibes";
    const err = new KnowledgeLink(data).validateSync();
    expect(err?.errors["review.domain"]).toBeDefined();
  });

  it("rejects a review.state outside the enum", () => {
    const data = validLink();
    data.review.state = "published";
    const err = new KnowledgeLink(data).validateSync();
    expect(err?.errors["review.state"]).toBeDefined();
  });

  it("rejects a grading basis over 500 characters", () => {
    const data = validLink();
    data.grading.basis = "x".repeat(501);
    const err = new KnowledgeLink(data).validateSync();
    expect(err?.errors["grading.basis"]).toBeDefined();
  });

  it("rejects a disagreement summary over 1000 characters", () => {
    const data = validLink();
    data.disagreement.summary = "x".repeat(1001);
    const err = new KnowledgeLink(data).validateSync();
    expect(err?.errors["disagreement.summary"]).toBeDefined();
  });

  it("rejects a version below 1", () => {
    const err = new KnowledgeLink({ ...validLink(), version: 0 }).validateSync();
    expect(err?.errors.version).toBeDefined();
  });

  it("applies the documented defaults", () => {
    const doc = new KnowledgeLink(validLink());
    expect(doc.review.state).toBe("draft");
    expect(doc.review.acceptCount).toBe(0);
    expect(doc.review.objectCount).toBe(0);
    expect(doc.review.lastDecisionAt).toBeNull();
    expect(doc.version).toBe(1);
    expect(doc.supersedes).toBeNull();
  });
});

// The structural rule the plan calls out specifically. Note this runs through
// validate(), not validateSync() — validateSync skips middleware, so a pre("validate")
// hook does not fire there.
describe("KnowledgeLink model — revealed_concerning pre-validate hook", () => {
  it("rejects revealed_concerning with a curatorial grading", async () => {
    const data = validLink();
    data.relation = "revealed_concerning";
    data.grading.label = "curatorial";

    await expect(new KnowledgeLink(data).validate()).rejects.toThrow(
      /requires transmitted evidence/
    );
  });

  it("allows revealed_concerning with transmitted evidence", async () => {
    const data = validLink();
    data.relation = "revealed_concerning";
    data.grading.label = "mursal";

    await expect(new KnowledgeLink(data).validate()).resolves.toBeUndefined();
  });

  it("allows thematically_related with a curatorial grading", async () => {
    const data = validLink();
    data.relation = "thematically_related";
    data.grading.label = "curatorial";
    data.review.domain = domainForRelation("thematically_related");

    await expect(new KnowledgeLink(data).validate()).resolves.toBeUndefined();
  });

  it("does not fire on validateSync — callers must use validate()", () => {
    const data = validLink();
    data.relation = "revealed_concerning";
    data.grading.label = "curatorial";

    // Documents the trap: a seed or service relying on validateSync would let this
    // structurally invalid edge through.
    expect(new KnowledgeLink(data).validateSync()).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────
// domainForRelation
// ─────────────────────────────────────────────────────────

describe("domainForRelation", () => {
  it.each([
    ["revealed_concerning", "asbab-al-nuzul"],
    ["references", "asbab-al-nuzul"],
    ["thematically_related", "asbab-al-nuzul"],
    ["attested_by", "hadith-grading"],
    ["dated_by", "seerah-chronology"],
    ["explained_by", "tafsir-attribution"],
  ])("maps %s to %s", (relation, domain) => {
    expect(domainForRelation(relation)).toBe(domain);
  });

  it("throws for an unknown relation rather than guessing", () => {
    expect(() => domainForRelation("invented")).toThrow(/No reviewer domain/);
  });

  it("returns a domain the schema accepts, for every relation in the enum", () => {
    const relations = KnowledgeLink.schema.path("relation").enumValues;
    for (const relation of relations) {
      const data = validLink();
      data.relation = relation;
      data.review.domain = domainForRelation(relation);
      expect(new KnowledgeLink(data).validateSync()?.errors["review.domain"]).toBeUndefined();
    }
  });
});

// ─────────────────────────────────────────────────────────
// ReviewDecision
// ─────────────────────────────────────────────────────────

describe("ReviewDecision model", () => {
  it("passes validation with all required fields", () => {
    expect(new ReviewDecision(validDecision()).validateSync()).toBeUndefined();
  });

  it.each(["link", "linkVersion", "reviewer", "domain", "position", "snapshotHash"])(
    "rejects when %s is missing",
    (field) => {
      const data = validDecision();
      delete data[field];
      const err = new ReviewDecision(data).validateSync();
      expect(err?.errors[field]).toBeDefined();
    }
  );

  it.each(["accept", "accept-with-note", "object", "challenge"])(
    "accepts position %s",
    (position) => {
      expect(
        new ReviewDecision({ ...validDecision(), position }).validateSync()
      ).toBeUndefined();
    }
  );

  it("rejects a position outside the enum", () => {
    const err = new ReviewDecision({ ...validDecision(), position: "approve" }).validateSync();
    expect(err?.errors.position).toBeDefined();
  });

  it("rejects a note over 3000 characters", () => {
    const err = new ReviewDecision({
      ...validDecision(),
      note: "x".repeat(3001),
    }).validateSync();
    expect(err?.errors.note).toBeDefined();
  });

  it("defaults authorityWithdrawn to false", () => {
    expect(new ReviewDecision(validDecision()).authorityWithdrawn).toBe(false);
  });

  it("carries citedSources", () => {
    const doc = new ReviewDecision({
      ...validDecision(),
      citedSources: [{ work: "W", locator: "L", url: "https://example.com" }],
    });
    expect(doc.validateSync()).toBeUndefined();
    expect(doc.citedSources).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────
// KnowledgeAuditEvent
// ─────────────────────────────────────────────────────────

describe("KnowledgeAuditEvent model", () => {
  it("passes validation with all required fields", () => {
    expect(new KnowledgeAuditEvent(validAuditEvent()).validateSync()).toBeUndefined();
  });

  it.each(["actor", "action", "targetType", "targetId"])(
    "rejects when %s is missing",
    (field) => {
      const data = validAuditEvent();
      delete data[field];
      const err = new KnowledgeAuditEvent(data).validateSync();
      expect(err?.errors[field]).toBeDefined();
    }
  );

  it.each([
    "link_created",
    "link_versioned",
    "decision_recorded",
    "state_derived",
    "reviewer_granted",
    "reviewer_revoked",
    "link_retired",
  ])("accepts graph verb %s", (action) => {
    expect(
      new KnowledgeAuditEvent({ ...validAuditEvent(), action }).validateSync()
    ).toBeUndefined();
  });

  it("rejects a moderation verb — this is not AuditLog", () => {
    const err = new KnowledgeAuditEvent({
      ...validAuditEvent(),
      action: "ban_user",
    }).validateSync();
    expect(err?.errors.action).toBeDefined();
  });

  it("rejects a targetType outside the enum", () => {
    const err = new KnowledgeAuditEvent({
      ...validAuditEvent(),
      targetType: "post",
    }).validateSync();
    expect(err?.errors.targetType).toBeDefined();
  });

  it("defaults previousState to null and accepts an arbitrary snapshot", () => {
    expect(new KnowledgeAuditEvent(validAuditEvent()).previousState).toBeNull();

    const doc = new KnowledgeAuditEvent({
      ...validAuditEvent(),
      previousState: { review: { state: "unreviewed" }, nested: [1, 2] },
    });
    expect(doc.validateSync()).toBeUndefined();
    expect(doc.previousState.review.state).toBe("unreviewed");
  });
});

// ─────────────────────────────────────────────────────────
// User.reviewerProfile
// ─────────────────────────────────────────────────────────

describe("User model — reviewerProfile", () => {
  const validUser = () => ({
    name: "Test User",
    username: "test_user",
    email: "test@example.com",
    password: "hashed",
  });

  it("is optional — an ordinary user validates without it", () => {
    expect(new User(validUser()).validateSync()).toBeUndefined();
  });

  it("accepts a grant with domains and a recorded basis", () => {
    const doc = new User({
      ...validUser(),
      reviewerProfile: {
        domains: ["hadith-grading", "tafsir-attribution"],
        grantedBy: oid(),
        grantedAt: new Date(),
        basis: "Inspected ijaza; verified with the issuing institution.",
      },
    });
    expect(doc.validateSync()).toBeUndefined();
    expect(doc.reviewerProfile.domains).toHaveLength(2);
  });

  it("rejects a domain outside the enum", () => {
    const err = new User({
      ...validUser(),
      reviewerProfile: { domains: ["everything"] },
    }).validateSync();
    expect(err).toBeDefined();
    expect(Object.keys(err.errors).join(" ")).toMatch(/reviewerProfile\.domains/);
  });

  it("is a grant, not a role — reviewer is not a role enum value", () => {
    const err = new User({ ...validUser(), role: "reviewer" }).validateSync();
    expect(err?.errors.role).toBeDefined();
  });

  it("can be held alongside the scholar role", () => {
    const doc = new User({
      ...validUser(),
      role: "scholar",
      reviewerProfile: { domains: ["seerah-chronology"], grantedAt: new Date() },
    });
    expect(doc.validateSync()).toBeUndefined();
  });

  it("carries revocation fields", () => {
    const doc = new User({
      ...validUser(),
      reviewerProfile: {
        domains: ["hadith-grading"],
        grantedAt: new Date(),
        revokedAt: new Date(),
        revokedReason: "Grant withdrawn.",
      },
    });
    expect(doc.validateSync()).toBeUndefined();
    expect(doc.reviewerProfile.revokedReason).toBe("Grant withdrawn.");
  });
});
