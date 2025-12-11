"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewAccessToken = exports.createRefreshToken = exports.createEmailToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const refreshToken_model_1 = require("../model/refreshToken-model");
const uuid_1 = require("uuid");
const tokens_1 = require("../constants/tokens");
/* Create email token */
const createEmailToken = async (email, isNew, _id) => {
    const emailToken = jsonwebtoken_1.default.sign({ email, isNew, _id }, process.env.GMAIL_TOKEN_SECRET_KEY, {
        algorithm: "HS256",
        expiresIn: tokens_1.EXPIRY.TEMP_TOKEN,
    });
    const savedToken = await refreshToken_model_1.TempToken.create({ tempToken: emailToken });
    if (!savedToken) {
        throw new Error("Failed to save temporary email token.");
    }
    return emailToken;
};
exports.createEmailToken = createEmailToken;
/* Create refresh token */
const createRefreshToken = async (user) => {
    const existingTokens = await refreshToken_model_1.RefreshToken.find({ user: user._id });
    if (existingTokens.length >= 5) {
        const oldestToken = existingTokens.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
        await refreshToken_model_1.RefreshToken.findByIdAndDelete(oldestToken._id);
    }
    const _token = (0, uuid_1.v4)();
    const refreshToken = jsonwebtoken_1.default.sign({ _token }, process.env.RTOKEN_SECRET_KEY, {
        algorithm: "HS256",
        expiresIn: tokens_1.EXPIRY.REFRESH_TOKEN,
    });
    const savedToken = await refreshToken_model_1.RefreshToken.create({
        refreshToken: refreshToken,
        user: user._id,
    });
    if (!savedToken) {
        throw new Error("Failed to save refresh token.");
    }
    return refreshToken;
};
exports.createRefreshToken = createRefreshToken;
/* Create access token */
const createNewAccessToken = (_id, provider) => {
    const accessToken = jsonwebtoken_1.default.sign({ _id, provider }, process.env.ATOKEN_SECRET_KEY, {
        algorithm: "HS256",
        expiresIn: tokens_1.EXPIRY.ACCESS_TOKEN,
    });
    if (!accessToken) {
        throw new Error("Failed to create access token.");
    }
    return accessToken;
};
exports.createNewAccessToken = createNewAccessToken;
//# sourceMappingURL=refreshToken.controller.js.map