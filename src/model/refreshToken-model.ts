import mongoose from "mongoose";
import { IRefreshToken, ITempToken } from "../types/types";
import { EXPIRY } from "../constants/tokens";

const refreshTokenSchema = new mongoose.Schema(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      expires: EXPIRY.REFRESH_TOKEN,
    },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ refreshToken: 1 });
refreshTokenSchema.index({ user: 1 });

export const RefreshToken = mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);

const tempTokenSchema = new mongoose.Schema(
  {
    tempToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      expires: EXPIRY.TEMP_TOKEN,
    },
  },
  { timestamps: true }
);

tempTokenSchema.index({ tempToken: 1 });

export const TempToken = mongoose.model<ITempToken>("TempToken", tempTokenSchema);
