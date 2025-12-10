import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt, { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    tokenVerified: JwtPayload | string;
    tokenUserId?: string;
    token?: string;
  }
}

export const extractToken = (req: Request): string | undefined => {
  return req.headers.authorization?.split(" ")[1];
};

/* Validate tokens */

export const validateRefreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token = extractToken(req);
    const secret = process.env.RTOKEN_SECRET_KEY;

    if (!token) {
      res.status(401).json({ error: "Refresh token is required." });
      return;
    }

    if (!secret) {
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const tokenVerified = jwt.verify(token, secret);
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
    const secret = process.env.GMAIL_TOKEN_SECRET_KEY;

    if (!token) {
      res.status(401).json({ error: "Email token is required." });
      return;
    }

    if (!secret) {
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const tokenVerified = jwt.verify(token, secret);
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
    const secret = process.env.ATOKEN_SECRET_KEY;
    if (!token) {
      res.status(401).json({ error: "Access token is required." });
      return;
    }

    if (!secret) {
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const tokenVerified = jwt.verify(token, secret);
    req.tokenVerified = tokenVerified;
    req.token = token; // Also attach the token itself for consistency
    next();
  } catch (error) {
    next(error);
  }
};

export const validateGoogleToken = async (req: Request, res: Response, next: NextFunction) => {
  const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  try {
    const token = extractToken(req);

    if (token) {
      const googleTicket = await googleClient.verifyIdToken({
        idToken: token as string,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const googleClienPayload = googleTicket.getPayload();

      if (!googleClienPayload?.email_verified) {
        res.status(401).json({ error: "Email token must be verifed." });
        return;
      }
      req.token = token;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/* Validate password */

export const validatePasswordMiddleWare = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const value = req.body.password;

  if (!value) {
    res.status(400).json({ error: "Password is required." });
    return;
  } else if (!/[A-Z]/.test(value)) {
    res.status(400).json({ error: "Password must contain at least one uppercase letter." });
    return;
  } else if (!/[a-z]/.test(value)) {
    res.status(400).json({ error: "Password must contain at least one lowercase letter." });
    return;
  } else if (!/[0-9]/.test(value)) {
    res.status(400).json({ error: "Password must contain at least one number." });
    return;
  } else if (!/[^a-zA-Z0-9]/.test(value)) {
    res.status(400).json({ error: "Password must contain at least one special character." });
    return;
  }
  next();
};
