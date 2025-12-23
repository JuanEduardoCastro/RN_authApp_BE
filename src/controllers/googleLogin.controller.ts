import { NextFunction, Request, Response } from "express";
import { IUser } from "../types/types";
import { OAuth2Client } from "google-auth-library";
import { extractToken } from "../middleware";
import User from "../model/user-model";
import { createNewAccessToken, createRefreshToken } from "./refreshToken.controller";
import { RefreshToken } from "../model/refreshToken-model";

const toGoogleUserResponse = (user: IUser) => ({
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

/* Validate user token with middleware */

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  try {
    const token = extractToken(req);

    const googleTicket = await googleClient.verifyIdToken({
      idToken: token as string,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const googleClientPayload = googleTicket.getPayload();

    if (!googleClientPayload?.email_verified) {
      res.status(401).json({ error: "Email must be verified." });
      return;
    }

    const googleUser = {
      email: googleClientPayload?.email,
      firstName: googleClientPayload?.given_name,
      lastName: googleClientPayload?.family_name,
      avatarURL: googleClientPayload?.picture,
    };

    const googleExistingUser = await User.findOne({ email: googleClientPayload.email });

    if (googleExistingUser === null) {
      const newGoogleUser = await User.create({
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        email: googleUser.email,
        avatarURL: googleUser.avatarURL,
        provider: "google",
      });

      if (newGoogleUser) {
        const accessToken = createNewAccessToken(
          newGoogleUser._id,
          newGoogleUser.provider!,
          newGoogleUser.roles!
        );
        const refreshToken = await createRefreshToken(newGoogleUser);

        res.status(200).json({
          message: "User created and logged in successfully",
          data: {
            refreshToken,
            accessToken,
            user: toGoogleUserResponse(newGoogleUser),
          },
        });
        return;
      }
    } else {
      if (googleExistingUser.provider !== "google") {
        res.status(400).json({ error: "This email is already linked with another provider" });
        return;
      }

      await RefreshToken.findOneAndDelete({ user: googleExistingUser._id });

      const updateGoogleUser = await User.findOneAndUpdate(
        { email: googleUser.email },
        {
          $set: {
            firstName: googleUser.firstName,
            lastName: googleUser.lastName,
            avatarURL: googleUser.avatarURL,
            provider: "google",
          },
          $unset: {
            password: 1,
          },
        },
        { returnDocument: "after" }
      );

      if (updateGoogleUser) {
        const accessToken = createNewAccessToken(
          updateGoogleUser._id,
          updateGoogleUser.provider!,
          updateGoogleUser.roles!
        );
        const refreshToken = await createRefreshToken(updateGoogleUser);

        res.status(200).json({
          message: "User updated successfully.",
          data: {
            accessToken,
            refreshToken,
            user: toGoogleUserResponse(updateGoogleUser),
          },
        });
        return;
      }
    }
  } catch (error) {
    next(error);
  }
};
