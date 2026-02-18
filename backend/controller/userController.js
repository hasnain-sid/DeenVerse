import {
    registerUser,
    loginUser,
    logoutUser, 
    toggleSavedContent,
    getUserProfile,
    getOtherUsersProfiles,
    followUser,
    unfollowUser,
    updateUserProfile,
    changeUserPassword,
    refreshSession,
    createPasswordResetToken,
    resetPasswordWithToken
} from "../services/userService.js";
import { getRefreshCookieOptions } from "../utils/tokenUtils.js";
import { verifyRefreshToken } from "../utils/tokenUtils.js";

export const Register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    return res.status(result.statusCode).json({
      message: result.message,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const Login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    return res
      .status(result.statusCode)
      .cookie("refreshToken", result.refreshToken, getRefreshCookieOptions())
      .json({
        message: result.message,
        user: result.user,
        accessToken: result.accessToken,
        success: true,
      });
  } catch (error) {
    next(error);
  }
};

export const Logout = (req, res, next) => {
  try {
    const result = logoutUser();
    const isProduction = process.env.NODE_ENV === 'production';
    return res
      .status(result.statusCode)
      .cookie("refreshToken", "", {
        expires: new Date(0),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        path: '/',
      })
      .json({
        message: result.message,
        success: true,
      });
  } catch (error) {
    next(error);
  }
};

export const saved = async (req, res, next) => {
  try {
    const contentId = req.params.id;
    const loggedInUserId = req.user; // From isAuthenticated middleware
    
    const result = await toggleSavedContent(loggedInUserId, contentId);
    
    return res.status(result.statusCode).json({
        message: result.message,
        user: result.user,
        success: true
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user; // From isAuthenticated middleware (JWT)
    const result = await getUserProfile(userId);
    return res.status(result.statusCode).json({
      user: result.user,
      success: true
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const result = await getUserProfile(userId);
    return res.status(result.statusCode).json({
      user: result.user,
      success: true
    });
  } catch (error) {
    next(error);
  }
};

export const getOtherUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user; // Assumes req.user contains the logged-in user's ID
    const result = await getOtherUsersProfiles(currentUserId);
    return res.status(result.statusCode).json({
      otherUsers: result.otherUsers,
      success: true
    });
  } catch (error) {
    next(error);
  }
};

export const Follow = async (req, res, next) => {
  try {
    const loggedInUserId = req.user; // From isAuthenticated
    const userIdToFollow = req.body.id;
    
    const result = await followUser(loggedInUserId, userIdToFollow);
    
    return res.status(result.statusCode).json({
      message: result.message,
      success: true
    });
  } catch (error) {
    next(error);
  }
};

export const Unfollow = async (req, res, next) => {
  try {
    const loggedInUserId = req.user; // From isAuthenticated
    const userIdToUnfollow = req.body.id;
    
    const result = await unfollowUser(loggedInUserId, userIdToUnfollow);

    return res.status(result.statusCode).json({
      message: result.message,
      success: true
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user;
    const result = await updateUserProfile(userId, req.body);
    return res.status(result.statusCode).json({
      message: result.message,
      user: result.user,
      success: true
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user;
    const { currentPassword, newPassword } = req.body;
    const result = await changeUserPassword(userId, currentPassword, newPassword);
    return res.status(result.statusCode).json({
      message: result.message,
      success: true
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const result = await refreshSession(decoded.userId);
    return res
      .status(result.statusCode)
      .cookie("refreshToken", result.refreshToken, getRefreshCookieOptions())
      .json({
        user: result.user,
        accessToken: result.accessToken,
        success: true,
      });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const result = await createPasswordResetToken(email);

    // In production, send email with reset link instead of returning token
    // For now, return token for development/testing
    return res.status(result.statusCode).json({
      message: result.message,
      success: true,
      // DEV ONLY — remove in production when email service is set up
      ...(process.env.NODE_ENV !== 'production' && result.resetToken
        ? { resetToken: result.resetToken }
        : {}),
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const result = await resetPasswordWithToken(token, password);
    return res.status(result.statusCode).json({
      message: result.message,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};