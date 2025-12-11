import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { RefreshToken, TempToken } from "../model/refreshToken-model";
import { IUser, IProvider } from "../types/types";
import { v4 as uuidv4 } from "uuid";
import { EXPIRY } from "../constants/tokens";

/* Create email token */

export const createEmailToken = async (
  email: string,
  isNew: boolean,
  _id?: string | Types.ObjectId
) => {
  const emailToken = jwt.sign({ email, isNew, _id }, process.env.GMAIL_TOKEN_SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: EXPIRY.TEMP_TOKEN,
  });

  const savedToken = await TempToken.create({ tempToken: emailToken });
  if (!savedToken) {
    throw new Error("Failed to save temporary email token.");
  }

  return emailToken;
};

/* Create refresh token */

export const createRefreshToken = async (user: IUser) => {
  const existingTokens = await RefreshToken.find({ user: user._id });

  if (existingTokens.length >= 5) {
    const oldestToken = existingTokens.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    )[0];
    await RefreshToken.findByIdAndDelete(oldestToken._id);
  }

  const _token = uuidv4();

  const refreshToken = jwt.sign({ _token }, process.env.RTOKEN_SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: EXPIRY.REFRESH_TOKEN,
  });

  const savedToken = await RefreshToken.create({
    refreshToken: refreshToken,
    user: user._id,
  });

  if (!savedToken) {
    throw new Error("Failed to save refresh token.");
  }

  return refreshToken;
};

/* Create access token */

export const createNewAccessToken = (_id: string | Types.ObjectId, provider: IProvider | null) => {
  const accessToken = jwt.sign({ _id, provider }, process.env.ATOKEN_SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: EXPIRY.ACCESS_TOKEN,
  });

  if (!accessToken) {
    throw new Error("Failed to create access token.");
  }

  return accessToken;
};
