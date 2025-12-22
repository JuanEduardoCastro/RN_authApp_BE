import { body } from "express-validator";
import express, { Router } from "express";
import {
  checkEmail,
  createUser,
  editUser,
  loginUser,
  logoutUser,
  resetPassword,
  updatePasswordUser,
  validateNewAccessToken,
} from "../controllers/user.controller";
import {
  validateAccessTokenMiddleware,
  validateEmailTokenMiddleware,
  validateGithubToken,
  validateGoogleToken,
  validatePasswordMiddleWare,
  validateRefreshTokenMiddleware,
} from "../middleware";
import {
  checkEmailLimiter,
  createUserLimiter,
  deviceTokenLimiter,
  githubLoginLimiter,
  googleLoginLimiter,
  loginLimiter,
  logoutLimiter,
  newPasswordLimiter,
  resetPasswordLimiter,
  tokenRefreshLimiter,
} from "../middleware/limiters";
import {
  deactivateDeviceToken,
  getAllUsersDevice,
  setDevicetoken,
  updateDeviceToken,
} from "../controllers/deviceToken.controller";
import { googleLogin } from "../controllers/googleLogin.controller";
import { githubLogin } from "../controllers/githubLogin.controller";

const userRoutes: Router = express.Router();

/* --- Authentication Routes --- */
userRoutes.post("/login", loginLimiter, body("email").isEmail(), loginUser);
userRoutes.post("/logout", logoutLimiter, validateAccessTokenMiddleware, logoutUser);
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
userRoutes.patch(
  "/:id",
  validateAccessTokenMiddleware,
  body("firstName").optional().trim().isLength({ max: 100 }).escape(),
  body("lastName").optional().trim().isLength({ max: 100 }).escape(),
  body("occupation").optional().trim().isLength({ max: 200 }).escape(),
  body("phoneNumber.code").optional().trim().isLength({ max: 10 }),
  body("phoneNumber.dialCode").optional().trim().isLength({ max: 10 }),
  body("phoneNumber.number").optional().trim().isLength({ max: 20 }),
  editUser
);

/* --- Password & Email Validation Routes --- */
userRoutes.post(
  "/check-email",
  checkEmailLimiter,
  body("email").isEmail().normalizeEmail(),
  checkEmail
);
userRoutes.post(
  "/reset-password",
  resetPasswordLimiter,
  body("email").isEmail().normalizeEmail(),
  resetPassword
);
userRoutes.put(
  "/:id/password",
  newPasswordLimiter,
  validateEmailTokenMiddleware,
  validatePasswordMiddleWare,
  body("password").isLength({ min: 8, max: 60 }),
  updatePasswordUser
);

/* --- FCM tokens Routes --- */
userRoutes.post(
  "/device-token",
  deviceTokenLimiter,
  validateAccessTokenMiddleware,
  body("fcmToken").isString().trim().isLength({ min: 10, max: 500 }),
  body("deviceId").isString().trim().isLength({ min: 1, max: 200 }),
  body("deviceName").optional().trim().isLength({ max: 100 }),
  body("osVersion").optional().trim().isLength({ max: 50 }),
  body("appVersion").optional().trim().isLength({ max: 50 }),
  setDevicetoken
);
userRoutes.patch(
  "/device-token/last-used",
  deviceTokenLimiter,
  validateAccessTokenMiddleware,
  body("deviceId").isString().trim().isLength({ min: 1, max: 200 }),
  updateDeviceToken
);
userRoutes.delete(
  "/device-token/:deviceId",
  deviceTokenLimiter,
  validateAccessTokenMiddleware,
  deactivateDeviceToken
);
userRoutes.get("/devices", deviceTokenLimiter, validateAccessTokenMiddleware, getAllUsersDevice);

/* --- Google validate token Routes --- */

userRoutes.post("/google-login", googleLoginLimiter, validateGoogleToken, googleLogin);

/* --- GitHub validate token Routes --- */

userRoutes.post("/github-login", githubLoginLimiter, validateGithubToken, githubLogin);

export default userRoutes;
