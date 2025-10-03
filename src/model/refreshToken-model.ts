import mongoose from "mongoose";
import { IRefreshToken, ITempToken } from "../types/types";

const refreshTokenSchema = new mongoose.Schema(
  {
    rtokken: {
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
      expires: 864000, // 10 days
    },
  },
  { timestamps: true }
);

export const RefreshToken = mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);

const tempTokenSchema = new mongoose.Schema(
  {
    ttokken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      expires: 180, // 3 minutes
    },
  },
  { timestamps: true }
);

export const TempToken = mongoose.model<ITempToken>("TempToken", tempTokenSchema);
