import bcrypt from "bcrypt";
import { Request, Response } from "express";
import User from "../model/user-model";
import { IUser } from "../types/types";
import { sendEmailValidation, sendResetPasswordValidation } from "../services/emailServices";
import {
  createEmailToken,
  createNewAccessToken,
  createRefreshToken,
} from "./refreshToken.controller";
import { RefreshToken, TempToken } from "../model/refreshToken-model";

/* Check if email exists */ /* OK!  */

export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email, isGoogleLogin } = req.body;

    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      res.status(204).send({ error: "This email already exists." });
      return;
    }

    const isNew = true;
    const emailToken = await createEmailToken(email, isNew);
    if (!isGoogleLogin) {
      sendEmailValidation(emailToken, email);
    }

    res.status(200).send({
      message: "This email is available to create a new user",
      emailToken: emailToken,
      // This data is for DEV not PRODUCTION
      data: `authapp://app/new-password/${emailToken}`,
    });
    return;
  } catch (error) {
    throw error;
  }
};

/* Create a new user */ /* OK!  */

export const createUser = async (req: Request, res: Response) => {
  try {
    const token = req.token;
    if (token) {
      const checkTempToken = await TempToken.findOneAndDelete({ ttokken: token });
      if (!checkTempToken) {
        res.status(403).json({ error: "The token is invalid or expired." });
        return;
      }
    }

    const {
      firstName,
      email,
      password,
      lastName,
      isGoogleLogin,
      isGitHubLogin,
      isAppleLogin,
      phoneNumber,
      occupation,
      avatarURL,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).send({ error: "User already exist." });
      return;
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email,
      password: hashPassword,
      firstName,
      lastName,
      isGoogleLogin,
      isGitHubLogin,
      isAppleLogin,
      phoneNumber,
      occupation,
      avatarURL,
    });

    if (user) {
      res.status(201).send({ message: "User created successfully" });
    }
    return;
  } catch (error) {
    throw error;
  }
};

/* Login a user with credentials */ /* OK!  */

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password }: IUser = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    const isPasswordVerify = await bcrypt.compare(password, existingUser.password);

    if (isPasswordVerify) {
      const accessToken = createNewAccessToken(
        existingUser._id,
        existingUser.isGoogleLogin,
        existingUser.isGitHubLogin,
        existingUser.isAppleLogin
      );
      const refreshToken = await createRefreshToken(existingUser);
      if (refreshToken) {
        res.status(200).send({
          refreshToken,
          accessToken,
          user: {
            firstName: existingUser.firstName,
            email: existingUser.email,
            lastName: existingUser.lastName,
            phoneNumber: existingUser.phoneNumber,
            occupation: existingUser.occupation,
            isGoogleLogin: existingUser.isGoogleLogin,
            isGitHubLogin: existingUser.isGitHubLogin,
            isAppleLogin: existingUser.isAppleLogin,
            avatarURL: existingUser.avatarURL,
            createdAt: existingUser.createdAt,
            updatedAt: existingUser.updatedAt,
          },
        });
        return;
      }
    } else {
      res.status(401).send({ message: "Wrong credentials" });
      return;
    }
  } catch (error) {
    throw error;
  }
};

/* Reset password */ /* OK!  */

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, isGoogleLogin } = req.body;

    const checkEmail = await User.findOne({ email });
    if (!checkEmail) {
      res.status(409).send({ error: "User doesn't exist." });
      return;
    }
    const id = checkEmail._id;
    const isNew = false;
    const emailToken = await createEmailToken(email, isNew, id);
    if (emailToken) {
      sendResetPasswordValidation(emailToken, email);
    }
    res.status(200).send({
      message: "User can reset password",
      // This data is for DEV not PRODUCTION
      data: `authapp://app/new-password/${emailToken}`,
    });
    return;
  } catch (error) {
    throw error;
  }
};

/* Update new password of a user by id */ /* OK!  */

