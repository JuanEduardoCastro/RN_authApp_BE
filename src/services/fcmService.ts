import { Types } from "mongoose";
import { DeviceToken } from "../model/deviceToken-model";
import { Message } from "../model/message-model";
import { logger } from "../utils/logger";
import { sendPushNotification } from "./firebaseServices";

export const sendFCMToUser = async (
  userId: string,
  payload: { title: string; body: string },
): Promise<void> => {
  const userObjectId = new Types.ObjectId(userId);

  const [tokens, unreadCount] = await Promise.all([
    DeviceToken.find({ user: userObjectId, isActive: true }).select("fcmToken"),
    Message.countDocuments({
      recipients: userObjectId,
      readBy: { $ne: userObjectId },
      deletedBy: { $nin: [userObjectId] },
    }),
  ]);

  if (tokens.length === 0) {
    logger.info(`No active device tokens found for user ${userId}`);
    return;
  }

  const result = await sendPushNotification(
    [{ fcmTokens: tokens.map((t) => t.fcmToken), badgeCount: unreadCount }],
    payload.title,
    payload.body,
  );

  if (result.failedTokens.length > 0) {
    await DeviceToken.updateMany({ fcmToken: { $in: result.failedTokens } }, { isActive: false });
  }
};
