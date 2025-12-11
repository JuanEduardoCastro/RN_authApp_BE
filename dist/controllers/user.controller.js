"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.updatePasswordUser = exports.resetPassword = exports.createUser = exports.checkEmail = exports.editUser = exports.loginUser = exports.validateNewAccessToken = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_validator_1 = require("express-validator");
const user_model_1 = __importDefault(require("../model/user-model"));
const refreshToken_controller_1 = require("./refreshToken.controller");
const refreshToken_model_1 = require("../model/refreshToken-model");
const gridServices_1 = require("../services/gridServices");
const toUserResponse = (user) => ({
    id: user._id,
    firstName: user.firstName,
    email: user.email,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    occupation: user.occupation,
    provider: user.provider,
    avatarURL: user.avatarURL,
    roles: user.roles,
});
/* Validate user token with middleware */
const validateNewAccessToken = async (req, res, next) => {
    try {
        const token = req.token;
        const existingRefreshToken = await refreshToken_model_1.RefreshToken.findOne({ refreshToken: token }).populate("user");
        if (!existingRefreshToken) {
            res.status(401).json({ error: "Token expires. User have to send credentials." });
            return;
        }
        const existingUser = existingRefreshToken.user;
        if (!existingUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const accessToken = (0, refreshToken_controller_1.createNewAccessToken)(existingUser._id, existingUser.provider);
        res.status(200).json({
            message: "Token is valid",
            data: {
                accessToken,
                user: toUserResponse(existingUser),
            },
        });
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.validateNewAccessToken = validateNewAccessToken;
/* Login a user with credentials */
const loginUser = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: "Validation failed.", details: errors.array() });
            return;
        }
        const { email, password } = req.body;
        const existingUser = await user_model_1.default.findOne({ email }).select("+password");
        if (!existingUser || !existingUser.password) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        await refreshToken_model_1.RefreshToken.findOneAndDelete({ user: existingUser._id });
        const isPasswordVerify = await bcrypt_1.default.compare(password, existingUser.password);
        if (!isPasswordVerify) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const accessToken = (0, refreshToken_controller_1.createNewAccessToken)(existingUser._id, existingUser.provider);
        const refreshToken = await (0, refreshToken_controller_1.createRefreshToken)(existingUser);
        res.status(200).json({
            message: "User logged in successfully",
            data: {
                refreshToken,
                accessToken,
                user: toUserResponse(existingUser),
            },
        });
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.loginUser = loginUser;
/* Edit profile of a user by id */
const editUser = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: "Validation failed.", details: errors.array() });
            return;
        }
        const { id } = req.params;
        const { _id } = req.tokenVerified;
        if (id !== _id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { firstName, lastName, occupation, phoneNumber } = req.body;
        const allowedUpdates = { firstName, lastName, occupation, phoneNumber };
        const updatedUser = await user_model_1.default.findByIdAndUpdate({ _id: id }, allowedUpdates, {
            new: true,
        });
        if (!updatedUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const accessToken = (0, refreshToken_controller_1.createNewAccessToken)(updatedUser._id, updatedUser.provider);
        res.status(200).json({
            message: "User edited successfully",
            data: {
                accessToken,
                user: toUserResponse(updatedUser),
            },
        });
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.editUser = editUser;
/* ------------------------------------ */
/* Check if email exists */
const checkEmail = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: "Validation failed.", details: errors.array() });
            return;
        }
        const { email, provider } = req.body;
        const checkEmail = await user_model_1.default.findOne({ email: email });
        if (checkEmail !== null) {
            (0, gridServices_1.sendGridInvalidEmail)(email);
            res.status(200).json({ message: "If this email is available, an email will be sent." });
            return;
        }
        const isNew = true;
        const emailToken = await (0, refreshToken_controller_1.createEmailToken)(email, isNew);
        if (!provider) {
            (0, gridServices_1.sendGridEmailValidation)(emailToken, email);
        }
        res.status(200).json({
            message: "If this email is available, an email will be sent.",
            data: {
                emailToken: emailToken,
                // This "data" is for DEV not PRODUCTION
                ...(process.env.NODE_ENV === "development" && {
                    url: `authapp://app/new-password/${emailToken}`,
                }),
            },
        });
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.checkEmail = checkEmail;
/* Create a new user */
const createUser = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: "Validation failed.", details: errors.array() });
            return;
        }
        const token = req.token;
        if (token) {
            const checkTempToken = await refreshToken_model_1.TempToken.findOneAndDelete({ tempToken: token });
            if (!checkTempToken) {
                res.status(403).json({ error: "The token is invalid or expired." });
                return;
            }
        }
        const { firstName, email, password, lastName, provider, phoneNumber, occupation, avatarURL } = req.body;
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(409).json({ error: "User already exists." });
            return;
        }
        const hashPassword = await bcrypt_1.default.hash(password, 12);
        const user = await user_model_1.default.create({
            email: email,
            password: hashPassword,
            firstName,
            lastName,
            provider,
            phoneNumber,
            occupation,
            avatarURL,
        });
        if (user) {
            res.status(201).json({ message: "User created successfully" });
            return;
        }
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
/* Reset password */
const resetPassword = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: "Validation failed.", details: errors.array() });
            return;
        }
        const { email } = req.body;
        const checkEmail = await user_model_1.default.findOne({ email });
        if (!checkEmail) {
            (0, gridServices_1.sendGridInvalidEmail)(email);
            res.status(200).json({ message: "If this email is available, an email will be sent." });
            return;
        }
        const id = checkEmail._id;
        const isNew = false;
        const emailToken = await (0, refreshToken_controller_1.createEmailToken)(email, isNew, id);
        if (emailToken) {
            (0, gridServices_1.sendGridResetPasswordValidation)(emailToken, email);
        }
        res.status(200).json({
            message: "If this email is available, an email will be sent.",
            data: {
                // This data is for DEV not PRODUCTION
                ...(process.env.NODE_ENV === "development" && {
                    url: `authapp://app/new-password/${emailToken}`,
                }),
            },
        });
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
/* Update new password of a user by id */
const updatePasswordUser = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: "Validation failed.", details: errors.array() });
            return;
        }
        const { _id } = req.tokenVerified;
        const token = req.token;
        const { id } = req.params;
        const editData = req.body;
        if (id !== _id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (token) {
            const checkTempToken = await refreshToken_model_1.TempToken.findOne({ tempToken: token });
            if (!checkTempToken) {
                res.status(403).json({ error: "The token is invalid or expired." });
                return;
            }
        }
        const hashPassword = editData.password ? await bcrypt_1.default.hash(editData.password, 12) : undefined;
        const existingUser = await user_model_1.default.findByIdAndUpdate({ _id: id }, { password: hashPassword }, {
            new: true,
        });
        if (!existingUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        await refreshToken_model_1.RefreshToken.deleteMany({ user: id });
        if (token) {
            await refreshToken_model_1.TempToken.findOneAndDelete({ tempToken: token });
        }
        res.status(201).json({
            message: "Password updated successfully",
        });
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.updatePasswordUser = updatePasswordUser;
/* Logout user */
const logoutUser = async (req, res, next) => {
    try {
        const { _id } = req.tokenVerified;
        const existingUser = await user_model_1.default.findOne({ _id: _id });
        if (!existingUser) {
            res.status(200).json({ message: "User logged out successfully" });
            return;
        }
        const existingRefreshToken = await refreshToken_model_1.RefreshToken.findOneAndDelete({ user: _id });
        if (existingRefreshToken) {
            res.status(200).json({ message: "User logged out successfully" });
            return;
        }
        else {
            res.status(200).json({ message: "No active session found to log out" });
            return;
        }
    }
    catch (error) {
        next(error);
    }
};
exports.logoutUser = logoutUser;
//# sourceMappingURL=user.controller.js.map