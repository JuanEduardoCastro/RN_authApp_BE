/* 

IMessage {
  sender:          ObjectId | null   // null = system/automated message
  recipients:      ObjectId[]        // User._id array
  title:           string            // max 100 chars
  body:            string            // max 1000 chars
  type:            'push' | 'in_app' | 'both'
  readBy:          ObjectId[]        // users who have opened the message
  isSystemMessage: boolean           // true for automated messages (welcome, etc.)
  createdAt:       Date              // auto via timestamps: true
  updatedAt:       Date
}
*/

import mongoose from "mongoose";
import { IMessage } from "../types/types";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      required: true,
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
    isSystemMessage: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

MessageSchema.index({ sender: 1 });
MessageSchema.index({ sender: 1, readBy: 1 });

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
