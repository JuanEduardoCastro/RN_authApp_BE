import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import User from "../model/user-model";
import { IUser } from "../types/types";
import {
  createEmailToken,
  createNewAccessToken,
  createRefreshToken,
} from "./refreshToken.controller";
import { RefreshToken, TempToken } from "../model/refreshToken-model";
import { sendGridEmailValidation, sendGridResetPasswordValidation } from "../services/gridServices";

const toUserResponse = (user: IUser) => ({
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

export const validateNewAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.token;

    const existingRefreshToken = await RefreshToken.findOne({ refreshToken: token }).populate(
      "user"
    );

    if (!existingRefreshToken) {
      res.status(401).json({ error: "Token expires. User have to send credentials." });
      return;
    }
    const existingUser = await User.findOne({ _id: existingRefreshToken.user });
    if (!existingUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const accessToken = createNewAccessToken(existingUser._id, existingUser.provider!);

    res.status(200).json({
      message: "Token is valid",
      data: {
        accessToken,
        user: toUserResponse(existingUser),
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

/* Login a user with credentials */

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "The is an error to login user.", details: errors.array() });
      return;
    }

    const { email, password }: IUser = req.body;
    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser || !existingUser.password) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    await RefreshToken.findOneAndDelete({ user: existingUser._id });

    const isPasswordVerify = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordVerify) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const accessToken = createNewAccessToken(existingUser._id, existingUser.provider!);
    const refreshToken = await createRefreshToken(existingUser);

    res.status(200).json({
      message: "User logged in successfully",
      data: {
        refreshToken,
        accessToken,
        user: toUserResponse(existingUser),
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

/* Edit profile of a user by id */

export const editUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, occupation, phoneNumber } = req.body;

    const allowedUpdates = { firstName, lastName, occupation, phoneNumber };

    const updatedUser = await User.findByIdAndUpdate({ _id: id }, allowedUpdates, {
      new: true,
    });
    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const accessToken = createNewAccessToken(updatedUser._id, updatedUser.provider!);
    res.status(200).json({
      message: "User edited successfully",
      data: {
        accessToken,
        user: toUserResponse(updatedUser),
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------ */

/* Check if email exists */

export const checkEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, provider } = req.body;
    const checkEmail = await User.findOne({ email: email });
    if (checkEmail !== null) {
      res.status(204).json({ message: "This email is already registered." });
      return;
    }
    const isNew = true;
    const emailToken = await createEmailToken(email, isNew);
    if (!provider) {
      sendGridEmailValidation(emailToken, email);
    }
    res.status(200).json({
      message: "This email is available to create a new user",
      data: {
        emailToken: emailToken,
        // This "data" is for DEV not PRODUCTION
        ...(process.env.NODE_ENV === "development" && {
          url: `authapp://app/new-password/${emailToken}`,
        }),
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

/* Check email with provider */

export const checkEmailWithProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, provider } = req.body;

    if (!provider) {
      res.status(409).json({ error: "There is no provider to check user with." });
      return;
    }

    const checkEmail = await User.findOne({ email: email });

    if (provider === "google") {
      if (checkEmail !== null) {
        const isNew = false;
        const emailToken = await createEmailToken(email, isNew);
        res.status(204).json({
          message: "Login user.",
          data: {
            emailToken: emailToken,
          },
        });
        return;
      } else {
        const isNew = true;
        const emailToken = await createEmailToken(email, isNew);
        res.status(200).json({
          message: "Create user.",
          data: {
            emailToken: emailToken,
          },
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

/* Create a new user */

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: "The is an error creating user.", details: errors.array() });
      return;
    }

    const token = req.token;
    if (token) {
      const checkTempToken = await TempToken.findOneAndDelete({ tempToken: token });
      if (!checkTempToken) {
        res.status(403).json({ error: "The token is invalid or expired." });
        return;
      }
    }

    const { firstName, email, password, lastName, provider, phoneNumber, occupation, avatarURL } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: "User already exists." });
      return;
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email,
      password: hashPassword,
      firstName,
      lastName,
      provider,
      phoneNumber,
      occupation,
      avatarURL,
    });

    if (user) {
      res.status(201).json({ message: "User created successfully" });
      return;
    }
  } catch (error) {
    next(error);
  }
};

/* Reset password */

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const checkEmail = await User.findOne({ email });
    if (!checkEmail) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    const id = checkEmail._id;
    const isNew = false;
    const emailToken = await createEmailToken(email, isNew, id);
    if (emailToken) {
      sendGridResetPasswordValidation(emailToken, email);
    }
    res.status(200).json({
      message: "User can reset password",
      data: {
        // This data is for DEV not PRODUCTION
        ...(process.env.NODE_ENV === "development" && {
          url: `authapp://app/new-password/${emailToken}`,
        }),
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

/* Update new password of a user by id */

export const updatePssUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "The is an error updating user.", details: errors.array() });
      return;
    }

    // const tokenVerified = req.tokenVerified;
    const token = req.token;

    if (token) {
      const checkTempToken = await TempToken.findOne({ tempToken: token });

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
        new: true,
      }
    );
    if (!existingUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await TempToken.findOneAndDelete({ tempToken: token });

    res.status(201).json({
      message: "Password updated successfully",
    });
    return;
  } catch (error) {
    next(error);
  }
};

/* Logout user */

export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body; // Or get user ID from a verified access token

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      res.status(200).json({ message: "User logged out successfully" });
      return;
    }

    const existingRefreshToken = await RefreshToken.findOneAndDelete({ user: existingUser._id });
    if (existingRefreshToken) {
      res.status(200).json({ message: "User logged out successfully" });
      return;
    } else {
      res.status(200).json({ message: "No active session found to log out" });
      return;
    }
  } catch (error) {
    next(error);
  }
};
