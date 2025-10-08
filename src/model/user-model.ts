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
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "is invalid"],
    },
    password: {
      type: String,
      required: function (this: IUser) {
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
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
