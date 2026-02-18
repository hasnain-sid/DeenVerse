import { User } from "../models/userSchema.js";
import mongoose from 'mongoose';
import bcryptjs from "bcryptjs";
import crypto from 'crypto';
import { AppError } from '../utils/AppError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils.js';
import { createFollowNotification } from './notificationService.js';
import { sendPasswordResetEmail } from './emailService.js';

export const registerUser = async (userData) => {
    const { name, username, email, password } = userData;

    if (!name || !username || !password || !email) {
        throw new AppError("All fields are required", 400); // Changed to throw AppError
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("User already registered", 409); // 409 Conflict is more appropriate
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    await User.create({
        name,
        username,
        email,
        password: hashedPassword,
    });
    // For registration, 201 Created is more appropriate
    return { success: true, message: "Account created successfully", statusCode: 201 }; 
};

export const loginUser = async (credentials) => {
    const { email, password } = credentials;

    if (!email || !password) {
        throw new AppError("All fields are required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("Invalid email or password", 401); // More generic message for security
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
        throw new AppError("Invalid email or password", 401);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Exclude password from response
    const userWithoutPassword = await User.findById(user._id).select("-password");

    return {
        success: true,
        message: `Welcome back ${user.name}`,
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        statusCode: 200,
    };
};

export const logoutUser = () => {
    // Logic for logout is primarily clearing the cookie, which is done in the controller.
    // This service function can be simple or even omitted if no other logic is needed.
    return { success: true, message: "User logged out successfully", statusCode: 200 };
};

export const toggleSavedContent = async (userId, contentId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    let message;
    if (user.saved.includes(contentId)) {
        // Unmark
        await User.findByIdAndUpdate(userId, { $pull: { saved: contentId } });
        message = "Removed from saved";
    } else {
        // Mark
        await User.findByIdAndUpdate(userId, { $push: { saved: contentId } });
        message = "Added to saved";
    }
    const updatedUser = await User.findById(userId).select("-password"); // Exclude password
    return { success: true, message, user: updatedUser, statusCode: 200 };
};

export const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return { success: true, user, statusCode: 200 };
};

export const getOtherUsersProfiles = async (currentUserId) => {
    const otherUsers = await User.find({ _id: { $ne: currentUserId } }).select("-password");
    // No need to throw if no other users, an empty array is a valid response
    return { success: true, otherUsers, statusCode: 200 };
};

export const searchUsers = async (query) => {
    if (!query || query.trim().length < 2) {
        return { success: true, users: [], statusCode: 200 };
    }

    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'i');
    const users = await User.find({
        $or: [
            { name: regex },
            { username: regex },
        ],
    })
        .select('name username avatar bio followers')
        .limit(20);

    return { success: true, users, statusCode: 200 };
};

export const followUser = async (loggedInUserId, userIdToFollow) => {
    if (loggedInUserId === userIdToFollow) {
        throw new AppError("You cannot follow yourself.", 400);
    }

    const loggedInUser = await User.findById(loggedInUserId);
    const userToFollowObj = await User.findById(userIdToFollow);

    if (!loggedInUser || !userToFollowObj) {
        throw new AppError("User not found.", 404);
    }

    if (!userToFollowObj.followers.includes(loggedInUserId)) {
        await userToFollowObj.updateOne({ $push: { followers: loggedInUserId } });
        await loggedInUser.updateOne({ $push: { following: userIdToFollow } });
        // Send follow notification
        await createFollowNotification(userIdToFollow, loggedInUserId);
    } else {
        throw new AppError(`Already following ${userToFollowObj.name}`, 400);
    }
    return { success: true, message: `${loggedInUser.name} started following ${userToFollowObj.name}`, statusCode: 200 };
};

export const unfollowUser = async (loggedInUserId, userIdToUnfollow) => {
    if (loggedInUserId === userIdToUnfollow) {
        throw new AppError("You cannot unfollow yourself.", 400);
    }
    const loggedInUser = await User.findById(loggedInUserId);
    const userToUnfollowObj = await User.findById(userIdToUnfollow);

    if (!loggedInUser || !userToUnfollowObj) {
        throw new AppError("User not found.", 404);
    }

    if (userToUnfollowObj.followers.some((id) => id.toString() === loggedInUserId)) {
        await userToUnfollowObj.updateOne({ $pull: { followers: loggedInUserId } });
        await loggedInUser.updateOne({ $pull: { following: userIdToUnfollow } });
    } else {
        throw new AppError(`You are not following ${userToUnfollowObj.name}`, 400);
    }
    return { success: true, message: `${loggedInUser.name} unfollowed ${userToUnfollowObj.name}`, statusCode: 200 };
};

export const updateUserProfile = async (userId, updates) => {
    const allowedFields = ['name', 'username', 'bio', 'avatar'];
    const sanitized = {};
    for (const key of allowedFields) {
        if (updates[key] !== undefined) {
            sanitized[key] = updates[key];
        }
    }

    if (Object.keys(sanitized).length === 0) {
        throw new AppError("No valid fields to update", 400);
    }

    // Check username uniqueness if changing it
    if (sanitized.username) {
        const existing = await User.findOne({ username: sanitized.username, _id: { $ne: userId } });
        if (existing) {
            throw new AppError("Username is already taken", 409);
        }
    }

    const user = await User.findByIdAndUpdate(userId, sanitized, { new: true, runValidators: true }).select("-password");
    if (!user) {
        throw new AppError("User not found", 404);
    }

    return { success: true, message: "Profile updated successfully", user, statusCode: 200 };
};

export const changeUserPassword = async (userId, currentPassword, newPassword) => {
    if (!newPassword || newPassword.length < 6) {
        throw new AppError("New password must be at least 6 characters", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new AppError("Current password is incorrect", 401);
    }

    if (currentPassword === newPassword) {
        throw new AppError("New password must be different from current password", 400);
    }

    user.password = await bcryptjs.hash(newPassword, 10);
    await user.save();

    return { success: true, message: "Password changed successfully", statusCode: 200 };
};

/**
 * Refresh session — validate refresh token, return new access + refresh tokens
 */
export const refreshSession = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return {
        success: true,
        user,
        accessToken,
        refreshToken,
        statusCode: 200,
    };
};

/**
 * Generate a password reset token, store hash + expiry on user
 */
export const createPasswordResetToken = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        // Don't reveal if user exists — always return success message
        return {
            success: true,
            message: "If an account with that email exists, a reset link has been sent.",
            statusCode: 200,
        };
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Send reset email (graceful fallback if SES not configured)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl).catch((err) => {
        console.warn('[UserService] Email send failed:', err.message);
    });

    return {
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
        resetToken, // Included in dev for testing; strip in production
        statusCode: 200,
    };
};

