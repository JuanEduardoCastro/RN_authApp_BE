import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5,
  message: { error: "Too many login attempts, please try again later." },
});

const logoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5,
  message: { error: "Too many logout attempts, please try again later." },
});

const newPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: "Too many save password attempts, please try again later." },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: "Too many password reset attempts, please try again later." },
});

const checkEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: "Too many email check attempts, please try again later." },
});

const createUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: "Too many account creation attempts, please try again later." },
});

const tokenRefreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many token refresh attempts, please try again later." },
});

const googleLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5,
  message: { error: "Too many login attempts with google, please try again later." },
});

const githubLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many GitHub login attempts, please try again later." },
});

const deviceTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5,
  message: { error: "Too many device token attempts, please try again later." },
});

const getTokensLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
});

const createNotificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
});

export {
  loginLimiter,
  logoutLimiter,
  newPasswordLimiter,
  resetPasswordLimiter,
  checkEmailLimiter,
  createUserLimiter,
  tokenRefreshLimiter,
  googleLoginLimiter,
  githubLoginLimiter,
  deviceTokenLimiter,
  getTokensLimiter,
  createNotificationLimiter,
};
