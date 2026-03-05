import {
  applyForScholar,
  getApplicationStatus,
  reviewApplication,
  getScholarProfile,
} from "../services/scholarService.js";
import { User } from "../models/userSchema.js";
import { AppError } from "../utils/AppError.js";

// ── Mock dependencies ───────────────────────────────────

jest.mock("../models/userSchema.js", () => ({
  User: { findById: jest.fn() },
}));

jest.mock("../services/notificationService.js", () => ({
  createAndEmitNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../services/stripeService.js", () => ({
  createConnectAccount: jest.fn(),
  getExpressDashboardLink: jest.fn(),
  getConnectAccountStatus: jest.fn(),
}));

jest.mock("../config/logger.js", () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// ── Helpers ─────────────────────────────────────────────

function mockUserDoc(overrides = {}) {
  const doc = {
    _id: "u1",
    role: "user",
    name: "Test User",
    username: "testuser",
    avatar: "",
    bio: "",
    scholarProfile: {
      applicationStatus: "none",
      toObject() {
        const { toObject: _, ...rest } = this;
        return rest;
      },
    },
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return doc;
}

function mockLeanUser(overrides = {}) {
  return {
    _id: "u1",
    name: "Test",
    username: "test",
    avatar: "",
    bio: "",
    role: "user",
    scholarProfile: {
      applicationStatus: "none",
      applicationDate: null,
      rejectionReason: null,
    },
    ...overrides,
  };
}

// Mongoose-style chainable query mock
function chainQuery(resolvedValue) {
  const chain = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.lean = jest.fn().mockResolvedValue(resolvedValue);
  return chain;
}

// ─── applyForScholar ────────────────────────────────────

describe("applyForScholar", () => {
  beforeEach(() => jest.clearAllMocks());

  const applicationData = {
    credentials: [{ title: "Ijazah", institution: "Al-Azhar", year: 2020 }],
    specialties: ["Fiqh"],
    bio: "Scholar bio",
    teachingLanguages: ["en", "ar"],
  };

  it("creates a pending application for an eligible user", async () => {
    const user = mockUserDoc();
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    const result = await applyForScholar("u1", applicationData);

    expect(user.save).toHaveBeenCalled();
    expect(user.scholarProfile.applicationStatus).toBe("pending");
    expect(user.scholarProfile.credentials).toEqual(applicationData.credentials);
    expect(result.message).toMatch(/submitted/i);
  });

  it("rejects if user already has a pending application", async () => {
    const user = mockUserDoc({
      scholarProfile: { applicationStatus: "pending", toObject() { return { applicationStatus: "pending" }; } },
    });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    await expect(applyForScholar("u1", applicationData)).rejects.toThrow(AppError);
    await expect(applyForScholar("u1", applicationData)).rejects.toThrow(/pending/i);
  });

  it("rejects if user is already a verified scholar", async () => {
    const user = mockUserDoc({ role: "scholar" });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    await expect(applyForScholar("u1", applicationData)).rejects.toThrow(AppError);
    await expect(applyForScholar("u1", applicationData)).rejects.toThrow(/already.*scholar/i);
  });

  it("throws 404 when user not found", async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(applyForScholar("ghost", applicationData)).rejects.toThrow(AppError);
    try {
      await applyForScholar("ghost", applicationData);
    } catch (e) {
      expect(e.statusCode).toBe(404);
    }
  });
});

// ─── getApplicationStatus ───────────────────────────────

describe("getApplicationStatus", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns correct status fields for a user", async () => {
    const query = chainQuery(mockLeanUser({
      scholarProfile: {
        applicationStatus: "pending",
        applicationDate: new Date("2025-01-01"),
        rejectionReason: null,
      },
    }));
    User.findById.mockReturnValue(query);

    const result = await getApplicationStatus("u1");

    expect(result.status).toBe("pending");
    expect(result.applicationDate).toEqual(new Date("2025-01-01"));
    expect(result.rejectionReason).toBeNull();
  });

  it("returns 'none' when user has no application", async () => {
    const query = chainQuery(mockLeanUser({ scholarProfile: {} }));
    User.findById.mockReturnValue(query);

    const result = await getApplicationStatus("u1");

    expect(result.status).toBe("none");
  });

  it("throws 404 if user not found", async () => {
    const query = chainQuery(null);
    User.findById.mockReturnValue(query);

    await expect(getApplicationStatus("ghost")).rejects.toThrow(AppError);
    try {
      await getApplicationStatus("ghost");
    } catch (e) {
      expect(e.statusCode).toBe(404);
    }
  });
});

// ─── reviewApplication ──────────────────────────────────

