import { User } from "../models/userSchema.js";
import { AppError } from "../utils/AppError.js";

/**
 * Admin middleware — checks if the authenticated user has admin role.
 * Requires `isAuthenticated` to run first (so req.user is set).
 *
 * Admin can be set via:
 *   1. User document has `role: 'admin'` field
 *   2. User ID is in ADMIN_IDS env var (comma-separated)
 */
export const isAdmin = async (req, _res, next) => {
  try {
    // Check env-based admin list first (fast, no DB call)
    const adminIds = (process.env.ADMIN_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (adminIds.includes(req.user?.toString())) {
      return next();
    }

    // Check DB role field
    const user = await User.findById(req.user).select("role").lean();
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    if (user.role === "admin") {
      return next();
    }

    return next(new AppError("Access denied. Admin privileges required.", 403));
  } catch (err) {
    next(err);
  }
};
