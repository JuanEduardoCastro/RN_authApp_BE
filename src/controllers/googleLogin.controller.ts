import { NextFunction, Request, Response } from "express";
import { IUser } from "../types/types";
import { OAuth2Client } from "google-auth-library";
import { extractToken } from "../middleware";
import User from "../model/user-model";
import { createNewAccessToken, createRefreshToken } from "./refreshToken.controller";

const toGoogleUserResponse = (user: IUser) => ({
  id: user._id,
  firstName: user.firstName,
  email: user.email,
  lastName: user.lastName,
  phoneNumber: user.phoneNumber,
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

    if (token) {
      const googleTicket = await googleClient.verifyIdToken({
        idToken: token as string,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const googleClienPayload = googleTicket.getPayload();

      if (!googleClienPayload?.email_verified) {
        res.status(401).json({ error: "Email must be verifed." });
        return;
      }

      const googleUser = {
        email: googleClienPayload?.email,
        firstName: googleClienPayload?.given_name,
        lastName: googleClienPayload?.family_name,
        avatarURL: googleClienPayload?.picture,
      };

      const googleExistingUser = await User.findOne({ email: googleClienPayload.email });

      if (googleExistingUser === null) {
        const newGoogleUser = await User.create({
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          email: googleUser.email,
          avatarURL: googleUser.avatarURL,
          provider: "google",
        });

        if (newGoogleUser) {
          const accessToken = createNewAccessToken(newGoogleUser._id, newGoogleUser.provider!);
          const refreshToken = await createRefreshToken(newGoogleUser);

          res.status(200).json({
            message: "User created and login successfully",
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
          res.status(400).json({ error: "This email is alredy link with other provider" });
          return;
        } else if (googleExistingUser.provider === "google") {
          const updateGoogleUser = await User.findOneAndReplace(
            { email: googleUser.email },
            {
              firstName: googleUser.firstName,
              lastName: googleUser.lastName,
              email: googleUser.email,
              avatarURL: googleUser.avatarURL,
              provider: "google",
            },
            { returnDocument: "after" }
          );

          if (updateGoogleUser) {
            const accessToken = createNewAccessToken(
              updateGoogleUser._id,
              updateGoogleUser.provider!
            );
            const refreshToken = await createRefreshToken(updateGoogleUser);

            res.status(200).json({
              message: "User update successfully.",
              data: {
                accessToken,
                refreshToken,
                user: toGoogleUserResponse(updateGoogleUser),
              },
            });
            return;
          }
        }
      }
    }
    return;
  } catch (error) {
    next(error);
  }
};
