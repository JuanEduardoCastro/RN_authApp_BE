"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const phoneNumberSchema = new mongoose_1.default.Schema({
    code: { type: String, default: "" },
    dialCode: { type: String, default: "" },
    number: { type: String, default: "" },
});
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        require: true,
        trim: true,
    },
    isGoogleLogin: {
        type: Boolean,
        default: false,
    },
    isGitHubLogin: {
        type: Boolean,
        default: false,
    },
    isAppleLogin: {
        type: Boolean,
        default: false,
    },
    lastName: {
        type: String,
        default: "",
    },
    phoneNumber: {
        type: phoneNumberSchema,
        default: () => ({}),
    },
    occupation: {
        type: String,
        default: "",
    },
    avatarURL: {
        type: String,
        default: undefined,
    },
    roles: {
        type: [String],
        enum: ["user", "admin", "superadmin"],
        default: ["user"],
    },
}, { timestamps: true });
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
//# sourceMappingURL=user-model.js.map