/**
 * Reset password using token
 */
export const resetPasswordWithToken = async (token, newPassword) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        throw new AppError("Invalid or expired reset token", 400);
    }

    user.password = await bcryptjs.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return { success: true, message: "Password reset successfully. Please log in.", statusCode: 200 };
};

/**
 * Get paginated followers list for a user
 */
export const getFollowersList = async (userId, { page = 1, limit = 20 }) => {
    const user = await User.findById(userId).select('followers');
    if (!user) throw new AppError('User not found', 404);

    const total = user.followers.length;
    const skip = (page - 1) * limit;
    const paginatedIds = user.followers.slice(skip, skip + limit);

    const users = await User.find({ _id: { $in: paginatedIds } })
        .select('name username avatar bio followers');

    return { users, total, page, totalPages: Math.ceil(total / limit) };
};

/**
 * Get paginated following list for a user
 */
export const getFollowingList = async (userId, { page = 1, limit = 20 }) => {
    const user = await User.findById(userId).select('following');
    if (!user) throw new AppError('User not found', 404);

    const total = user.following.length;
    const skip = (page - 1) * limit;
    const paginatedIds = user.following.slice(skip, skip + limit);

    const users = await User.find({ _id: { $in: paginatedIds } })
        .select('name username avatar bio followers');

    return { users, total, page, totalPages: Math.ceil(total / limit) };
};

/**
 * Get follow suggestions based on mutual connections + popular users
 */
export const getFollowSuggestions = async (userId, { limit = 5 }) => {
    const user = await User.findById(userId).select('following');
    if (!user) throw new AppError('User not found', 404);

    const excludeIds = [...user.following, userId];

    // Find users followed by people you follow (mutual connections)
    // but that you don't follow yet
    const suggestions = await User.aggregate([
        { $match: { _id: { $in: user.following } } },
        { $unwind: '$following' },
        { $match: { following: { $nin: excludeIds.map(id => new mongoose.Types.ObjectId(String(id))) } } },
        { $group: { _id: '$following', mutualCount: { $sum: 1 } } },
        { $sort: { mutualCount: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user',
            },
        },
        { $unwind: '$user' },
        {
            $project: {
                _id: '$user._id',
                name: '$user.name',
                username: '$user.username',
                avatar: '$user.avatar',
                bio: '$user.bio',
                followerCount: { $size: { $ifNull: ['$user.followers', []] } },
                mutualCount: 1,
            },
        },
    ]);

    // If not enough suggestions from mutuals, fill with popular users
    if (suggestions.length < limit) {
        const existingIds = suggestions.map(s => s._id);
        const popular = await User.find({
            _id: { $nin: [...excludeIds, ...existingIds] },
        })
            .sort({ followers: -1 })
            .limit(limit - suggestions.length)
            .select('name username avatar bio followers');

        for (const u of popular) {
            suggestions.push({
                _id: u._id,
                name: u.name,
                username: u.username,
                avatar: u.avatar,
                bio: u.bio,
                followerCount: u.followers?.length || 0,
                mutualCount: 0,
            });
        }
    }

    return { suggestions };
};

/**
 * Get public user profile by username (for /user/:username pages)
 */
export const getPublicProfile = async (username, currentUserId) => {
    const user = await User.findOne({ username }).select('-password');
    if (!user) throw new AppError('User not found', 404);

    const isFollowing = currentUserId
        ? user.followers.some(id => id.toString() === currentUserId)
        : false;

    return {
        success: true,
        user: {
            ...user.toObject(),
            followerCount: user.followers.length,
            followingCount: user.following.length,
            isFollowing,
        },
        statusCode: 200,
    };
};
