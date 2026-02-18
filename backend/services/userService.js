import { User } from "../models/userSchema.js";
import bcryptjs from "bcryptjs";
import crypto from 'crypto';
import { AppError } from '../utils/AppError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils.js';

export const registerUser = async (userData) => {
    const { name, username, email, password } = userData;

    if (!name || !username || !password || !email) {
        throw new AppError("All fields are required", 400); // Changed to throw AppError
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("User already registered", 409); // 409 Conflict is more appropriate
    }

    const hashedPassword = await bcryptjs.hash(password, 16);

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
    } else {
        throw new AppError(`Already following ${userToFollowObj.name}`, 400);
    }
    // Fetch updated users to reflect changes, if necessary for the response
    // For simplicity, just returning a success message here.
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

    if (userToUnfollowObj.followers.includes(loggedInUserId)) {
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
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new AppError("Current password is incorrect", 401);
    }

    user.password = await bcryptjs.hash(newPassword, 16);
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

    return {
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
        resetToken, // In production, this would be sent via email, not returned
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

    user.password = await bcryptjs.hash(newPassword, 16);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return { success: true, message: "Password reset successfully. Please log in.", statusCode: 200 };
};
