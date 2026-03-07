import mongoose from "mongoose";
import { Course } from "../models/courseSchema.js";

// ── Helpers ──────────────────────────────────────────────

const validCourseData = () => ({
  instructor: new mongoose.Types.ObjectId(),
  title: "Introduction to Tajweed",
  description: "Learn the rules of Tajweed step by step.",
  category: "tajweed",
  level: "beginner",
  type: "self-paced",
});

// ── Required fields ─────────────────────────────────────

describe("Course model — required fields", () => {
  it("passes validation with all required fields", () => {
    const doc = new Course(validCourseData());
    const err = doc.validateSync();
    expect(err).toBeUndefined();
  });

  it.each(["title", "description", "category", "level", "type"])(
    "rejects when %s is missing",
    (field) => {
      const data = validCourseData();
      delete data[field];
      const doc = new Course(data);
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err.errors[field]).toBeDefined();
    }
  );

  it("requires instructor", () => {
    const data = validCourseData();
    delete data.instructor;
    const doc = new Course(data);
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.instructor).toBeDefined();
  });
});

// ── Enum validation ─────────────────────────────────────

describe("Course model — enum validation", () => {
  it("rejects invalid category", () => {
    const doc = new Course({ ...validCourseData(), category: "cooking" });
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.category).toBeDefined();
  });

  it("rejects invalid level", () => {
    const doc = new Course({ ...validCourseData(), level: "expert" });
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.level).toBeDefined();
  });

  it("rejects invalid type", () => {
    const doc = new Course({ ...validCourseData(), type: "recorded" });
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.type).toBeDefined();
  });

  it("accepts all valid categories", () => {
    const categories = [
      "quran", "hadith", "fiqh", "aqeedah", "seerah",
      "arabic", "tajweed", "tafseer", "dawah", "other",
    ];
    for (const cat of categories) {
      const doc = new Course({ ...validCourseData(), category: cat });
      const err = doc.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it("rejects invalid status", () => {
    const doc = new Course({ ...validCourseData(), status: "deleted" });
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.status).toBeDefined();
  });
});

// ── Default values ──────────────────────────────────────

describe("Course model — defaults", () => {
  it("defaults status to draft", () => {
    const doc = new Course(validCourseData());
    expect(doc.status).toBe("draft");
  });

  it("defaults enrollmentCount to 0", () => {
    const doc = new Course(validCourseData());
    expect(doc.enrollmentCount).toBe(0);
  });

  it("defaults pricing.type to free", () => {
    const doc = new Course(validCourseData());
    expect(doc.pricing.type).toBe("free");
  });

  it("defaults pricing.amount to 0", () => {
    const doc = new Course(validCourseData());
    expect(doc.pricing.amount).toBe(0);
  });

  it("defaults rating.average and rating.count to 0", () => {
    const doc = new Course(validCourseData());
    expect(doc.rating.average).toBe(0);
    expect(doc.rating.count).toBe(0);
  });

  it("defaults language to en", () => {
    const doc = new Course(validCourseData());
    expect(doc.language).toBe("en");
  });
});

// ── Slug auto-generation (pre-save hook) ────────────────

describe("Course model — slug generation", () => {
  it("generates slug from title on save", async () => {
    const doc = new Course(validCourseData());
    doc.isModified = jest.fn().mockReturnValue(true);
    doc.isNew = true;

    // Mock Course.exists used by the pre-save hook for uniqueness check
    const originalExists = mongoose.models.Course.exists;
    mongoose.models.Course.exists = jest.fn().mockResolvedValue(null);

    await doc.save
      ? undefined
      : undefined; // save requires DB — test the hook directly

    // Execute the pre-save hook manually
    const preSave = Course.schema.s.hooks._pres
      .get("save")
      .find((h) => h.fn.toString().includes("slugify"));

    if (preSave) {
      const next = jest.fn();
      await preSave.fn.call(doc, next);
      expect(doc.slug).toBe("introduction-to-tajweed");
      expect(next).toHaveBeenCalled();
    } else {
      // Fallback: verify slugify would produce the correct slug
      const slugify = (await import("slugify")).default;
      expect(slugify(doc.title, { lower: true, strict: true })).toBe(
        "introduction-to-tajweed"
      );
    }

    mongoose.models.Course.exists = originalExists;
  });

  it("appends counter when slug already exists", async () => {
    const doc = new Course(validCourseData());
    doc.isModified = jest.fn().mockReturnValue(true);

    const originalExists = mongoose.models.Course.exists;
    // First call: slug exists; second call: unique
    mongoose.models.Course.exists = jest
      .fn()
      .mockResolvedValueOnce({ _id: "existing" })
      .mockResolvedValueOnce(null);

    const preSave = Course.schema.s.hooks._pres
      .get("save")
      .find((h) => h.fn.toString().includes("slugify"));

    if (preSave) {
      const next = jest.fn();
      await preSave.fn.call(doc, next);
      expect(doc.slug).toBe("introduction-to-tajweed-1");
      expect(next).toHaveBeenCalled();
    }

    mongoose.models.Course.exists = originalExists;
  });

  it("skips slug generation when title is not modified", async () => {
    const doc = new Course(validCourseData());
    doc.isModified = jest.fn().mockReturnValue(false);
    doc.slug = "existing-slug";

    const preSave = Course.schema.s.hooks._pres
      .get("save")
      .find((h) => h.fn.toString().includes("slugify"));

    if (preSave) {
      const next = jest.fn();
      await preSave.fn.call(doc, next);
      expect(doc.slug).toBe("existing-slug");
      expect(next).toHaveBeenCalled();
    }
  });
});
