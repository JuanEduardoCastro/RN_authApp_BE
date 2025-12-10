"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceToken = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const DeviceTokenSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    fcmToken: {
        type: String,
        required: true,
        unique: true,
    },
    deviceId: {
        type: String,
        required: true,
        index: true,
    },
    deviceType: {
        type: String,
        enum: ["android", "ios"],
        required: true,
    },
    deviceName: {
        type: String,
    },
    osVersion: {
        type: String,
    },
    appVersion: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastUsed: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
DeviceTokenSchema.index({ user: 1, deviceId: 1 }, { unique: true });
exports.DeviceToken = mongoose_1.default.model("DeviceToken", DeviceTokenSchema);
//# sourceMappingURL=deviceToken-model.js.map