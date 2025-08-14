import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { RefreshToken, TempToken } from "../model/refreshToken-model";

declare module "express-serve-static-core" {
  interface Request {
    tokenVerified: string;
    token: string;
  }
}

/* Validate refreshToken from app */

export const validateRefreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).json({ error: "Access token is required." });
    }
    if (!process.env.RTOKEN_SECRET_KEY) {
      throw new Error("Secret key is not valid.");
    }

    jwt.verify(token, process.env.RTOKEN_SECRET_KEY as string, (error, tokenVerified) => {
      if (error) {
        return res.status(401).json({ error: "The token is invalid or expired." });
      }
      req.tokenVerified = JSON.stringify(tokenVerified);
      req.token = token;
      next();
    });

    // next();
  } catch (error) {
    throw error;
  }
};

export const validateEmailTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(403).json({ error: "Email token is required." });
    }
    if (!process.env.ATOKEN_SECRET_KEY) {
      throw new Error("Secret key is not valid.");
    }

    jwt.verify(token, process.env.GMAIL_TOKEN_SECRET_KEY as string, (error, tokenVerified) => {
      if (error) {
        return res.status(401).json({ error: "The token is invalid or expired." });
      }

      req.tokenVerified = JSON.stringify(tokenVerified);
      req.token = token;
      next();
    });
  } catch (error) {
    throw error;
  }
};

export const validateAccessTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).json({ error: "Access token is required." });
    }
    if (!process.env.ATOKEN_SECRET_KEY) {
      throw new Error("Secret key is not valid.");
    }
    jwt.verify(token, process.env.ATOKEN_SECRET_KEY as string, (error, tokenVerified) => {
      if (error) {
        return res.status(401).json({ error: "The token is invalid or expired." });
      }
      req.tokenVerified = JSON.stringify(tokenVerified);
      next();
    });
  } catch (error) {
    throw error;
  }
};
