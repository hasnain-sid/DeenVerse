import mongoose from "mongoose";
import { Classroom } from "../models/classroomSchema.js";
import { ClassroomParticipant } from "../models/classroomParticipantSchema.js";

// ── Helpers ──────────────────────────────────────────────

const validClassroomData = () => ({
  host: new mongoose.Types.ObjectId(),
  title: "Tajweed Halaqa — Live Session",
  scheduledAt: new Date(Date.now() + 86400000), // tomorrow
});

// ── Required fields ─────────────────────────────────────

describe("Classroom model — required fields", () => {
  it("passes validation with all required fields", () => {
    const doc = new Classroom(validClassroomData());
    const err = doc.validateSync();
    expect(err).toBeUndefined();
  });

  it.each(["host", "title", "scheduledAt"])(
    "rejects when %s is missing",
    (field) => {
      const data = validClassroomData();
      delete data[field];
      const doc = new Classroom(data);
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err.errors[field]).toBeDefined();
    }
  );
});

// ── Enum validation ─────────────────────────────────────

describe("Classroom model — enum validation", () => {
  it("rejects invalid type", () => {
    const doc = new Classroom({ ...validClassroomData(), type: "debate" });
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.type).toBeDefined();
  });

  it("accepts all valid types", () => {
    const types = ["lecture", "halaqa", "quran-session", "qa-session", "workshop", "open"];
    for (const t of types) {
      const doc = new Classroom({ ...validClassroomData(), type: t });
      const err = doc.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it("rejects invalid status", () => {
    const doc = new Classroom({ ...validClassroomData(), status: "paused" });
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.status).toBeDefined();
  });

  it("accepts all valid statuses", () => {
    const statuses = ["scheduled", "live", "ended", "cancelled"];
    for (const s of statuses) {
      const doc = new Classroom({ ...validClassroomData(), status: s });
      const err = doc.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it("rejects invalid access value", () => {
    const doc = new Classroom({ ...validClassroomData(), access: "private" });
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.access).toBeDefined();
  });

  it("accepts all valid access values", () => {
    const accesses = ["course-only", "followers", "public"];
    for (const a of accesses) {
      const doc = new Classroom({ ...validClassroomData(), access: a });
      const err = doc.validateSync();
      expect(err).toBeUndefined();
    }
  });
});

// ── Default values ──────────────────────────────────────

describe("Classroom model — defaults", () => {
  it("defaults status to scheduled", () => {
    const doc = new Classroom(validClassroomData());
    expect(doc.status).toBe("scheduled");
  });

  it("defaults maxParticipants to 50", () => {
    const doc = new Classroom(validClassroomData());
    expect(doc.maxParticipants).toBe(50);
  });

  it("defaults participantCount to 0", () => {
    const doc = new Classroom(validClassroomData());
    expect(doc.participantCount).toBe(0);
  });

  it("defaults peakParticipants to 0", () => {
    const doc = new Classroom(validClassroomData());
    expect(doc.peakParticipants).toBe(0);
  });

  it("defaults type to lecture", () => {
    const doc = new Classroom(validClassroomData());
    expect(doc.type).toBe("lecture");
  });

  it("defaults duration to 60", () => {
    const doc = new Classroom(validClassroomData());
    expect(doc.duration).toBe(60);
  });

  it("defaults access to course-only", () => {
    const doc = new Classroom(validClassroomData());
    expect(doc.access).toBe("course-only");
  });

  it("defaults settings correctly", () => {
    const doc = new Classroom(validClassroomData());
    expect(doc.settings.chatEnabled).toBe(true);
    expect(doc.settings.handRaiseEnabled).toBe(true);
    expect(doc.settings.participantVideo).toBe(false);
    expect(doc.settings.participantAudio).toBe(false);
    expect(doc.settings.whiteboardEnabled).toBe(true);
    expect(doc.settings.recordingEnabled).toBe(false);
    expect(doc.settings.autoAdmit).toBe(true);
  });

  it("defaults timezone to UTC", () => {
    const doc = new Classroom(validClassroomData());
    expect(doc.timezone).toBe("UTC");
  });
});

// ── Min/Max constraints ─────────────────────────────────

describe("Classroom model — min/max constraints", () => {
  it("rejects duration below 15", () => {
    const doc = new Classroom({ ...validClassroomData(), duration: 10 });
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.duration).toBeDefined();
  });

  it("rejects duration above 480", () => {
    const doc = new Classroom({ ...validClassroomData(), duration: 500 });
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.duration).toBeDefined();
  });

  it("rejects maxParticipants below 2", () => {
    const doc = new Classroom({ ...validClassroomData(), maxParticipants: 1 });
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.maxParticipants).toBeDefined();
  });

  it("rejects maxParticipants above 500", () => {
    const doc = new Classroom({ ...validClassroomData(), maxParticipants: 501 });
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.maxParticipants).toBeDefined();
  });

  it("rejects title exceeding 200 chars", () => {
    const doc = new Classroom({ ...validClassroomData(), title: "x".repeat(201) });
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.title).toBeDefined();
  });

  it("rejects description exceeding 1000 chars", () => {
    const doc = new Classroom({ ...validClassroomData(), description: "x".repeat(1001) });
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.description).toBeDefined();
  });
});

