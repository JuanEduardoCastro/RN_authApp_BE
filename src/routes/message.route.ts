import { Router } from "express";
import { validateRoleMiddleware } from "../middleware";
import {
  getUnreadCount,
  getUserMessages,
  markMessageRead,
  sendMessage,
} from "../controllers/message.controller";
import { getMessagesLimiter, markReadLimiter, sendMessageLimiter } from "../middleware/limiters";
import { body, param } from "express-validator";

const messageRoutes: Router = Router();

messageRoutes.post(
  "/send",
  sendMessageLimiter,
  validateRoleMiddleware,
  [
    body("title").notEmpty().trim().isLength({ min: 1, max: 100 }),
    body("body").notEmpty().trim().isLength({ min: 1, max: 1000 }),
    body("type").isIn(["push", "in_app", "both"]),
    body("recipientIds").isArray({ min: 1 }),
    body("recipientIds.*").isMongoId(),
  ],

  sendMessage,
);

messageRoutes.get("/", getMessagesLimiter, validateRoleMiddleware, getUserMessages);

messageRoutes.get("/unread-count", getMessagesLimiter, validateRoleMiddleware, getUnreadCount);

messageRoutes.patch(
  "/:id/read",
  markReadLimiter,
  validateRoleMiddleware,
  [param("id").isMongoId()],
  markMessageRead,
);

export default messageRoutes;
