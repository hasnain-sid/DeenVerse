/**
 * Integration tests for scholar earnings (getScholarEarnings / getScholarEarningsDetails).
 * Runs the real aggregation pipelines against mongodb-memory-server.
 */

import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";

// ── Mock modules scholarService pulls in that need env/config ────────
jest.mock("../services/stripeService.js", () => ({
  createConnectAccount: jest.fn(),
  getExpressDashboardLink: jest.fn(),
  getConnectAccountStatus: jest.fn(),
}));

jest.mock("../services/notificationService.js", () => ({
  createAndEmitNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../config/logger.js", () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { Course } from "../models/courseSchema.js";
import { Payment } from "../models/paymentSchema.js";
import { ScholarPayment } from "../models/scholarPaymentSchema.js";
import {
  getScholarEarnings,
  getScholarEarningsDetails,
} from "../services/scholarService.js";

// ── Helpers ─────────────────────────────────────────────────────────

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const courseData = (instructor, title) => ({
  instructor,
  title,
  description: "Test course description",
  category: "quran",
  level: "beginner",
  type: "self-paced",
});

const sale = (course, amount, { status = "completed", createdAt = daysAgo(1) } = {}) => ({
  user: new mongoose.Types.ObjectId(),
  type: "course-purchase",
  amount,
  status,
  course,
  platformFee: Math.round(amount * 0.3),
  scholarPayout: amount - Math.round(amount * 0.3),
  createdAt,
});

// ── Global state ────────────────────────────────────────────────────

// Replica-set startup can be slow when the whole suite runs in parallel
jest.setTimeout(120000);

let mongoServer;
const scholarId = new mongoose.Types.ObjectId();
const otherScholarId = new mongoose.Types.ObjectId();
let courseA;
let courseB;
let courseOther;

beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  await mongoose.connect(mongoServer.getUri());

  [courseA, courseB, courseOther] = await Course.create([
    courseData(scholarId, "Tajweed Basics"),
    courseData(scholarId, "Tafseer Deep Dive"),
    courseData(otherScholarId, "Other Scholar Course"),
  ]);

  await Payment.create([
    // Recent completed sales for our scholar
    sale(courseA._id, 4000, { createdAt: daysAgo(1) }),
    sale(courseA._id, 4000, { createdAt: daysAgo(2) }),
    sale(courseB._id, 10000, { createdAt: daysAgo(3) }),
    // Older completed sale (outside "month", inside "year")
    sale(courseA._id, 4000, { createdAt: daysAgo(60) }),
    // Non-completed sales: excluded from overview, present in details
    sale(courseB._id, 10000, { status: "pending", createdAt: daysAgo(0.5) }),
    sale(courseA._id, 4000, { status: "refunded", createdAt: daysAgo(4) }),
    // Another scholar's sale: never visible
    sale(courseOther._id, 9999, { createdAt: daysAgo(1) }),
    // Subscription payment: not a course sale
    {
      user: new mongoose.Types.ObjectId(),
      type: "subscription",
      amount: 1500,
      status: "completed",
      createdAt: daysAgo(1),
    },
  ]);

  await ScholarPayment.create([
    {
      scholar: scholarId,
      type: "course-revenue",
      courseRevenue: { course: courseA._id, scholarAmount: 3500 },
      status: "paid",
      createdAt: daysAgo(0.25),
    },
    {
      scholar: otherScholarId,
      type: "course-revenue",
      courseRevenue: { course: courseOther._id, scholarAmount: 100 },
      status: "paid",
      createdAt: daysAgo(0.25),
    },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ── Overview ────────────────────────────────────────────────────────

describe("getScholarEarnings", () => {
  it("sums completed course sales for the period, in dollars", async () => {
    const result = await getScholarEarnings(scholarId, "month");

    expect(result.totalRevenue).toBe(180); // (4000 + 4000 + 10000) cents
    expect(result.platformFee).toBe(54);
    expect(result.netEarnings).toBe(126);
  });

  it("returns a per-course breakdown sorted by revenue", async () => {
    const { breakdown } = await getScholarEarnings(scholarId, "month");

    expect(breakdown).toEqual([
      { courseId: String(courseB._id), title: "Tafseer Deep Dive", revenue: 100, studentCount: 1 },
      { courseId: String(courseA._id), title: "Tajweed Basics", revenue: 80, studentCount: 2 },
    ]);
  });

  it("includes older sales when the period is year", async () => {
    const result = await getScholarEarnings(scholarId, "year");

    expect(result.totalRevenue).toBe(220);
    expect(result.breakdown[0]).toMatchObject({
      title: "Tajweed Basics",
      revenue: 120,
      studentCount: 3,
    });
  });

  it("excludes pending/refunded sales, subscriptions, and other scholars' courses", async () => {
    const { totalRevenue, breakdown } = await getScholarEarnings(scholarId, "year");

    expect(totalRevenue).toBe(220); // nothing beyond the 4 completed sales
    expect(breakdown.map((b) => b.title)).not.toContain("Other Scholar Course");
  });

  it("returns zeros for a scholar with no courses", async () => {
    const result = await getScholarEarnings(new mongoose.Types.ObjectId(), "month");

    expect(result).toEqual({
      totalRevenue: 0,
      platformFee: 0,
      netEarnings: 0,
      breakdown: [],
    });
  });
});

// ── Details ─────────────────────────────────────────────────────────

describe("getScholarEarningsDetails", () => {
  it("unions sales and payouts, newest first, with pagination", async () => {
    const { transactions, pagination } = await getScholarEarningsDetails(scholarId, 1, 3);

    // 6 sales on the scholar's courses + 1 payout
    expect(pagination).toEqual({ page: 1, limit: 3, total: 7, pages: 3 });

    expect(transactions).toHaveLength(3);
    expect(transactions[0]).toMatchObject({
      type: "payout",
      amount: 35,
      status: "completed", // "paid" collapsed onto the dashboard vocabulary
    });
    expect(transactions[1]).toMatchObject({
      type: "course_sale",
      courseTitle: "Tafseer Deep Dive",
      amount: 100,
      netAmount: 70,
      status: "pending",
    });
    expect(transactions[2]).toMatchObject({
      type: "course_sale",
      courseTitle: "Tajweed Basics",
      amount: 40,
      netAmount: 28,
      status: "completed",
    });
  });

  it("maps refunded sales to failed and paginates past the first page", async () => {
    const { transactions } = await getScholarEarningsDetails(scholarId, 2, 3);

    const refunded = transactions.find((t) => t.status === "failed");
    expect(refunded).toMatchObject({ type: "course_sale", courseTitle: "Tajweed Basics", amount: 40 });
  });

  it("never includes other scholars' transactions", async () => {
    const { transactions } = await getScholarEarningsDetails(scholarId, 1, 50);

    expect(transactions.every((t) => t.courseTitle !== "Other Scholar Course")).toBe(true);
    expect(transactions.filter((t) => t.type === "payout")).toHaveLength(1);
  });

  it("returns an empty page for a scholar with no activity", async () => {
    const result = await getScholarEarningsDetails(new mongoose.Types.ObjectId(), 1, 20);

    expect(result.transactions).toEqual([]);
    expect(result.pagination).toEqual({ page: 1, limit: 20, total: 0, pages: 1 });
  });
});
