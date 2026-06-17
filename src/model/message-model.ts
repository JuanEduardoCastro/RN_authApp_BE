import mongoose from "mongoose";
import { IMessage } from "../types/types";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      required: false,
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    body: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["push", "in_app", "both"],
      required: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isSystemMessage: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

MessageSchema.index({ sender: 1 });
MessageSchema.index({ sender: 1, readBy: 1 });
MessageSchema.index({ recipients: 1, deletedBy: 1 });

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
