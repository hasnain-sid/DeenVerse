import express from "express";
// import { Login, Register, Logout, bookmarks, getProfile, getOtherUsers, Follow, Unfollow } from "../controllers/userController.js";
import { Login, Register, Logout,saved } from "../controller/userController.js";

import isAuthenticated from "../config/auth.js";
const router = express.Router();

router.route("/register").post(Register);
router.route("/login").post(Login);
router.route("/logout").get(Logout);
router.route("/saved/:id").put(isAuthenticated, saved);
// router.route("/getprofile/:id").get(isAuthenticated, getProfile);
// router.route("/getotherprofiles/:id").get(isAuthenticated, getOtherUsers);
// router.route("/follow/:id").post(isAuthenticated, Follow);
// router.route("/unfollow/:id").post(isAuthenticated, Unfollow);



export default router;  