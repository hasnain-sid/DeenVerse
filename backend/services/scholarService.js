import { User } from "../models/userSchema.js";
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
