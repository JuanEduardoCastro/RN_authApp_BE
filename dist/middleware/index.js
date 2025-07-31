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
exports.validateRefreshTokenMiddleware = exports.validateAccessTokenMiddleware = exports.validateEmailTokenMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateEmailTokenMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            return res.status(404).json({ error: "Email token is required." });
        }
        if (!process.env.ATOKEN_SECRET_KEY) {
            throw new Error("Secret key is not valid.");
        }
        jsonwebtoken_1.default.verify(token, process.env.GMAIL_TOKEN_SECRET_KEY, (error, tokenVerified) => {
            if (error) {
                return res.status(401).json({ error: "The token is invalid or expired." });
            }
            req.tokenVerified = JSON.stringify(tokenVerified);
            req.token = token;
        });
        next();
    }
    catch (error) {
        throw error;
    }
});
exports.validateEmailTokenMiddleware = validateEmailTokenMiddleware;
const validateAccessTokenMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            return res.status(404).json({ error: "Access token is required." });
        }
        if (!process.env.ATOKEN_SECRET_KEY) {
            throw new Error("Secret key is not valid.");
        }
        jsonwebtoken_1.default.verify(token, process.env.ATOKEN_SECRET_KEY, (error, tokenVerified) => {
            if (error) {
                return res.status(205).json({ error: "The token is invalid or expired." });
            }
            req.tokenVerified = JSON.stringify(tokenVerified);
        });
        next();
    }
    catch (error) {
        throw error;
    }
});
exports.validateAccessTokenMiddleware = validateAccessTokenMiddleware;
const validateRefreshTokenMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            return res.status(404).json({ error: "Access token is required." });
        }
        if (!process.env.RTOKEN_SECRET_KEY) {
            throw new Error("Secret key is not valid.");
        }
        jsonwebtoken_1.default.verify(token, process.env.RTOKEN_SECRET_KEY, (error, tokenVerified) => {
            if (error) {
                return res.status(401).json({ error: "The token is invalid or expired." });
            }
            // check if it is in the temp
            req.tokenVerified = JSON.stringify(tokenVerified);
            req.token = token;
        });
        next();
    }
    catch (error) {
        throw error;
    }
});
exports.validateRefreshTokenMiddleware = validateRefreshTokenMiddleware;
//# sourceMappingURL=index.js.map