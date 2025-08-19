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
exports.logoutUser = exports.updatePssUser = exports.resetPassword = exports.createUser = exports.checkEmail = exports.editUser = exports.loginUser = exports.validateNewAccessToken = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../model/user-model"));
const emailServices_1 = require("../services/emailServices");
const refreshToken_controller_1 = require("./refreshToken.controller");
const refreshToken_model_1 = require("../model/refreshToken-model");
/* Validate user token with middleware */
const validateNewAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.token;
        const existingRefreshToken = yield refreshToken_model_1.RefreshToken.findOne({ rtokken: token }).populate("user");
        if (!existingRefreshToken) {
            res.status(401).send({ error: "Token expires. User have to send credentials." });
            return;
        }
        const existingUser = yield user_model_1.default.findOne({ _id: existingRefreshToken.user });
        if (!existingUser) {
            res.status(404).send({ error: "User not found" });
            return;
        }
        else {
            const accessToken = (0, refreshToken_controller_1.createNewAccessToken)(existingUser._id, existingUser.isGoogleLogin, existingUser.isGitHubLogin, existingUser.isAppleLogin);
            if (accessToken) {
                res.status(200).send({
                    accessToken,
                    user: {
                        firstName: existingUser.firstName,
                        email: existingUser.email,
                        lastName: existingUser.lastName,
                        phoneNumber: existingUser.phoneNumber,
                        occupation: existingUser.occupation,
                        isGoogleLogin: existingUser.isGoogleLogin,
                        isGitHubLogin: existingUser.isGitHubLogin,
                        isAppleLogin: existingUser.isAppleLogin,
                        avatarURL: existingUser.avatarURL,
                        createdAt: existingUser.createdAt,
                        updatedAt: existingUser.updatedAt,
                    },
                });
                return;
            }
        }
    }
    catch (error) {
        throw error;
    }
});
exports.validateNewAccessToken = validateNewAccessToken;
/* Login a user with credentials */
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const existingUser = yield user_model_1.default.findOne({ email });
        if (!existingUser) {
            res.status(404).send({ error: "User not found" });
            return;
        }
        else {
            const resCheckOtherSession = yield refreshToken_model_1.RefreshToken.findOneAndDelete({
                user: existingUser._id,
            });
        }
        const isPasswordVerify = yield bcrypt_1.default.compare(password, existingUser.password);
        if (isPasswordVerify) {
            const accessToken = (0, refreshToken_controller_1.createNewAccessToken)(existingUser._id, existingUser.isGoogleLogin, existingUser.isGitHubLogin, existingUser.isAppleLogin);
            const refreshToken = yield (0, refreshToken_controller_1.createRefreshToken)(existingUser);
            if (refreshToken) {
                res.status(200).send({
                    refreshToken,
                    accessToken,
                    user: {
                        firstName: existingUser.firstName,
                        email: existingUser.email,
                        lastName: existingUser.lastName,
                        phoneNumber: existingUser.phoneNumber,
                        occupation: existingUser.occupation,
                        isGoogleLogin: existingUser.isGoogleLogin,
                        isGitHubLogin: existingUser.isGitHubLogin,
                        isAppleLogin: existingUser.isAppleLogin,
                        avatarURL: existingUser.avatarURL,
                        createdAt: existingUser.createdAt,
                        updatedAt: existingUser.updatedAt,
                    },
                });
                return;
            }
        }
        else {
            res.status(401).send({ error: "Wrong credentials" });
            return;
        }
    }
    catch (error) {
        throw error;
    }
});
exports.loginUser = loginUser;
/* Edit profile of a user by id */
const editUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const editData = req.body;
        const tokenDecoded = req.tokenVerified;
        const existingUser = yield user_model_1.default.findByIdAndUpdate({ _id: id }, editData, {
            returnOriginal: false,
        });
        if (!existingUser) {
            res.status(404).send({ error: "User not found" });
            return;
        }
        if (existingUser) {
            const accessToken = (0, refreshToken_controller_1.createNewAccessToken)(existingUser._id, existingUser.isGoogleLogin, existingUser.isGitHubLogin, existingUser.isAppleLogin);
            res.status(201).send({
                message: "User edited successfully",
                accessToken,
                user: {
                    firstName: existingUser.firstName,
                    email: existingUser.email,
                    lastName: existingUser.lastName,
                    phoneNumber: existingUser.phoneNumber,
                    occupation: existingUser.occupation,
                    isGoogleLogin: existingUser.isGoogleLogin,
                    isGitHubLogin: existingUser.isGitHubLogin,
                    isAppleLogin: existingUser.isAppleLogin,
                    avatarURL: existingUser.avatarURL,
                },
            });
            return;
        }
    }
    catch (error) {
        throw error;
    }
});
exports.editUser = editUser;
/* ------------------------------------ */
/* Check if email exists */
const checkEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, isGoogleLogin } = req.body;
        const checkEmail = yield user_model_1.default.findOne({ email });
        if (checkEmail) {
            res.status(204).send({ message: "This email already exists." });
            return;
        }
        const isNew = true;
        const emailToken = yield (0, refreshToken_controller_1.createEmailToken)(email, isNew);
        if (!isGoogleLogin) {
            (0, emailServices_1.sendEmailValidation)(emailToken, email);
        }
        res.status(200).send({
            message: "This email is available to create a new user",
            emailToken: emailToken,
            // This "data" is for DEV not PRODUCTION
            data: `authapp://app/new-password/${emailToken}`,
        });
        return;
    }
    catch (error) {
        throw error;
    }
});
exports.checkEmail = checkEmail;
/* Create a new user */
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.token;
        if (token) {
            const checkTempToken = yield refreshToken_model_1.TempToken.findOneAndDelete({ ttokken: token });
            if (!checkTempToken) {
                res.status(403).json({ error: "The token is invalid or expired." });
                return;
            }
        }
        const { firstName, email, password, lastName, isGoogleLogin, isGitHubLogin, isAppleLogin, phoneNumber, occupation, avatarURL, } = req.body;
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(409).send({ error: "User already exist." });
            return;
        }
        const hashPassword = yield bcrypt_1.default.hash(password, 12);
        const user = yield user_model_1.default.create({
            email: email,
            password: hashPassword,
            firstName,
            lastName,
            isGoogleLogin,
            isGitHubLogin,
            isAppleLogin,
            phoneNumber,
            occupation,
            avatarURL,
        });
        if (user) {
            res.status(201).send({ message: "User created successfully" });
        }
        return;
    }
    catch (error) {
        throw error;
    }
});
exports.createUser = createUser;
/* Reset password */
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, isGoogleLogin } = req.body;
        const checkEmail = yield user_model_1.default.findOne({ email });
        if (!checkEmail) {
            res.status(409).send({ error: "User doesn't exist." });
            return;
        }
        const id = checkEmail._id;
        const isNew = false;
        const emailToken = yield (0, refreshToken_controller_1.createEmailToken)(email, isNew, id);
        if (emailToken) {
            (0, emailServices_1.sendResetPasswordValidation)(emailToken, email);
        }
        res.status(200).send({
            message: "User can reset password",
            // This data is for DEV not PRODUCTION
            data: `authapp://app/new-password/${emailToken}`,
        });
        return;
    }
    catch (error) {
        throw error;
    }
});
exports.resetPassword = resetPassword;
/* Update new password of a user by id */
const updatePssUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.tokenVerified;
        if (token) {
            const checkTempToken = yield refreshToken_model_1.TempToken.findOneAndDelete({ ttokken: token });
            if (!checkTempToken) {
                res.status(403).json({ error: "The token is invalid or expired." });
                return;
            }
        }
        const { id } = req.params;
        const editData = req.body;
        const hashPassword = yield bcrypt_1.default.hash(editData.password, 12);
        const existingUser = yield user_model_1.default.findByIdAndUpdate({ _id: id }, { password: hashPassword }, {
            returnOriginal: false,
        });
        if (!existingUser) {
            res.status(409).send({ message: "User not found" });
            return;
        }
        res.status(201).send({
            message: "Password updated successfully",
        });
        return;
    }
    catch (error) {
        throw error;
    }
});
exports.updatePssUser = updatePssUser;
/* Logout user */
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { email } = req.body;
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        const existingUser = yield user_model_1.default.findOne({ email });
        if (!existingUser) {
            res.status(409).send({ message: "There is an issue with the user email" });
            return;
        }
        const existingRefreshToken = yield refreshToken_model_1.RefreshToken.findOneAndDelete({ user: existingUser._id });
        if (existingRefreshToken) {
            res.status(200).send({ message: "User logout successfully" });
            return;
        }
        else {
            res.status(403).send({ message: "Something went wrong" });
            return;
        }
    }
    catch (error) {
        throw error;
    }
});
exports.logoutUser = logoutUser;
//# sourceMappingURL=user.controller.js.map