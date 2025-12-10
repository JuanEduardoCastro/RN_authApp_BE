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
  validateGoogleToken,
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
import {
  deactivateDeviceToken,
  getAllUsersDevice,
  setDevicetoken,
  updateDeviceToken,
} from "../controllers/deviceToken.controller";
import { googleLogin } from "../controllers/googleLogin.controller";

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

/* --- FCM tokens Routes --- */
userRoutes.post("/device-token", validateAccessTokenMiddleware, setDevicetoken);
userRoutes.patch("/device-token/last-used", validateAccessTokenMiddleware, updateDeviceToken);
userRoutes.delete("/device-token/:deviceId", validateAccessTokenMiddleware, deactivateDeviceToken);
userRoutes.get("/devices", validateAccessTokenMiddleware, getAllUsersDevice);

export default userRoutes;

/* --- Google validate token Routes --- */

userRoutes.post("/google-login", validateGoogleToken, googleLogin);
