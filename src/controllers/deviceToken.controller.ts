import { NextFunction, Request, Response } from "express";
import { DeviceToken } from "../model/deviceToken-model";
import { validationResult } from "express-validator";

export const setDevicetoken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed.", details: errors.array() });
      return;
    }

    const { fcmToken, deviceId, deviceName, osVersion, appVersion, deviceType, systemName } =
      req.body;
    const { _id } = req.tokenVerified;

    const deviceToken = await DeviceToken.findOneAndUpdate(
      { user: _id, deviceId },
      {
        fcmToken,
        deviceId,
        deviceName,
        osVersion,
        appVersion,
        deviceType,
        systemName,
        isActive: true,
        lastUsed: Date.now(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      data: { deviceToken },
      message: "Device token registered successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const updateDeviceToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed.", details: errors.array() });
      return;
    }

    const { deviceId } = req.body;
    const { _id } = req.tokenVerified;

    const updatedDevice = await DeviceToken.findOneAndUpdate(
      {
        user: _id,
        deviceId,
      },
      { lastUsed: new Date() },
      { new: true }
    );

    if (!updatedDevice) {
      res.status(404).json({ error: "Device not found" });
      return;
    }

    res.status(200).json({
      message: "Device token updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateDeviceToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req.params;
    const { _id } = req.tokenVerified;

    const updatedDevice = await DeviceToken.findOneAndUpdate(
      {
        user: _id,
        deviceId,
      },
      { isActive: false },
      { new: true }
    );

    if (!updatedDevice) {
      res.status(204);
      return;
    }

    res.status(200).json({
      message: "Device token deactivated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsersDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id } = req.tokenVerified;

    const devices = await DeviceToken.find({ user: _id, isActive: true }).sort({ lastUsed: -1 });

    res.status(200).json({
      data: { devices },
      message: "Device tokens fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};
