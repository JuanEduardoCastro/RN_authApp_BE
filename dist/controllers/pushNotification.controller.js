"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.getFcmTokensByUser = exports.getAllFcmTokens = void 0;
const express_validator_1 = require("express-validator");
const deviceToken_model_1 = require("../model/deviceToken-model");
const firebaseServices_1 = require("../services/firebaseServices");
const logger_1 = require("../utils/logger");
const user_model_1 = __importDefault(require("../model/user-model"));
const getAllFcmTokens = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: "Validation failed.", details: errors.array() });
            return;
        }
        const { systemName, isActive } = req.query;
        const filter = {};
        if (systemName)
            filter.systemName = systemName;
        if (isActive !== undefined)
            filter.isActive = isActive === "true";
        const deviceTokens = await deviceToken_model_1.DeviceToken.find(filter).select("fcmToken deviceType deviceId systemName user");
        const tokens = deviceTokens.map((token) => ({
            fcmToken: token.fcmToken,
            deviceType: token.deviceType,
            deviceId: token.deviceId,
            systemName: token.systemName,
            user: token.user,
        }));
        res.status(200).json({
            data: { tokens },
            message: "Device tokens fetched successfully.",
            count: tokens.length,
        });
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.getAllFcmTokens = getAllFcmTokens;
const getFcmTokensByUser = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: "Validation failed.", details: errors.array() });
            return;
        }
        const { email } = req.query;
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const filter = {};
        if (user._id)
            filter.user = user._id;
        const deviceTokensByEmail = await deviceToken_model_1.DeviceToken.find(filter).select("fcmToken deviceType deviceId systemName");
        if (deviceTokensByEmail.length === 0) {
            res.status(404).json({ error: "User found but no active device tokens found" });
            return;
        }
        const tokenByUser = deviceTokensByEmail.map((token) => ({
            fcmToken: token.fcmToken,
            deviceType: token.deviceType,
            deviceId: token.deviceId,
            systemName: token.systemName,
            user: user,
        }));
        res.status(200).json({
            data: { tokenByUser },
            message: "Device token by user fetched successfully.",
            count: tokenByUser.length,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFcmTokensByUser = getFcmTokensByUser;
const sendNotification = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: "Validation failed.", details: errors.array() });
            return;
        }
        const { title, body, data, systemName, userIds } = req.body;
        const filter = { isActive: true };
        if (systemName)
            filter.systemName = systemName;
        if (userIds && Array.isArray(userIds))
            filter.user = { $in: userIds };
        const deviceTokens = await deviceToken_model_1.DeviceToken.find(filter).select("fcmToken");
        if (deviceTokens.length === 0) {
            res.status(404).json({ error: "No active device tokens found" });
            return;
        }
        const fcmTokens = deviceTokens.map((token) => token.fcmToken);
        const response = await (0, firebaseServices_1.sendPushNotification)(fcmTokens, title, body, data);
        if (response.failedTokens.length > 0) {
            await deviceToken_model_1.DeviceToken.updateMany({ fcmToken: { $in: response.failedTokens } }, { isActive: false });
            logger_1.logger.log(`Deactivated ${response.failedTokens.length} invalid tokens`);
        }
        res.status(200).json({
            message: "Notification sent successfully.",
            successCount: response.successCount,
            failureCount: response.failureCount,
            totalTokens: fcmTokens.length,
        });
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.sendNotification = sendNotification;
//# sourceMappingURL=pushNotification.controller.js.map