"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAccessTokenMiddleware = exports.validateEmailTokenMiddleware = exports.validateRefreshTokenMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const extractToken = (req) => {
    return req.headers.authorization?.split(" ")[1];
};
/* Validate refreshToken from app */
const validateRefreshTokenMiddleware = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            res.status(401).json({ error: "Refresh token is required." });
            return;
        }
        const tokenVerified = jsonwebtoken_1.default.verify(token, config_1.config.RTOKEN_SECRET_KEY);
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
        if (!token) {
            res.status(401).json({ error: "Email token is required." });
            return;
        }
        const tokenVerified = jsonwebtoken_1.default.verify(token, config_1.config.GMAIL_TOKEN_SECRET_KEY);
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
        if (!token) {
            res.status(401).json({ error: "Access token is required." });
            return;
        }
        const tokenVerified = jsonwebtoken_1.default.verify(token, config_1.config.ATOKEN_SECRET_KEY);
        req.tokenVerified = tokenVerified;
        req.token = token; // Also attach the token itself for consistency
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateAccessTokenMiddleware = validateAccessTokenMiddleware;
//# sourceMappingURL=index.js.map