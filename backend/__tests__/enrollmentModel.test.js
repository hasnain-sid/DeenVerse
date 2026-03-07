/**
 * Unit tests for enrollmentSchema.js
 * Covers: required fields, status enum, default values, compound index definition.
 * No DB connection required — uses validateSync() only.
 */

import mongoose from "mongoose";
import { Enrollment } from "../models/enrollmentSchema.js";

// ── Helpers ───────────────────────────────────────────────────────────

const validData = () => ({
  student: new mongoose.Types.ObjectId(),
  course: new mongoose.Types.ObjectId(),
});

// ── Required fields ───────────────────────────────────────────────────

describe("Enrollment model — required fields", () => {
  it("passes validation with student and course", () => {
    const doc = new Enrollment(validData());
    const err = doc.validateSync();
    expect(err).toBeUndefined();
  });

  it.each(["student", "course"])("rejects when %s is missing", (field) => {
    const data = validData();
    delete data[field];
    const doc = new Enrollment(data);
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors[field]).toBeDefined();
  });
});

// ── Status enum ───────────────────────────────────────────────────────

describe("Enrollment model — status enum", () => {
  it("rejects an invalid status value", () => {
    const doc = new Enrollment({ ...validData(), status: "pending" });
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.status).toBeDefined();
  });

  it.each(["active", "completed", "dropped", "suspended"])(
    "accepts valid status: %s",
    (status) => {
      const doc = new Enrollment({ ...validData(), status });
      const err = doc.validateSync();
      expect(err).toBeUndefined();
    },
  );
});

// ── Default values ────────────────────────────────────────────────────

describe("Enrollment model — defaults", () => {
  let doc;

  beforeEach(() => {
    doc = new Enrollment(validData());
  });

  it("defaults status to active", () => {
    expect(doc.status).toBe("active");
  });

  it("defaults progress.currentModule to 0", () => {
    expect(doc.progress.currentModule).toBe(0);
  });

  it("defaults progress.currentLesson to 0", () => {
    expect(doc.progress.currentLesson).toBe(0);
  });

  it("defaults progress.percentComplete to 0", () => {
    expect(doc.progress.percentComplete).toBe(0);
  });

  it("defaults certificate.issued to false", () => {
    expect(doc.certificate.issued).toBe(false);
  });

  it("initialises progress.completedLessons as an empty array", () => {
    expect(Array.isArray(doc.progress.completedLessons)).toBe(true);
    expect(doc.progress.completedLessons).toHaveLength(0);
  });
});

// ── Compound index ────────────────────────────────────────────────────

describe("Enrollment model — compound index", () => {
  it("defines a unique compound index on student + course", () => {
    const indexes = Enrollment.schema.indexes();
    const compound = indexes.find(
      ([fields]) => fields.student !== undefined && fields.course !== undefined,
    );
    expect(compound).toBeDefined();
    expect(compound[1]).toMatchObject({ unique: true });
  });
});
