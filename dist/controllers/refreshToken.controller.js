"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailTokenTest = exports.createNewAccessToken = exports.createRefreshToken = exports.createEmailToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const refreshToken_model_1 = require("../model/refreshToken-model");
const uuid_1 = require("uuid");
const config_1 = require("../config");
/* Create email token */
const createEmailToken = async (email, isNew, _id) => {
    const emailToken = jsonwebtoken_1.default.sign({ email, isNew, _id }, config_1.config.GMAIL_TOKEN_SECRET_KEY, {
        algorithm: "HS256",
        expiresIn: 300, // 5 min in seconds
    });
    const savedToken = await refreshToken_model_1.TempToken.create({ ttokken: emailToken });
    if (!savedToken) {
        throw new Error("Failed to save temporary email token.");
    }
    return emailToken;
};
exports.createEmailToken = createEmailToken;
/* Create refresh token */
const createRefreshToken = async (user) => {
    const _token = (0, uuid_1.v4)();
    const refreshToken = jsonwebtoken_1.default.sign({ _token }, config_1.config.RTOKEN_SECRET_KEY, {
        algorithm: "HS256",
        expiresIn: 864000, // 10 days
    });
    const savedToken = await refreshToken_model_1.RefreshToken.create({
        rtokken: refreshToken,
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
    const accessToken = jsonwebtoken_1.default.sign({ _id, provider }, config_1.config.ATOKEN_SECRET_KEY, {
        algorithm: "HS256",
        // expiresIn: 1200, // 20 minutes
        expiresIn: 86400, // 24 hours
    });
    if (!accessToken) {
        throw new Error("Failed to create access token.");
    }
    return accessToken;
};
exports.createNewAccessToken = createNewAccessToken;
/* Controller to test tokens */
const createEmailTokenTest = async (req, res, next) => {
    try {
        const { email } = req.body;
        const isNew = false;
        const _id = "00001";
        const emailToken = jsonwebtoken_1.default.sign({ email, isNew, _id }, config_1.config.GMAIL_TOKEN_SECRET_KEY, {
            algorithm: "HS256",
            expiresIn: 180, // 3 min in seconds
        });
        const saveTempToken = await refreshToken_model_1.TempToken.create({ ttokken: emailToken });
        if (!saveTempToken) {
            throw new Error("Something went wrong with email token temp save");
        }
        res.status(200).send({ message: "Token created and saved successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.createEmailTokenTest = createEmailTokenTest;
//# sourceMappingURL=refreshToken.controller.js.map