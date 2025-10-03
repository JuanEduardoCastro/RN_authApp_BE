import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { RefreshToken, TempToken } from "../model/refreshToken-model";
import { IUser, IProvider } from "../types/types";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config";
import { NextFunction, Request, Response } from "express";

/* Create email token */

export const createEmailToken = async (
  email: string,
  isNew: boolean,
  _id?: string | Types.ObjectId
) => {
  const emailToken = jwt.sign({ email, isNew, _id }, config.GMAIL_TOKEN_SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: 300, // 5 min in seconds
  });

  const savedToken = await TempToken.create({ ttokken: emailToken });
  if (!savedToken) {
    throw new Error("Failed to save temporary email token.");
  }

  return emailToken;
};

/* Create refresh token */

export const createRefreshToken = async (user: IUser) => {
  const _token = uuidv4();

  const refreshToken = jwt.sign({ _token }, config.RTOKEN_SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: 864000, // 10 days
  });

  const savedToken = await RefreshToken.create({
    rtokken: refreshToken,
    user: user._id,
  });
  if (!savedToken) {
    throw new Error("Failed to save refresh token.");
  }

  return refreshToken;
};

/* Create access token */

export const createNewAccessToken = (_id: string | Types.ObjectId, provider: IProvider | null) => {
  const accessToken = jwt.sign({ _id, provider }, config.ATOKEN_SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: 1200, // 20 minutes
  });

  if (!accessToken) {
    throw new Error("Failed to create access token.");
  }

  return accessToken;
};

/* Controller to test tokens */

export const createEmailTokenTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const isNew = false;
    const _id = "00001";
    const emailToken = jwt.sign({ email, isNew, _id }, config.GMAIL_TOKEN_SECRET_KEY, {
      algorithm: "HS256",
      expiresIn: 180, // 3 min in seconds
    });

    const saveTempToken = await TempToken.create({ ttokken: emailToken });
    if (!saveTempToken) {
      throw new Error("Something went wrong with email token temp save");
    }

    res.status(200).send({ message: "Token created and saved successfully" });
  } catch (error) {
    next(error);
  }
};