describe("reviewApplication", () => {
  beforeEach(() => jest.clearAllMocks());

  it("approves: sets role to scholar and status to approved", async () => {
    const user = mockUserDoc({
      scholarProfile: {
        applicationStatus: "pending",
        specialties: ["Fiqh"],
        toObject() { return { applicationStatus: "pending", specialties: ["Fiqh"] }; },
      },
    });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    const result = await reviewApplication("admin1", "u1", "approved");

    expect(user.role).toBe("scholar");
    expect(user.scholarProfile.applicationStatus).toBe("approved");
    expect(user.scholarProfile.verifiedAt).toBeInstanceOf(Date);
    expect(user.scholarProfile.verifiedBy).toBe("admin1");
    expect(user.save).toHaveBeenCalled();
    expect(result.message).toMatch(/approved/i);
  });

  it("approve overrides specialties when provided by admin", async () => {
    const user = mockUserDoc({
      scholarProfile: {
        applicationStatus: "pending",
        specialties: ["Fiqh"],
        toObject() { return { applicationStatus: "pending", specialties: ["Fiqh"] }; },
      },
    });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    await reviewApplication("admin1", "u1", "approved", undefined, ["Hadith", "Tafsir"]);

    expect(user.scholarProfile.specialties).toEqual(["Hadith", "Tafsir"]);
  });

  it("rejects: sets status to rejected and stores reason", async () => {
    const user = mockUserDoc({
      scholarProfile: {
        applicationStatus: "pending",
        toObject() { return { applicationStatus: "pending" }; },
      },
    });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    const result = await reviewApplication("admin1", "u1", "rejected", "Insufficient credentials");

    expect(user.role).toBe("user"); // role must NOT change on rejection
    expect(user.scholarProfile.applicationStatus).toBe("rejected");
    expect(user.scholarProfile.rejectionReason).toBe("Insufficient credentials");
    expect(user.save).toHaveBeenCalled();
    expect(result.message).toMatch(/rejected/i);
  });

  it("reject sets a default reason when none provided", async () => {
    const user = mockUserDoc({
      scholarProfile: {
        applicationStatus: "pending",
        toObject() { return { applicationStatus: "pending" }; },
      },
    });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    await reviewApplication("admin1", "u1", "rejected");

    expect(user.scholarProfile.rejectionReason).toBeTruthy();
  });

  it("throws 404 if user not found", async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(reviewApplication("admin1", "ghost", "approved")).rejects.toThrow(AppError);
    try {
      await reviewApplication("admin1", "ghost", "approved");
    } catch (e) {
      expect(e.statusCode).toBe(404);
    }
  });

  it("throws 400 if application is not pending", async () => {
    const user = mockUserDoc({
      scholarProfile: {
        applicationStatus: "approved",
        toObject() { return { applicationStatus: "approved" }; },
      },
    });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    await expect(reviewApplication("admin1", "u1", "approved")).rejects.toThrow(AppError);
    try {
      await reviewApplication("admin1", "u1", "approved");
    } catch (e) {
      expect(e.statusCode).toBe(400);
    }
  });

  it("throws 400 for invalid decision value", async () => {
    const user = mockUserDoc({
      scholarProfile: {
        applicationStatus: "pending",
        toObject() { return { applicationStatus: "pending" }; },
      },
    });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    await expect(reviewApplication("admin1", "u1", "maybe")).rejects.toThrow(/invalid decision/i);
  });
});

// ─── getScholarProfile ──────────────────────────────────

describe("getScholarProfile", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns profile data for a valid scholar", async () => {
    const leanUser = mockLeanUser({
      role: "scholar",
      scholarProfile: {
        specialties: ["Fiqh"],
        credentials: [],
        bio: "Scholar bio",
        teachingLanguages: ["en"],
        rating: { average: 4.5, count: 10 },
        totalStudents: 50,
        totalCourses: 3,
        verifiedAt: new Date("2025-06-01"),
      },
    });
    const query = chainQuery(leanUser);
    User.findById.mockReturnValue(query);

    const result = await getScholarProfile("u1");

    expect(result.user.role).toBe("scholar");
    expect(result.user.name).toBe("Test");
    expect(result.scholarProfile.specialties).toEqual(["Fiqh"]);
    expect(result.scholarProfile.rating.average).toBe(4.5);
  });

  it("throws 404 for a non-scholar user", async () => {
    const query = chainQuery(mockLeanUser({ role: "user" }));
    User.findById.mockReturnValue(query);

    await expect(getScholarProfile("u1")).rejects.toThrow(AppError);
    try {
      await getScholarProfile("u1");
    } catch (e) {
      expect(e.statusCode).toBe(404);
    }
  });

  it("throws 404 when user does not exist", async () => {
    const query = chainQuery(null);
    User.findById.mockReturnValue(query);

    await expect(getScholarProfile("nobody")).rejects.toThrow(AppError);
    try {
      await getScholarProfile("nobody");
    } catch (e) {
      expect(e.statusCode).toBe(404);
    }
  });

  it("returns profile for admin role as well", async () => {
    const leanUser = mockLeanUser({ role: "admin", scholarProfile: { specialties: ["Aqidah"] } });
    const query = chainQuery(leanUser);
    User.findById.mockReturnValue(query);

    const result = await getScholarProfile("admin1");

    expect(result.user.role).toBe("admin");
  });
});
