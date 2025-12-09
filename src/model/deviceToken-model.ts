import mongoose from "mongoose";
import { IDeviceToken } from "../types/types";

const DeviceTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fcmToken: {
      type: String,
      required: true,
      unique: true,
    },
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    deviceType: {
      type: String,
      enum: ["android", "ios"],
      required: true,
    },
    deviceName: {
      type: String,
    },
    osVersion: {
      type: String,
    },
    appVersion: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

DeviceTokenSchema.index({ index: 1, deviceId: 1 }, { unique: true });

export const DeviceToken = mongoose.model<IDeviceToken>("DeviceToken", DeviceTokenSchema);
