"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenRefreshLimiter = exports.createUserLimiter = exports.checkEmailLimiter = exports.resetPasswordLimiter = exports.loginLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minute
    max: 5,
    message: { error: "Too many login attempts, please try again later." },
});
exports.loginLimiter = loginLimiter;
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
//# sourceMappingURL=limiters.js.map