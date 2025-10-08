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
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, "is invalid"],
    },
    password: {
        type: String,
        required: function () {
            return !this.provider;
        },
        trim: true,
        select: false,
    },
    lastName: {
        type: String,
        default: "",
    },
    provider: {
        type: String,
        enum: ["google", "github", "apple", null],
        default: null,
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
        default: null,
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