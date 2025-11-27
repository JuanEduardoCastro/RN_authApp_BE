import { body } from "express-validator";
import express, { Router } from "express";
import {
  checkEmail,
  checkEmailWithProvider,
  createUser,
  editUser,
  loginUser,
  logoutUser,
  resetPassword,
  updatePssUser,
  validateNewAccessToken,
} from "../controllers/user.controller";
import {
  validateAccessTokenMiddleware,
  validateEmailTokenMiddleware,
  validatePasswordMiddleWare,
  validateRefreshTokenMiddleware,
} from "../middleware";
import {
  checkEmailLimiter,
  createUserLimiter,
  loginLimiter,
  resetPasswordLimiter,
  tokenRefreshLimiter,
} from "../middleware/limiters";

const userRoutes: Router = express.Router();

/* --- Authentication Routes --- */
userRoutes.post("/login", loginLimiter, body("email").isEmail(), loginUser);
userRoutes.post("/logout", logoutUser);
userRoutes.post(
  "/token/refresh",
  tokenRefreshLimiter,
  validateRefreshTokenMiddleware,
  validateNewAccessToken
);

/* --- User Management Routes --- */
userRoutes.post(
  "/create",
  createUserLimiter,
  validateEmailTokenMiddleware,
  validatePasswordMiddleWare,
  body("email").isEmail(),
  body("password").isLength({ min: 8, max: 60 }),
  createUser
);
userRoutes.patch("/:id", validateAccessTokenMiddleware, editUser);

/* --- Password & Email Validation Routes --- */
userRoutes.post("/check-provider", checkEmailWithProvider);
userRoutes.post("/check-email", checkEmailLimiter, checkEmail);
userRoutes.post("/reset-password", resetPasswordLimiter, resetPassword);
userRoutes.put(
  "/:id/password",
  validateEmailTokenMiddleware,
  validatePasswordMiddleWare,
  body("password").isLength({ min: 8, max: 60 }),
  updatePssUser
);

export default userRoutes;
