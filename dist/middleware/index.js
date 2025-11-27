"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordMiddleWare = exports.validateAccessTokenMiddleware = exports.validateEmailTokenMiddleware = exports.validateRefreshTokenMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const extractToken = (req) => {
    return req.headers.authorization?.split(" ")[1];
};
/* Validate tokens */
const validateRefreshTokenMiddleware = async (req, res, next) => {
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
        const tokenVerified = jsonwebtoken_1.default.verify(token, secret);
        req.tokenVerified = tokenVerified;
        req.token = token;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateRefreshTokenMiddleware = validateRefreshTokenMiddleware;
const validateEmailTokenMiddleware = async (req, res, next) => {
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
        const tokenVerified = jsonwebtoken_1.default.verify(token, secret);
        req.tokenVerified = tokenVerified;
        req.token = token;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateEmailTokenMiddleware = validateEmailTokenMiddleware;
const validateAccessTokenMiddleware = async (req, res, next) => {
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
        const tokenVerified = jsonwebtoken_1.default.verify(token, secret);
        req.tokenVerified = tokenVerified;
        req.token = token; // Also attach the token itself for consistency
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateAccessTokenMiddleware = validateAccessTokenMiddleware;
/* Validate password */
const validatePasswordMiddleWare = async (req, res, next) => {
    const value = req.body.password;
    if (!value) {
        res.status(400).json({ error: "Password is required." });
        return;
    }
    else if (!/[A-Z]/.test(value)) {
        res.status(400).json({ error: "Password must contain at least one uppercase letter." });
        return;
    }
    else if (!/[a-z]/.test(value)) {
        res.status(400).json({ error: "Password must contain at least one lowercase letter." });
        return;
    }
    else if (!/[0-9]/.test(value)) {
        res.status(400).json({ error: "Password must contain at least one number." });
        return;
    }
    else if (!/[^a-zA-Z0-9]/.test(value)) {
        res.status(400).json({ error: "Password must contain at least one special character." });
        return;
    }
    next();
};
exports.validatePasswordMiddleWare = validatePasswordMiddleWare;
//# sourceMappingURL=index.js.map