import { NextFunction, Request, Response } from "express";
import { DeviceToken } from "../model/deviceToken-model";

export const setDevicetoken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fcmToken, deviceId, deviceName, osVersion, appVersion } = req.body;
    const { _id }: any = req.tokenVerified;

    const deviceToken = await DeviceToken.findOneAndUpdate(
      { user: _id, deviceId },
      {
        fcmToken,
        deviceId,
        deviceName,
        osVersion,
        appVersion,
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
    const { deviceId } = req.body;
    const { _id }: any = req.tokenVerified;

    await DeviceToken.findOneAndUpdate(
      {
        user: _id,
        deviceId,
      },
      { lastUsed: new Date() }
    );

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
    const { _id }: any = req.tokenVerified;

    await DeviceToken.findOneAndUpdate(
      {
        user: _id,
        deviceId,
      },
      { isActive: false }
    );
    res.status(200).json({
      message: "Device token deactivated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsersDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id }: any = req.tokenVerified;

    const devices = await DeviceToken.find({ user: _id, isActive: true }).sort({ lastUsed: -1 });

    res.status(200).json({
      data: { devices },
      message: "Device tokens fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};
