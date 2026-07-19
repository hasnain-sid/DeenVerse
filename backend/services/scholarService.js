import mongoose from "mongoose";
import { User } from "../models/userSchema.js";
import { Course } from "../models/courseSchema.js";
import { Payment } from "../models/paymentSchema.js";
import { ScholarPayment } from "../models/scholarPaymentSchema.js";
import { AppError } from "../utils/AppError.js";
import { createAndEmitNotification } from "./notificationService.js";
import {
  createConnectAccount,
  getExpressDashboardLink,
  getConnectAccountStatus,
} from "./stripeService.js";
import logger from "../config/logger.js";

/**
 * Submit a scholar application for the given user.
 * Rejects if the user already has a pending or approved application.
 */
export async function applyForScholar(userId, data) {
  const user = await User.findById(userId).select("role scholarProfile.applicationStatus");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === "scholar") {
    throw new AppError("You are already a verified scholar", 400);
  }

  const status = user.scholarProfile?.applicationStatus;
  if (status === "pending") {
    throw new AppError("You already have a pending application", 400);
  }
  if (status === "approved") {
    throw new AppError("Your application has already been approved", 400);
  }

  user.scholarProfile = {
    ...user.scholarProfile?.toObject?.() ?? {},
    credentials: data.credentials,
    specialties: data.specialties,
    bio: data.bio,
    teachingLanguages: data.teachingLanguages,
    applicationStatus: "pending",
    applicationDate: new Date(),
    rejectionReason: undefined,
  };

  if (data.videoIntroUrl) {
    user.scholarProfile.videoIntroUrl = data.videoIntroUrl;
  }

  await user.save();

  return { message: "Scholar application submitted successfully", applicationId: user._id };
}

/**
 * Get the current application status for a user.
 */
export async function getApplicationStatus(userId) {
  const user = await User.findById(userId)
    .select("scholarProfile.applicationStatus scholarProfile.applicationDate scholarProfile.rejectionReason")
    .lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    status: user.scholarProfile?.applicationStatus || "none",
    applicationDate: user.scholarProfile?.applicationDate || null,
    rejectionReason: user.scholarProfile?.rejectionReason || null,
  };
}

/**
 * Get a scholar's public profile.
 * Returns 404 if user doesn't exist or is not a scholar.
 */
export async function getScholarProfile(scholarId) {
  const user = await User.findById(scholarId)
    .select("name username avatar bio role scholarProfile")
    .lean();

  if (!user) {
    throw new AppError("Scholar not found", 404);
  }
  if (user.role !== "scholar" && user.role !== "admin") {
    throw new AppError("Scholar not found", 404);
  }

  return {
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
    },
    scholarProfile: {
      specialties: user.scholarProfile?.specialties || [],
      credentials: user.scholarProfile?.credentials || [],
      bio: user.scholarProfile?.bio || "",
      teachingLanguages: user.scholarProfile?.teachingLanguages || [],
      rating: user.scholarProfile?.rating || { average: 0, count: 0 },
      totalStudents: user.scholarProfile?.totalStudents || 0,
      totalCourses: user.scholarProfile?.totalCourses || 0,
      verifiedAt: user.scholarProfile?.verifiedAt || null,
    },
  };
}

/**
 * List scholar applications filtered by status (admin).
 */
