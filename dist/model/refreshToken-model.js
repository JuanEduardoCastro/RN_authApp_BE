"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempToken = exports.RefreshToken = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const refreshTokenSchema = new mongoose_1.default.Schema({
    rtokken: {
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
        expires: 864000, // 10 days
    },
}, { timestamps: true });
exports.RefreshToken = mongoose_1.default.model("RefreshToken", refreshTokenSchema);
const tempTokenSchema = new mongoose_1.default.Schema({
    ttokken: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: 180, // 3 minutes
    },
}, { timestamps: true });
exports.TempToken = mongoose_1.default.model("TempToken", tempTokenSchema);
//# sourceMappingURL=refreshToken-model.js.map