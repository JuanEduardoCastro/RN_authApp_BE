import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minute
  max: 5,
  message: { error: "Too many login attempts, please try again later." },
  keyGenerator: (req) => req.body.email?.toLowerCase() || ipKeyGenerator(req.ip ?? ""),
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

const logoutLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minute
  max: 5,
  message: { error: "Too many logout attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const newPasswordLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minute
  max: 3,
  message: { error: "Too many save password attempts, please try again later." },
  keyGenerator: (req) => req.body.email?.toLowerCase() || ipKeyGenerator(req.ip ?? ""),
  standardHeaders: true,
  legacyHeaders: false,
});

const resetPasswordLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minute
  max: 3,
  message: { error: "Too many password reset attempts, please try again later." },
  keyGenerator: (req) => req.body.email?.toLowerCase() || ipKeyGenerator(req.ip ?? ""),
  standardHeaders: true,
  legacyHeaders: false,
});

const checkEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: "Too many email check attempts, please try again later." },
  keyGenerator: (req) => req.body.email?.toLowerCase() || ipKeyGenerator(req.ip ?? ""),
  standardHeaders: true,
  legacyHeaders: false,
});

const createUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: "Too many account creation attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const tokenRefreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many token refresh attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const googleLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5,
  message: { error: "Too many login attempts with google, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const githubLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many GitHub login attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const appleLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many Apple login attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const deviceTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5,
  message: { error: "Too many device token attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const getTokensLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const createNotificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const sendMessageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many message send attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const getUsersLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 30,
  message: { error: "Too many get users attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const getMessagesLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 60,
  message: { error: "Too many message fetch requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const markReadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1
  max: 120,
  message: { error: "Too many mark-read requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
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
  appleLoginLimiter,
  deviceTokenLimiter,
  getTokensLimiter,
  createNotificationLimiter,
  sendMessageLimiter,
  getUsersLimiter,
  getMessagesLimiter,
  markReadLimiter,
};
