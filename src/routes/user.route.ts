import { body } from "express-validator";
import express, { Router } from "express";
import {
  checkEmail,
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
  validateRefreshTokenMiddleware,
} from "../middleware";

const userRoutes: Router = express.Router();

// --- Authentication Routes ---
// userRoutes.post("/login", body("email").isEmail().normalizeEmail(), loginUser);
userRoutes.post("/login", body("email").isEmail().normalizeEmail(), loginUser);
userRoutes.post("/logout", logoutUser);
userRoutes.post("/token/refresh", validateRefreshTokenMiddleware, validateNewAccessToken);

// --- User Management Routes ---
userRoutes.post(
  "/create",
  validateEmailTokenMiddleware,
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  createUser
);
userRoutes.patch("/:id", validateAccessTokenMiddleware, editUser);

// --- Password & Email Validation Routes ---
userRoutes.post("/check-email", checkEmail);
userRoutes.post("/reset-password", resetPassword);
userRoutes.put(
  "/:id/password",
  validateEmailTokenMiddleware,
  body("password").isLength({ min: 6 }),
  updatePssUser
);

export default userRoutes;
