import { NextFunction, Request, Response } from "express";
import User from "../model/user-model";
import { Message } from "../model/message-model";
import AppStats from "../model/appStats-model";
import { sendSESGoodbyeEmail } from "../services/sesServices";
import { validationResult } from "express-validator";

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed.", details: errors.array() });
      return;
    }

    const { _id: userId } = req.tokenVerified;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { email, firstName } = user;

    await Message.deleteMany({ recipients: userId });
    await User.findByIdAndDelete(userId);
    await AppStats.findOneAndUpdate(
      { key: "global" },
      { $inc: { deletedUserCount: 1 } },
      { upsert: true },
    );

    sendSESGoodbyeEmail(email, firstName || "there");

    res.status(200).json({ success: true });
    return;
  } catch (error) {
    next(error);
  }
};
