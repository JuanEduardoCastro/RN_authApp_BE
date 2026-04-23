import { NextFunction, Request, Response } from "express";
import { IUser } from "../types/types";
import User from "../model/user-model";
import { createNewAccessToken, createRefreshToken } from "./refreshToken.controller";
import { RefreshToken } from "../model/refreshToken-model";

const toAppleUserResponse = (user: IUser) => ({
  id: user._id,
  firstName: user.firstName,
  email: user.email,
  lastName: user.lastName,
  phoneNumber: {
    code: user.phoneNumber!.code,
    dialCode: user.phoneNumber!.dialCode,
    number: user.phoneNumber!.number,
  },
  occupation: user.occupation,
  provider: user.provider,
  avatarURL: user.avatarURL,
  roles: user.roles,
});

export const appleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { appleUser } = req.body;

    if (!appleUser || !appleUser.email) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const existingUser = await User.findOne({ email: appleUser.email });

    if (existingUser === null) {
      const newAppleUser = await User.create({
        firstName: appleUser.firstName,
        lastName: appleUser.lastName,
        email: appleUser.email,
        provider: "apple",
      });

      if (newAppleUser) {
        const accessToken = createNewAccessToken(
          newAppleUser._id,
          newAppleUser.provider!,
          newAppleUser.roles!,
        );

        const refreshToken = await createRefreshToken(newAppleUser);

        res.status(200).json({
          message: "User created and logged in successfully",
          data: {
            refreshToken,
            accessToken,
            user: toAppleUserResponse(newAppleUser),
          },
        });
        return;
      }
    } else {
      if (existingUser.provider !== "apple") {
        res.status(400).json({ error: "This email is already linked with another provider" });
        return;
      }

      await RefreshToken.deleteMany({ user: existingUser._id });

      const updatedAppleUser = await User.findOneAndUpdate(
        { email: appleUser.email },
        {
          firstName: appleUser.firstName || existingUser.firstName,
          lastName: appleUser.lastName || existingUser.lastName,
          provider: "apple",
        },
        { returnDocument: "after" },
      );

      if (updatedAppleUser) {
        const accessToken = createNewAccessToken(
          updatedAppleUser._id,
          updatedAppleUser.provider!,
          updatedAppleUser.roles!,
        );

        const refreshToken = await createRefreshToken(updatedAppleUser);

        res.status(200).json({
          message: "User updated successfully.",
          data: {
            accessToken,
            refreshToken,
            user: toAppleUserResponse(updatedAppleUser),
          },
        });
        return;
      }
    }
  } catch (error) {
    next(error);
  }
};
