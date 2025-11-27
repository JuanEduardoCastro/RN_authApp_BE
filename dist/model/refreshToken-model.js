"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempToken = exports.RefreshToken = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tokens_1 = require("../constants/tokens");
const refreshTokenSchema = new mongoose_1.default.Schema({
    refreshToken: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: tokens_1.EXPIRY.REFRESH_TOKEN,
    },
}, { timestamps: true });
exports.RefreshToken = mongoose_1.default.model("RefreshToken", refreshTokenSchema);
const tempTokenSchema = new mongoose_1.default.Schema({
    tempToken: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: tokens_1.EXPIRY.TEMP_TOKEN,
    },
}, { timestamps: true });
exports.TempToken = mongoose_1.default.model("TempToken", tempTokenSchema);
refreshTokenSchema.index({ refresToken: 1 });
refreshTokenSchema.index({ user: 1 });
tempTokenSchema.index({ tempToken: 1 });
//# sourceMappingURL=refreshToken-model.js.map