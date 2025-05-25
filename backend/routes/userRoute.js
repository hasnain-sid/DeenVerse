import express from "express";
import {
    Login,
    Register,
    Logout,
    saved,
    getProfile,
    getOtherUsers,
    Follow,
    Unfollow
} from "../controller/userController.js";
import isAuthenticated from "../config/auth.js";
import {
    registerValidationRules,
    loginValidationRules,
    followUnfollowValidationRules,
    mongoIdParamValidationRules // Added for param validation
} from "../middlewares/validators.js";

const router = express.Router();

router.route("/register").post(registerValidationRules(), Register);
router.route("/login").post(loginValidationRules(), Login);
router.route("/logout").get(Logout);

// Using mongoIdParamValidationRules to validate MongoDB ID in the URL parameter
router.route("/saved/:id").put(isAuthenticated, mongoIdParamValidationRules('id'), saved);
router.route("/profile/:id").get(isAuthenticated, mongoIdParamValidationRules('id'), getProfile);

// getOtherUsers does not take an ID param, it uses req.user from isAuthenticated
router.route("/users").get(isAuthenticated, getOtherUsers);

// followUnfollowValidationRules already checks for body('id').isMongoId()
router.route("/follow").post(isAuthenticated, followUnfollowValidationRules(), Follow);
router.route("/unfollow").post(isAuthenticated, followUnfollowValidationRules(), Unfollow);

export default router;