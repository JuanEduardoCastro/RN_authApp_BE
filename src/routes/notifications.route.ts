import { Router } from "express";
import { validateRoleMiddleware } from "../middleware";
import { body, query } from "express-validator";
import {
  getAllFcmTokens,
  getFcmTokensByUser,
  sendNotification,
} from "../controllers/pushNotification.controller";
import { createNotificationLimiter, getTokensLimiter } from "../middleware/limiters";

const notificationsRouter: Router = Router();

/* --- Get ALL FCM Tokens (admin only) --- */

notificationsRouter.get(
  "/fcm-tokens",
  getTokensLimiter,
  validateRoleMiddleware,
  [query("systemName").optional().isIn(["Android", "iOS"])],
  getAllFcmTokens
);

/* --- Get FCM Tokens by user (admin only) --- */

notificationsRouter.get(
  "/fcm-token-user",
  getTokensLimiter,
  validateRoleMiddleware,
  [query("email").notEmpty().isEmail()],
  getFcmTokensByUser
);

/* --- Send Push Notification (Admin only) --- */

notificationsRouter.post(
  "/send",
  createNotificationLimiter,
  validateRoleMiddleware,
  [
    body("title").notEmpty().trim().isLength({ min: 1, max: 100 }),
    body("body").notEmpty().trim().isLength({ min: 1, max: 500 }),
    body("data").optional().isObject(),
    body("systemName").optional().isIn(["Android", "iOS"]),
    body("userIds").optional().isArray(),
  ],
  sendNotification
);

export default notificationsRouter;
