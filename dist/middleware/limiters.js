"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceTokenLimiter = exports.githubLoginLimiter = exports.googleLoginLimiter = exports.tokenRefreshLimiter = exports.createUserLimiter = exports.checkEmailLimiter = exports.resetPasswordLimiter = exports.newPasswordLimiter = exports.logoutLimiter = exports.loginLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minute
    max: 5,
    message: { error: "Too many login attempts, please try again later." },
});
exports.loginLimiter = loginLimiter;
const logoutLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minute
    max: 5,
    message: { error: "Too many logout attempts, please try again later." },
});
exports.logoutLimiter = logoutLimiter;
const newPasswordLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { error: "Too many save password attempts, please try again later." },
});
exports.newPasswordLimiter = newPasswordLimiter;
const resetPasswordLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { error: "Too many password reset attempts, please try again later." },
});
exports.resetPasswordLimiter = resetPasswordLimiter;
const checkEmailLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: { error: "Too many email check attempts, please try again later." },
});
exports.checkEmailLimiter = checkEmailLimiter;
const createUserLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { error: "Too many account creation attempts, please try again later." },
});
exports.createUserLimiter = createUserLimiter;
const tokenRefreshLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: "Too many token refresh attempts, please try again later." },
});
exports.tokenRefreshLimiter = tokenRefreshLimiter;
const googleLoginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minute
    max: 5,
    message: { error: "Too many login attempts with google, please try again later." },
});
exports.googleLoginLimiter = googleLoginLimiter;
const githubLoginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { error: "Too many GitHub login attempts, please try again later." },
});
exports.githubLoginLimiter = githubLoginLimiter;
const deviceTokenLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minute
    max: 5,
    message: { error: "Too many device token attempts with google, please try again later." },
});
exports.deviceTokenLimiter = deviceTokenLimiter;
//# sourceMappingURL=limiters.js.map