import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { DeviceToken } from "../model/deviceToken-model";
import { sendPushNotification } from "../services/firebaseServices";
import { logger } from "../utils/logger";
import User from "../model/user-model";

export const getAllFcmTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed.", details: errors.array() });
      return;
    }

    const { systemName, isActive } = req.query;

    const filter: any = {};
    if (systemName) filter.systemName = systemName;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const deviceTokens = await DeviceToken.find(filter).select(
      "fcmToken deviceType deviceId systemName user"
    );

    const tokens = deviceTokens.map((token) => ({
      fcmToken: token.fcmToken,
      deviceType: token.deviceType,
      deviceId: token.deviceId,
      systemName: token.systemName,
      user: token.user,
    }));

    res.status(200).json({
      data: { tokens },
      message: "Device tokens fetched successfully.",
      count: tokens.length,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getFcmTokensByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed.", details: errors.array() });
      return;
    }

    const { email } = req.query;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const filter: any = {};
    if (user._id) filter.user = user._id;

    const deviceTokensByEmail = await DeviceToken.find(filter).select(
      "fcmToken deviceType deviceId systemName"
    );

    if (deviceTokensByEmail.length === 0) {
      res.status(404).json({ error: "User found but no active device tokens found" });
      return;
    }

    const tokenByUser = deviceTokensByEmail.map((token) => ({
      fcmToken: token.fcmToken,
      deviceType: token.deviceType,
      deviceId: token.deviceId,
      systemName: token.systemName,
      user: user,
    }));

    res.status(200).json({
      data: { tokenByUser },
      message: "Device token by user fetched successfully.",
      count: tokenByUser.length,
    });
  } catch (error) {
    next(error);
  }
};

export const sendNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed.", details: errors.array() });
      return;
    }

    const { title, body, data, systemName, userIds } = req.body;

    const filter: any = { isActive: true };
    if (systemName) filter.systemName = systemName;
    if (userIds && Array.isArray(userIds)) filter.user = { $in: userIds };

    const deviceTokens = await DeviceToken.find(filter).select("fcmToken");

    if (deviceTokens.length === 0) {
      res.status(404).json({ error: "No active device tokens found" });
      return;
    }

    const fcmTokens = deviceTokens.map((token) => token.fcmToken);
    const response = await sendPushNotification(fcmTokens, title, body, data);

    if (response.failedTokens.length > 0) {
      await DeviceToken.updateMany(
        { fcmToken: { $in: response.failedTokens } },
        { isActive: false }
      );
      logger.log(`Deactivated ${response.failedTokens.length} invalid tokens`);
    }

    res.status(200).json({
      message: "Notification sent successfully.",
      successCount: response.successCount,
      failureCount: response.failureCount,
      totalTokens: fcmTokens.length,
    });
    return;
  } catch (error) {
    next(error);
  }
};
