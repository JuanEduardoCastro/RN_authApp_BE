import { NextFunction, Request, Response } from "express";

export const enforceHTTPS = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === "development") {
    return next();
  }

  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    return next();
  }

  res.redirect(301, `https://${req.headers.host}${req.url}`);
};
