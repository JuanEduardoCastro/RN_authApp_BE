"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsersDevice = exports.deactivateDeviceToken = exports.updateDeviceToken = exports.setDevicetoken = void 0;
const deviceToken_model_1 = require("../model/deviceToken-model");
const express_validator_1 = require("express-validator");
const setDevicetoken = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: "Validation failed.", details: errors.array() });
            return;
        }
        const { fcmToken, deviceId, deviceName, osVersion, appVersion, deviceType, systemName } = req.body;
        const { _id } = req.tokenVerified;
        const deviceToken = await deviceToken_model_1.DeviceToken.findOneAndUpdate({ user: _id, deviceId }, {
            fcmToken,
            deviceId,
            deviceName,
            osVersion,
            appVersion,
            deviceType,
            systemName,
            isActive: true,
            lastUsed: Date.now(),
        }, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        });
        res.status(200).json({
            data: { deviceToken },
            message: "Device token registered successfully.",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.setDevicetoken = setDevicetoken;
const updateDeviceToken = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: "Validation failed.", details: errors.array() });
            return;
        }
        const { deviceId } = req.body;
        const { _id } = req.tokenVerified;
        const updatedDevice = await deviceToken_model_1.DeviceToken.findOneAndUpdate({
            user: _id,
            deviceId,
        }, { lastUsed: new Date() }, { new: true });
        if (!updatedDevice) {
            res.status(404).json({ error: "Device not found" });
            return;
        }
        res.status(200).json({
            message: "Device token updated successfully.",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDeviceToken = updateDeviceToken;
const deactivateDeviceToken = async (req, res, next) => {
    try {
        const { deviceId } = req.params;
        const { _id } = req.tokenVerified;
        const updatedDevice = await deviceToken_model_1.DeviceToken.findOneAndUpdate({
            user: _id,
            deviceId,
        }, { isActive: false }, { new: true });
        if (!updatedDevice) {
            res.status(204);
            return;
        }
        res.status(200).json({
            message: "Device token deactivated successfully.",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deactivateDeviceToken = deactivateDeviceToken;
const getAllUsersDevice = async (req, res, next) => {
    try {
        const { _id } = req.tokenVerified;
        const devices = await deviceToken_model_1.DeviceToken.find({ user: _id, isActive: true }).sort({ lastUsed: -1 });
        res.status(200).json({
            data: { devices },
            message: "Device tokens fetched successfully.",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsersDevice = getAllUsersDevice;
//# sourceMappingURL=deviceToken.controller.js.map