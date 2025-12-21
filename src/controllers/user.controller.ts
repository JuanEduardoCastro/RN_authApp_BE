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
import {
  sendGridEmailValidation,
  sendGridInvalidEmail,
  sendGridResetPasswordValidation,
} from "../services/gridServices";

const toUserResponse = (user: IUser) => ({
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

export const validateNewAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.token;

    const existingRefreshToken = await RefreshToken.findOne({ refreshToken: token }).populate<{
      user: IUser;
    }>("user");
    if (!existingRefreshToken) {
      res.status(401).json({ error: "Token expires. User have to send credentials." });
      return;
    }

    const existingUser = existingRefreshToken.user;

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
      res.status(400).json({ error: "Validation failed.", details: errors.array() });
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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed.", details: errors.array() });
      return;
    }
    const { id } = req.params;
    const { _id } = req.tokenVerified;

    if (id !== _id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed.", details: errors.array() });
      return;
    }

    const { email, provider } = req.body;
    const checkEmail = await User.findOne({ email: email });
    if (checkEmail !== null) {
      sendGridInvalidEmail(email);
      res.status(200).json({ message: "If this email is available, an email will be sent." });
      return;
    }
    const isNew = true;
    const emailToken = await createEmailToken(email, isNew);
    if (!provider) {
      sendGridEmailValidation(emailToken, email);
    }
    res.status(200).json({
      message: "If this email is available, an email will be sent.",
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

/* Create a new user */

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed.", details: errors.array() });
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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed.", details: errors.array() });
      return;
    }

    const { email } = req.body;

    const checkEmail = await User.findOne({ email });
    if (!checkEmail) {
      sendGridInvalidEmail(email);
      res.status(200).json({ message: "If this email is available, an email will be sent." });
      return;
    }
    const id = checkEmail._id;
    const isNew = false;
    const emailToken = await createEmailToken(email, isNew, id);
    if (emailToken) {
      sendGridResetPasswordValidation(emailToken, email);
    }
    res.status(200).json({
      message: "If this email is available, an email will be sent.",
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

export const updatePasswordUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Validation failed.", details: errors.array() });
      return;
    }

    const { _id } = req.tokenVerified;
    const token = req.token;
    const { id } = req.params;
    const editData = req.body;

    if (id !== _id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (token) {
      const checkTempToken = await TempToken.findOne({ tempToken: token });

      if (!checkTempToken) {
        res.status(403).json({ error: "The token is invalid or expired." });
        return;
      }
    }

    const hashPassword = editData.password ? await bcrypt.hash(editData.password, 12) : undefined;

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

    await RefreshToken.deleteMany({ user: id });
    if (token) {
      await TempToken.findOneAndDelete({ tempToken: token });
    }

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
    const { _id } = req.tokenVerified;

    const existingUser = await User.findOne({ _id: _id });

    if (!existingUser) {
      res.status(200).json({ message: "User logged out successfully" });
      return;
    }

    const existingRefreshToken = await RefreshToken.findOneAndDelete({ user: _id });

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
