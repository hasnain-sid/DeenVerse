import {
    registerUser,
    loginUser,
    logoutUser, 
    toggleSavedContent,
    getUserProfile,
    getOtherUsersProfiles,
    followUser,
    unfollowUser
} from "../services/userService.js";

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
    return res.status(result.statusCode).cookie("token", result.token, {
      maxAge: 24 * 60 * 60 * 1000, 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None'
    }).json({
      message: result.message,
      user: result.user,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const Logout = (req, res, next) => {
  try {
    const result = logoutUser(); // Service function for logout
    return res.status(result.statusCode).cookie("token","", { 
      expires: new Date(Date.now()), 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None'
    }).json({
      message: result.message,
      success:true
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




