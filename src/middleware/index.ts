import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { AccessTokenPayload, EmailTokenPayload, RefreshTokenPayload } from "../types/types";
import axios from "axios";

declare module "express-serve-static-core" {
  interface Request {
    tokenVerified: AccessTokenPayload | RefreshTokenPayload | EmailTokenPayload;
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
): Promise<void> => {
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
    req.tokenVerified = tokenVerified as RefreshTokenPayload;
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
): Promise<void> => {
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
    req.tokenVerified = tokenVerified as EmailTokenPayload;
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
): Promise<void> => {
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
    req.tokenVerified = tokenVerified as AccessTokenPayload;
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
};

export const validateGoogleToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({ error: "Google token is required." });
      return;
    }
    const googleTicket = await googleClient.verifyIdToken({
      idToken: token as string,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const googleClientPayload = googleTicket.getPayload();

    if (!googleClientPayload?.email_verified) {
      res.status(401).json({ error: "Email must be verified." });
      return;
    }
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
};

export const validateGithubToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({ error: "GitHub access token is required" });
      return;
    }

    const githubUserData = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!githubUserData.data) {
      res.status(401).json({ error: "Invalid GitHub access token" });
      return;
    }

    let email = githubUserData.data.email;

    if (!email) {
      const emailsData = await axios.get("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      const primaryEmails = emailsData.data.find((email: any) => email.primary && email.verified);

      if (!primaryEmails) {
        res.status(401).json({ error: "No verified email found in GitHub account" });
        return;
      }
      email = primaryEmails.email;
    }

    const githubUser = {
      firstName: githubUserData.data.name?.split(" ")[0] || "",
      lastName: githubUserData.data.name?.split(" ").slice(1).join(" ") || "",
      email: email.toLowerCase(),
      avatarURL: githubUserData.data.avatar_url || null,
    };

    req.body.githubUser = githubUser;
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
  } else if (value.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters long." });
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
