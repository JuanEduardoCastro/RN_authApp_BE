"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailTokenTest = exports.createNewAccessToken = exports.createRefreshToken = exports.createEmailToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const refreshToken_model_1 = require("../model/refreshToken-model");
const uuid_1 = require("uuid");
/* Create email token */
const createEmailToken = (email, isNew, _id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.GMAIL_TOKEN_SECRET_KEY) {
            throw new Error("Secret key is not valid!");
        }
        const emailToken = jsonwebtoken_1.default.sign({ email, isNew, _id }, process.env.GMAIL_TOKEN_SECRET_KEY, {
            issuer: process.env.GMAIL_TOKEN_ISSUER,
            algorithm: "HS256",
            expiresIn: 300, // 5 min in seconds
        });
        const saveTempToken = yield refreshToken_model_1.TempToken.create({ ttokken: emailToken });
        if (!saveTempToken) {
            throw new Error("Something went wrong with email token temp save");
        }
        return emailToken;
    }
    catch (error) {
        throw error;
    }
});
exports.createEmailToken = createEmailToken;
/* Create refresh token */
const createRefreshToken = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _token = (0, uuid_1.v4)();
        if (!process.env.RTOKEN_SECRET_KEY) {
            throw new Error("Secret key is not valid!");
        }
        const refreshToken = jsonwebtoken_1.default.sign({ _token }, process.env.RTOKEN_SECRET_KEY, {
            issuer: process.env.RTOKEN_ISSUER,
            algorithm: "HS256",
            expiresIn: 864000, // 10 days
        });
        const saveRefreshToken = yield refreshToken_model_1.RefreshToken.create({
            rtokken: refreshToken,
            user: user._id,
        });
        if (!saveRefreshToken) {
            throw new Error("Something went wrong with refresh token temp save");
        }
        return refreshToken;
    }
    catch (error) {
        throw error;
    }
});
exports.createRefreshToken = createRefreshToken;
/* Create access token */
const createNewAccessToken = (_id, isGooggleLogin, isGitHubLogin, isAppleLogin) => {
    if (!process.env.ATOKEN_SECRET_KEY) {
        throw new Error("Secret key is not valid!");
    }
    const accessToken = jsonwebtoken_1.default.sign({ _id, isGooggleLogin, isGitHubLogin, isAppleLogin }, process.env.ATOKEN_SECRET_KEY, {
        issuer: process.env.ATOKEN_ISSUER,
        algorithm: "HS256",
        expiresIn: 1200, // 20 minutes
    });
    if (!accessToken) {
        throw new Error("Something went wrong with email token temp save");
    }
    return accessToken;
};
exports.createNewAccessToken = createNewAccessToken;
/* Controllers to test tokens */
const createEmailTokenTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, isGoogleLogin } = req.body;
        if (!process.env.GMAIL_TOKEN_SECRET_KEY) {
            throw new Error("Secret key is not valid!");
        }
        const isNew = false;
        const _id = "00001";
        const emailToken = jsonwebtoken_1.default.sign({ email, isNew, _id }, process.env.GMAIL_TOKEN_SECRET_KEY, {
            issuer: process.env.GMAIL_TOKEN_ISSUER,
            algorithm: "HS256",
            expiresIn: 180, // 3 min in seconds
        });
        const saveTempToken = yield refreshToken_model_1.TempToken.create({ ttokken: emailToken });
        if (!saveTempToken) {
            throw new Error("Something went wrong with email token temp save");
        }
        res.status(200).send({
            message: "token created and save it successfully",
        });
        return;
    }
    catch (error) {
        throw error;
    }
});
exports.createEmailTokenTest = createEmailTokenTest;
//# sourceMappingURL=refreshToken.controller.js.map