import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5,
  message: { error: "Too many login attempts, please try again later." },
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

export { loginLimiter, resetPasswordLimiter, checkEmailLimiter };
