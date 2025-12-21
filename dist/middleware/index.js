"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordMiddleWare = exports.validateGithubToken = exports.validateGoogleToken = exports.validateAccessTokenMiddleware = exports.validateEmailTokenMiddleware = exports.validateRefreshTokenMiddleware = exports.extractToken = void 0;
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const extractToken = (req) => {
    return req.headers.authorization?.split(" ")[1];
};
exports.extractToken = extractToken;
/* Validate tokens */
const validateRefreshTokenMiddleware = async (req, res, next) => {
    try {
        const token = (0, exports.extractToken)(req);
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
        const token = (0, exports.extractToken)(req);
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
        const token = (0, exports.extractToken)(req);
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
        req.token = token;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateAccessTokenMiddleware = validateAccessTokenMiddleware;
const validateGoogleToken = async (req, res, next) => {
    const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    try {
        const token = (0, exports.extractToken)(req);
        if (!token) {
            res.status(401).json({ error: "Google token is required." });
            return;
        }
        const googleTicket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const googleClientPayload = googleTicket.getPayload();
        if (!googleClientPayload?.email_verified) {
            res.status(401).json({ error: "Email must be verified." });
            return;
        }
        req.token = token;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateGoogleToken = validateGoogleToken;
const validateGithubToken = async (req, res, next) => {
    try {
        const token = (0, exports.extractToken)(req);
        if (!token) {
            res.status(401).json({ error: "GitHub access token is required" });
            return;
        }
        const githubUserData = await axios_1.default.get("https://api.github.com/user", {
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
            const emailsData = await axios_1.default.get("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github.v3+json",
                },
            });
            const primaryEmails = emailsData.data.find((email) => email.primary && email.verified);
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
    }
    catch (error) {
        next(error);
    }
};
exports.validateGithubToken = validateGithubToken;
/* Validate password */
const validatePasswordMiddleWare = async (req, res, next) => {
    const value = req.body.password;
    if (!value) {
        res.status(400).json({ error: "Password is required." });
        return;
    }
    else if (value.length < 8) {
        res.status(400).json({ error: "Password must be at least 8 characters long." });
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