export const updatePssUser = async (req: Request, res: Response) => {
  try {
    const token = req.tokenVerified;

    if (token) {
      const checkTempToken = await TempToken.findOneAndDelete({ ttokken: token });
      if (!checkTempToken) {
        res.status(403).json({ error: "The token is invalid or expired." });
        return;
      }
    }

    const { id } = req.params;
    const editData = req.body;

    const hashPassword = await bcrypt.hash(editData.password, 12);

    const existingUser = await User.findByIdAndUpdate(
      { _id: id },
      { password: hashPassword },
      {
        returnOriginal: false,
      }
    );
    if (!existingUser) {
      res.status(409).send({ message: "User not found" });
      return;
    }

    res.status(201).send({
      message: "Password updated successfully",
    });
    return;
  } catch (error) {
    console.log("XX -> user.controller.ts:232 -> editUser -> error :", error);
    throw error;
  }
};

/* Update profile of a user by id */ /* OK!  */

export const editUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const editData = req.body;
    const tokenDecoded = req.tokenVerified;
    // console.log("token decoded in edit user", tokenDecoded);

    const existingUser = await User.findByIdAndUpdate({ _id: id }, editData, {
      returnOriginal: false,
    });
    if (!existingUser) {
      res.status(409).send({ message: "User not found" });
      return;
    }

    if (existingUser) {
      const accessToken = createNewAccessToken(
        existingUser._id,
        existingUser.isGoogleLogin,
        existingUser.isGitHubLogin,
        existingUser.isAppleLogin
      );
      res.status(201).send({
        message: "User edited successfully",
        accessToken,
        user: {
          firstName: existingUser.firstName,
          email: existingUser.email,
          lastName: existingUser.lastName,
          phoneNumber: existingUser.phoneNumber,
          occupation: existingUser.occupation,
          isGoogleLogin: existingUser.isGoogleLogin,
          isGitHubLogin: existingUser.isGitHubLogin,
          isAppleLogin: existingUser.isAppleLogin,
          avatarURL: existingUser.avatarURL,
        },
      });
      return;
    }
  } catch (error) {
    throw error;
  }
};

/* Logout user */ /* OK!  */

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      res.status(409).send({ message: "There is an issue with the user email" });
      return;
    }

    const existingRefreshToken = await RefreshToken.findOneAndDelete({ rtokken: token });
    if (existingRefreshToken) {
      res.status(200).send({ message: "User logout successfully" });
      return;
    }
    return;
  } catch (error) {
    throw error;
  }
};

// /* Validate user token with middleware */ /* OK!  */

export const validateNewAccessToken = async (req: Request, res: Response) => {
  try {
    const token = req.token;
    const tokenVerified = JSON.parse(req.tokenVerified);

    // console.log("-----> ??", typeof tokenVerified, tokenVerified);

    const existingRefreshToken = await RefreshToken.findOne({ rtokken: token }).populate("user");
    if (!existingRefreshToken) {
      res.status(401).send({ message: "Token expires. User have to send credentials." });
      return;
    }
    const existingUser = await User.findOne({ _id: existingRefreshToken.user });
    if (!existingUser) {
      res.status(404).send({ message: "User not found" });
      return;
    } else {
      const accessToken = createNewAccessToken(
        existingUser._id,
        existingUser.isGoogleLogin,
        existingUser.isGitHubLogin,
        existingUser.isAppleLogin
      );
      if (accessToken) {
        res.status(200).send({
          accessToken,
          user: {
            firstName: existingUser.firstName,
            email: existingUser.email,
            lastName: existingUser.lastName,
            phoneNumber: existingUser.phoneNumber,
            occupation: existingUser.occupation,
            isGoogleLogin: existingUser.isGoogleLogin,
            isGitHubLogin: existingUser.isGitHubLogin,
            isAppleLogin: existingUser.isAppleLogin,
            avatarURL: existingUser.avatarURL,
            createdAt: existingUser.createdAt,
            updatedAt: existingUser.updatedAt,
          },
        });
        return;
      }
    }
  } catch (error) {
    throw error;
  }
};

/* 
RefreshToken -> email, id, y otras cosas
    -> no va a la app, va a "HTTP only coockie" (cannot acces by javascript) ? ? ver en el caso de react native
    -> expired date: 10 days


AccessToken -> toma la misma data o el refresh token 
    -> si va a la app
    -> expired date: 15 min ? 
    -> no guardar en local storage ? guardar en el state
    -> la app envia el AccessToken y el backend chekea con el refresh token si está OK dentro de su exp! y devuelve un access token nuevo

*/
