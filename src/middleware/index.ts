import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";

declare module "express-serve-static-core" {
  interface Request {
    tokenVerified: JwtPayload | string;
    token?: string;
  }
}

const extractToken = (req: Request): string | undefined => {
  return req.headers.authorization?.split(" ")[1];
};

/* Validate refreshToken from app */

export const validateRefreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({ error: "Refresh token is required." });
      return;
    }

    const tokenVerified = jwt.verify(token, config.RTOKEN_SECRET_KEY);
    req.tokenVerified = tokenVerified;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};

export const validateEmailTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({ error: "Email token is required." });
      return;
    }

    const tokenVerified = jwt.verify(token, config.GMAIL_TOKEN_SECRET_KEY);
    req.tokenVerified = tokenVerified;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};

export const validateAccessTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({ error: "Access token is required." });
      return;
    }
    const tokenVerified = jwt.verify(token, config.ATOKEN_SECRET_KEY);
    req.tokenVerified = tokenVerified;
    req.token = token; // Also attach the token itself for consistency
    next();
  } catch (error) {
    next(error);
  }
};
