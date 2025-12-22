import { NextFunction, Request, Response } from "express";
import { IUser } from "../types/types";
import User from "../model/user-model";
import { RefreshToken } from "../model/refreshToken-model";
import { createNewAccessToken, createRefreshToken } from "./refreshToken.controller";

const toGithubUserResponse = (user: IUser) => ({
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

export const githubLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { githubUser } = req.body;
    console.log("XX -> githubLogin.controller.ts:26 -> githubLogin -> githubUser :", githubUser);

    if (!githubUser || !githubUser.email) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const existingUser = await User.findOne({ email: githubUser.email });

    if (existingUser === null) {
      const newGithubUser = await User.create({
        firstName: githubUser.firstName,
        lastName: githubUser.lastName,
        email: githubUser.email,
        avatarURL: githubUser.avatarURL,
        provider: "github",
      });

      if (newGithubUser) {
        const accessToken = createNewAccessToken(newGithubUser._id, newGithubUser.provider!);
        const refreshToken = await createRefreshToken(newGithubUser);

        res.status(200).json({
          message: "User created and logged in successfully",
          data: {
            refreshToken,
            accessToken,
            user: toGithubUserResponse(newGithubUser),
          },
        });
        return;
      }
    } else {
      if (existingUser.provider !== null && existingUser.provider !== "github") {
        res.status(400).json({ error: "This email is already linked with another provider" });
        return;
      }

      await RefreshToken.findOneAndDelete({ user: existingUser._id });

      const updateGithubUser = await User.findOneAndUpdate(
        { email: githubUser.email },
        {
          $set: {
            firstName: githubUser.firstName,
            lastName: githubUser.lastName,
            avatarURL: githubUser.avatarURL,
            provider: "github",
          },
          $unset: {
            password: 1,
          },
        },
        { returnDocument: "after" }
      );

      if (updateGithubUser) {
        const accessToken = createNewAccessToken(updateGithubUser._id, updateGithubUser.provider!);
        const refreshToken = await createRefreshToken(updateGithubUser);

        res.status(200).json({
          message: "User updated successfully.",
          data: {
            accessToken,
            refreshToken,
            user: toGithubUserResponse(updateGithubUser),
          },
        });
        return;
      }
    }
  } catch (error) {
    next(error);
  }
};
