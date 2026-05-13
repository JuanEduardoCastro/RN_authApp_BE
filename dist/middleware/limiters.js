"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationLimiter = exports.getTokensLimiter = exports.deviceTokenLimiter = exports.appleLoginLimiter = exports.githubLoginLimiter = exports.googleLoginLimiter = exports.tokenRefreshLimiter = exports.createUserLimiter = exports.checkEmailLimiter = exports.resetPasswordLimiter = exports.newPasswordLimiter = exports.logoutLimiter = exports.loginLimiter = void 0;
const express_rate_limit_1 = __importStar(require("express-rate-limit"));
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minute
    max: 5,
    message: { error: "Too many login attempts, please try again later." },
    keyGenerator: (req) => req.body.email?.toLowerCase() || (0, express_rate_limit_1.ipKeyGenerator)(req.ip ?? ""),
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.loginLimiter = loginLimiter;
const logoutLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minute
    max: 5,
    message: { error: "Too many logout attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.logoutLimiter = logoutLimiter;
const newPasswordLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { error: "Too many save password attempts, please try again later." },
    keyGenerator: (req) => req.body.email?.toLowerCase() || (0, express_rate_limit_1.ipKeyGenerator)(req.ip ?? ""),
    standardHeaders: true,
    legacyHeaders: false,
});
exports.newPasswordLimiter = newPasswordLimiter;
const resetPasswordLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { error: "Too many password reset attempts, please try again later." },
    keyGenerator: (req) => req.body.email?.toLowerCase() || (0, express_rate_limit_1.ipKeyGenerator)(req.ip ?? ""),
    standardHeaders: true,
    legacyHeaders: false,
});
exports.resetPasswordLimiter = resetPasswordLimiter;
const checkEmailLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: { error: "Too many email check attempts, please try again later." },
    keyGenerator: (req) => req.body.email?.toLowerCase() || (0, express_rate_limit_1.ipKeyGenerator)(req.ip ?? ""),
    standardHeaders: true,
    legacyHeaders: false,
});
exports.checkEmailLimiter = checkEmailLimiter;
const createUserLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { error: "Too many account creation attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.createUserLimiter = createUserLimiter;
const tokenRefreshLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: "Too many token refresh attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.tokenRefreshLimiter = tokenRefreshLimiter;
const googleLoginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minute
    max: 5,
    message: { error: "Too many login attempts with google, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.googleLoginLimiter = googleLoginLimiter;
const githubLoginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { error: "Too many GitHub login attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.githubLoginLimiter = githubLoginLimiter;
const appleLoginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { error: "Too many Apple login attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.appleLoginLimiter = appleLoginLimiter;
const deviceTokenLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minute
    max: 5,
    message: { error: "Too many device token attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.deviceTokenLimiter = deviceTokenLimiter;
const getTokensLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.getTokensLimiter = getTokensLimiter;
const createNotificationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.createNotificationLimiter = createNotificationLimiter;
//# sourceMappingURL=limiters.js.map