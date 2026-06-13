import { Router } from "express";
import { validateAccessTokenMiddleware, validateRoleMiddleware } from "../middleware";
import {
  getUnreadCount,
  getUserMessages,
  markMessageRead,
  sendMessage,
  deleteMessage,
} from "../controllers/message.controller";
import {
  getMessagesLimiter,
  markReadLimiter,
  sendMessageLimiter,
  deleteMessageLimiter,
} from "../middleware/limiters";
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

messageRoutes.get("/", getMessagesLimiter, validateAccessTokenMiddleware, getUserMessages);

messageRoutes.get(
  "/unread-count",
  getMessagesLimiter,
  validateAccessTokenMiddleware,
  getUnreadCount,
);

messageRoutes.patch(
  "/:id/read",
  markReadLimiter,
  validateAccessTokenMiddleware,
  [param("id").isMongoId()],
  markMessageRead,
);

messageRoutes.delete(
  "/:id/delete",
  deleteMessageLimiter,
  validateAccessTokenMiddleware,
  [param("id").isMongoId()],
  deleteMessage,
);

export default messageRoutes;