// ── Index — livekitRoomName uniqueness ──────────────────

describe("Classroom model — indexes", () => {
  it("defines a unique sparse index on livekitRoomName", () => {
    const schema = Classroom.schema;
    const paths = schema.path("livekitRoomName");
    expect(paths.options.unique).toBe(true);
    expect(paths.options.sparse).toBe(true);
  });

  it("has compound indexes for status+scheduledAt and host", () => {
    const indexes = Classroom.schema.indexes();
    const indexFields = indexes.map(([fields]) => fields);

    expect(indexFields).toContainEqual(
      expect.objectContaining({ status: 1, scheduledAt: 1 })
    );
    expect(indexFields).toContainEqual(
      expect.objectContaining({ host: 1 })
    );
    expect(indexFields).toContainEqual(
      expect.objectContaining({ course: 1 })
    );
  });
});

// ── ClassroomParticipant model ──────────────────────────

describe("ClassroomParticipant model — required fields", () => {
  const validParticipant = () => ({
    classroom: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(),
  });

  it("passes validation with required fields", () => {
    const doc = new ClassroomParticipant(validParticipant());
    const err = doc.validateSync();
    expect(err).toBeUndefined();
  });

  it.each(["classroom", "user"])(
    "rejects when %s is missing",
    (field) => {
      const data = validParticipant();
      delete data[field];
      const doc = new ClassroomParticipant(data);
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err.errors[field]).toBeDefined();
    }
  );

  it("defaults role to participant", () => {
    const doc = new ClassroomParticipant(validParticipant());
    expect(doc.role).toBe("participant");
  });

  it("defaults handRaised to false", () => {
    const doc = new ClassroomParticipant(validParticipant());
    expect(doc.handRaised).toBe(false);
  });

  it("defaults isMuted to true", () => {
    const doc = new ClassroomParticipant(validParticipant());
    expect(doc.isMuted).toBe(true);
  });

  it("defaults isVideoOn to false", () => {
    const doc = new ClassroomParticipant(validParticipant());
    expect(doc.isVideoOn).toBe(false);
  });

  it("rejects invalid role", () => {
    const doc = new ClassroomParticipant({ ...validParticipant(), role: "admin" });
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.role).toBeDefined();
  });

  it("accepts all valid roles", () => {
    const roles = ["host", "co-host", "participant", "observer"];
    for (const r of roles) {
      const doc = new ClassroomParticipant({ ...validParticipant(), role: r });
      const err = doc.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it("defines compound unique index on classroom+user", () => {
    const indexes = ClassroomParticipant.schema.indexes();
    const uniqueIndex = indexes.find(
      ([fields, opts]) =>
        fields.classroom === 1 && fields.user === 1 && opts?.unique === true
    );
    expect(uniqueIndex).toBeDefined();
  });
});
