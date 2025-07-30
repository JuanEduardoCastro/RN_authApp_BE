import mongoose from "mongoose";
import { IUser } from "../types/types";

const phoneNumberSchema = new mongoose.Schema({
  code: { type: String, default: "" },
  dialCode: { type: String, default: "" },
  number: { type: String, default: "" },
});

const userSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
