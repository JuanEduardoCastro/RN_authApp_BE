import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { RefreshToken, TempToken } from "../model/refreshToken-model";
import { IUser } from "../types/types";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

/* Create email token */

export const createEmailToken = async (
  email: string,
  isNew: boolean,
  _id?: string | Types.ObjectId
) => {
  try {
    if (!process.env.GMAIL_TOKEN_SECRET_KEY) {
      throw new Error("Secret key is not valid!");
    }

    const emailToken = jwt.sign({ email, isNew, _id }, process.env.GMAIL_TOKEN_SECRET_KEY, {
      issuer: process.env.GMAIL_TOKEN_ISSUER,
      algorithm: "HS256",
      expiresIn: 300, // 5 min in seconds
    });

    const saveTempToken = await TempToken.create({ ttokken: emailToken });
    if (!saveTempToken) {
      throw new Error("Something went wrong with email token temp save");
    }

    return emailToken;
  } catch (error) {
    throw error;
  }
};

/* Create refresh token */

export const createRefreshToken = async (user: IUser) => {
  try {
    const _token = uuidv4();

    if (!process.env.RTOKEN_SECRET_KEY) {
      throw new Error("Secret key is not valid!");
    }

    const refreshToken = jwt.sign({ _token }, process.env.RTOKEN_SECRET_KEY, {
      issuer: process.env.RTOKEN_ISSUER,
      algorithm: "HS256",
      expiresIn: 864000, // 10 days
    });

    const saveRefreshToken = await RefreshToken.create({
      rtokken: refreshToken,
      user: user._id,
    });
    if (!saveRefreshToken) {
      throw new Error("Something went wrong with refresh token temp save");
    }

    return refreshToken;
  } catch (error) {
    console.log("XX -> refreshToken.controller.ts:20 -> createRefreshToken -> error :", error);
    throw error;
  }
};

/* Create access token */

export const createNewAccessToken = (
  _id: string | Types.ObjectId,
  isGooggleLogin: boolean | undefined,
  isGitHubLogin: boolean | undefined,
  isAppleLogin: boolean | undefined
) => {
  if (!process.env.ATOKEN_SECRET_KEY) {
    throw new Error("Secret key is not valid!");
  }

  const accessToken = jwt.sign(
    { _id, isGooggleLogin, isGitHubLogin, isAppleLogin },
    process.env.ATOKEN_SECRET_KEY,
    {
      issuer: process.env.ATOKEN_ISSUER,
      algorithm: "HS256",
      expiresIn: 1200, // 20 minutes
    }
  );

  if (!accessToken) {
    throw new Error("Something went wrong with email token temp save");
  }

  return accessToken;
};

/* Controllers to test tokens */

export const createEmailTokenTest = async (req: Request, res: Response) => {
  try {
    const { email, isGoogleLogin } = req.body;

    if (!process.env.GMAIL_TOKEN_SECRET_KEY) {
      throw new Error("Secret key is not valid!");
    }
    const isNew = false;
    const _id = "00001";
    const emailToken = jwt.sign({ email, isNew, _id }, process.env.GMAIL_TOKEN_SECRET_KEY, {
      issuer: process.env.GMAIL_TOKEN_ISSUER,
      algorithm: "HS256",
      expiresIn: 180, // 3 min in seconds
    });

    const saveTempToken = await TempToken.create({ ttokken: emailToken });
    if (!saveTempToken) {
      throw new Error("Something went wrong with email token temp save");
    }

    res.status(200).send({
      message: "token created and save it successfully",
    });
    return;
  } catch (error) {
    throw error;
  }
};