export async function listApplications(status, page = 1, limit = 10) {
  const filter = {};
  if (status && status !== "all") {
    filter["scholarProfile.applicationStatus"] = status;
  } else {
    // Default to showing pending applications
    filter["scholarProfile.applicationStatus"] = { $in: ["pending", "approved", "rejected"] };
  }

  const skip = (page - 1) * limit;

  const [applications, total] = await Promise.all([
    User.find(filter)
      .select("name username avatar email scholarProfile.applicationStatus scholarProfile.applicationDate scholarProfile.specialties scholarProfile.credentials scholarProfile.bio scholarProfile.teachingLanguages scholarProfile.rejectionReason")
      .sort({ "scholarProfile.applicationDate": -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    applications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Review a scholar application (approve or reject).
 */
export async function reviewApplication(adminId, userId, decision, rejectionReason, specialties) {
  const user = await User.findById(userId).select("role scholarProfile name");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.scholarProfile?.applicationStatus !== "pending") {
    throw new AppError("This application is not in pending status", 400);
  }

  if (decision === "approved") {
    user.role = "scholar";
    user.scholarProfile.applicationStatus = "approved";
    user.scholarProfile.verifiedAt = new Date();
    user.scholarProfile.verifiedBy = adminId;
    user.scholarProfile.rejectionReason = undefined;

    // Override specialties if admin provided them
    if (specialties && specialties.length > 0) {
      user.scholarProfile.specialties = specialties;
    }

    logger.info(`Scholar application approved for user ${userId} by admin ${adminId}`);
  } else if (decision === "rejected") {
    user.scholarProfile.applicationStatus = "rejected";
    user.scholarProfile.rejectionReason = rejectionReason || "Application did not meet requirements";

    logger.info(`Scholar application rejected for user ${userId} by admin ${adminId}`);
  } else {
    throw new AppError("Invalid decision. Must be 'approved' or 'rejected'", 400);
  }

  await user.save();

  // Send notification to the applicant (uses "system" type)
  try {
    await createAndEmitNotification({
      recipientId: userId,
      senderId: adminId,
      type: "system",
    });
  } catch (err) {
    // Non-critical — log and continue
    logger.warn(`Failed to send scholar review notification to user ${userId}`, { error: err.message });
  }

  return {
    message: `Application ${decision}`,
    user: {
      _id: user._id,
      name: user.name,
      role: user.role,
      applicationStatus: user.scholarProfile.applicationStatus,
    },
  };
}

/**
 * List all verified scholars (admin or public use).
 */
export async function listScholars(page = 1, limit = 10) {
  const filter = { role: "scholar" };
  const skip = (page - 1) * limit;

  const [scholars, total] = await Promise.all([
    User.find(filter)
      .select("name username avatar scholarProfile.specialties scholarProfile.bio scholarProfile.rating scholarProfile.totalStudents scholarProfile.totalCourses scholarProfile.verifiedAt")
      .sort({ "scholarProfile.verifiedAt": -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    scholars,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ── Stripe Connect integration ──────────────────────

/**
 * Start Stripe Connect onboarding for a scholar.
 * @param {string} userId
 */
export async function connectStripe(userId) {
  const result = await createConnectAccount(userId);
  return result;
}

/**
 * Get the Stripe Express Dashboard link for a scholar.
 * @param {string} userId
 */
export async function getStripeDashboard(userId) {
  const user = await User.findById(userId)
    .select("scholarProfile.stripeConnectId")
    .lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const connectId = user.scholarProfile?.stripeConnectId;
  if (!connectId) {
    throw new AppError(
      "Stripe Connect account not set up. Please complete onboarding first.",
      400
    );
  }

  const result = await getExpressDashboardLink(connectId);
  return result;
}

/**
 * Get Stripe Connect account status for a scholar.
 * @param {string} userId
 */
export async function getStripeConnectStatus(userId) {
  const user = await User.findById(userId)
    .select("scholarProfile.stripeConnectId")
    .lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const connectId = user.scholarProfile?.stripeConnectId;
  if (!connectId) {
    return {
      connected: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    };
  }

  const result = await getConnectAccountStatus(connectId);
  return result;
}

// ── Earnings ─────────────────────────────────────────

const PERIOD_MONTHS = { month: 1, quarter: 3, year: 12 };

function earningsPeriodStart(period) {
  const start = new Date();
  start.setMonth(start.getMonth() - (PERIOD_MONTHS[period] ?? 1));
  return start;
}

// Payment amounts are stored in cents (Stripe convention); the earnings
// dashboard renders raw values as dollars, so convert at the API boundary.
const centsToDollars = (cents) => Math.round(cents ?? 0) / 100;

/**
 * Earnings overview for a scholar: period totals plus per-course breakdown.
 * @param {string} userId
 * @param {'month'|'quarter'|'year'} period
 */
export async function getScholarEarnings(userId, period = "month") {
  const courses = await Course.find({ instructor: userId }).select("title").lean();
  const courseIds = courses.map((c) => c._id);
  const titleById = new Map(courses.map((c) => [String(c._id), c.title]));

  const rows = await Payment.aggregate([
    {
      $match: {
        course: { $in: courseIds },
        type: "course-purchase",
        status: "completed",
        createdAt: { $gte: earningsPeriodStart(period) },
      },
    },
    {
      $group: {
        _id: "$course",
        revenue: { $sum: "$amount" },
        platformFee: { $sum: "$platformFee" },
        net: { $sum: "$scholarPayout" },
        studentCount: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  return {
    totalRevenue: centsToDollars(rows.reduce((sum, r) => sum + r.revenue, 0)),
    platformFee: centsToDollars(rows.reduce((sum, r) => sum + r.platformFee, 0)),
    netEarnings: centsToDollars(rows.reduce((sum, r) => sum + r.net, 0)),
    breakdown: rows.map((row) => ({
      courseId: String(row._id),
      title: titleById.get(String(row._id)) ?? "Untitled course",
      revenue: centsToDollars(row.revenue),
      studentCount: row.studentCount,
    })),
  };
}

/**
 * Paginated transaction history for a scholar: course sales (Payment)
 * unioned with payouts (ScholarPayment), newest first.
 * @param {string} userId
 */
export async function getScholarEarningsDetails(userId, page = 1, limit = 20) {
  const courses = await Course.find({ instructor: userId }).select("title").lean();
  const courseIds = courses.map((c) => c._id);
  const titleById = new Map(courses.map((c) => [String(c._id), c.title]));

  const [result] = await Payment.aggregate([
    { $match: { course: { $in: courseIds }, type: "course-purchase" } },
    {
      $project: {
        type: { $literal: "course_sale" },
        course: 1,
        amount: 1,
        netAmount: "$scholarPayout",
        status: 1,
        createdAt: 1,
      },
    },
    {
      $unionWith: {
        coll: ScholarPayment.collection.name,
        pipeline: [
          { $match: { scholar: new mongoose.Types.ObjectId(String(userId)) } },
          {
            $project: {
              type: { $literal: "payout" },
              amount: {
                $ifNull: ["$courseRevenue.scholarAmount", { $ifNull: ["$stipend.amount", 0] }],
              },
              status: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
    { $sort: { createdAt: -1, _id: -1 } },
    {
      $facet: {
        transactions: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
  ]);

  // Collapse backend status vocabularies onto the dashboard's completed/pending/failed set
  const statusMap = { paid: "completed", processing: "pending", refunded: "failed" };
  const transactions = (result?.transactions ?? []).map((tx) => ({
    _id: String(tx._id),
    type: tx.type,
    courseTitle: tx.course ? titleById.get(String(tx.course)) : undefined,
    amount: centsToDollars(tx.amount),
    netAmount: tx.netAmount != null ? centsToDollars(tx.netAmount) : undefined,
    status: statusMap[tx.status] ?? tx.status,
    createdAt: tx.createdAt,
  }));

  const total = result?.total?.[0]?.count ?? 0;
  return {
    transactions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}
