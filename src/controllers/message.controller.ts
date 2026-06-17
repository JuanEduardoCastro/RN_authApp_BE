import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import { Message } from "../model/message-model";
import { DeviceToken } from "../model/deviceToken-model";
import { sendPushNotification } from "../services/firebaseServices";
import { logger } from "../utils/logger";
import { sendFCMToUser } from "../services/fcmService";

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed.", details: errors.array() });
      return;
    }

    const { title, body, type, recipientIds } = req.body;
    const senderId = (req.tokenVerified as any)._id;

    const recipientObjectIds = recipientIds.map((id: string) => new Types.ObjectId(id));

    const message = new Message({
      sender: senderId,
      recipients: recipientObjectIds,
      title,
      body,
      type,
      isSystemMessage: false,
    });
    await message.save();

    let pushSuccessCount = 0;
    let pushFailureCount = 0;

    if (type === "push" || type === "both") {
      // Build per-recipient badge count so each user sees their own unread count
      const recipientPayloads = await Promise.all(
        recipientObjectIds.map(async (userId: Types.ObjectId) => {
          const unreadCount = await Message.countDocuments({
            recipients: userId,
            readBy: { $ne: userId },
            deletedBy: { $nin: [userId] },
          });
          const tokens = await DeviceToken.find({ user: userId, isActive: true }).select(
            "fcmToken",
          );
          return {
            fcmTokens: tokens.map((t) => t.fcmToken),
            badgeCount: unreadCount,
          };
        }),
      );

      const payloadsWithTokens = recipientPayloads.filter((p) => p.fcmTokens.length > 0);

      if (payloadsWithTokens.length > 0) {
        const result = await sendPushNotification(payloadsWithTokens, title, body);
        pushSuccessCount = result.successCount;
        pushFailureCount = result.failureCount;

        if (result.failedTokens.length > 0) {
          await DeviceToken.updateMany(
            { fcmToken: { $in: result.failedTokens } },
            { isActive: false },
          );
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        messageId: message._id,
        recipientCount: recipientIds.length,
        pushSuccessCount,
        pushFailureCount,
      },
    });

    return;
  } catch (error) {
    next(error);
  }
};

export const getUserMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = new Types.ObjectId((req.tokenVerified as any)._id as string);

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
    const unreadOnly = req.query.unreadOnly === "true";

    const filter: Record<string, any> = {
      recipients: userId,
      deletedBy: { $nin: [userId] },
    };
    if (unreadOnly) filter.readBy = { $ne: userId };

    const [messages, total] = await Promise.all([
      Message.find(filter)
        .populate("sender", "firstName lastName email avatarURL")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Message.countDocuments(filter),
    ]);

    const messageWithReadFlag = messages.map((msg: any) => ({
      _id: msg._id,
      sender: msg.sender,
      title: msg.title,
      body: msg.body,
      type: msg.type,
      isRead: (msg.readBy as Types.ObjectId[]).some((id) => id.equals(userId)),
      isSystemMessage: msg.isSystemMessage,
      createdAt: msg.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: messageWithReadFlag,
      pagination: { page, limit, total, hasMore: page * limit < total },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = new Types.ObjectId((req.tokenVerified as any)._id as string);

    const count = await Message.countDocuments({
      recipients: userId,
      readBy: { $ne: userId },
      deletedBy: { $nin: [userId] },
    });

    res.status(200).json({
      success: true,
      message: "Unread count fetched successfully",
      data: { count },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const markMessageRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = new Types.ObjectId((req.tokenVerified as any)._id as string);
    const messageId = req.params.id;

    // Verify the user is actually a recipient before marking
    const message = await Message.findOne({
      _id: messageId,
      recipients: userId,
    });

    if (!message) {
      res.status(404).json({
        error: "Message not found or user is not a recipient",
      });
      return;
    }

    await Message.findByIdAndUpdate(messageId, { $addToSet: { readBy: userId } });

    res.status(200).json({
      success: true,
      message: "Message marked as read successfully",
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const sendWelcomeMessage = async (userId: string, firstName: string): Promise<void> => {
  try {
    const name = firstName || "there";
    const title = "Welcome to Auth.Jc!";
    const body = `Hi ${name}! We're glad you're here. Explore your profile, customize your theme, and check back for updates.`;

    await Message.create({
      sender: null,
      recipients: [new Types.ObjectId(userId)],
      title,
      body,
      type: "both",
      isSystemMessage: true,
    });

    await sendFCMToUser(userId, { title, body });

    logger.info(`Welcome message sent to user ${userId}`);
  } catch (error) {
    logger.error(`Error sending welcome message to user ${userId}:`, error);
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = new Types.ObjectId((req.tokenVerified as any)._id as string);
    const messageId = req.params.id;

    const message = await Message.findOne({
      _id: messageId,
      recipients: userId,
    });

    if (!message) {
      res.status(404).json({ error: "Message not found or user is not a recipient." });
      return;
    }

    await Message.findByIdAndUpdate(messageId, { $addToSet: { deletedBy: userId } });

    res.status(200).json({ message: "Message deleted successfully." });
    return;
  } catch (error) {
    next(error);
  }
};
