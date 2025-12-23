import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  email: string;
  password: string;
  lastName?: string | null | undefined;
  phoneNumber?: IPhoneNumber;
  occupation?: string | null | undefined;
  provider?: IProvider;
  avatarURL?: string | null;
  roles: "user" | "admin" | "superadmin";
  createdAt: Date;
  updatedAt: Date;
}

export interface IGithubUser {
  email: string;
  firstName: string;
  lastName: string;
  avatarURL: string | null;
}

export type IProvider = "google" | "github" | "apple" | null;

export interface IPhoneNumber {
  code: string | null;
  dialCode: string | null;
  number: string | null;
}

export interface IRefreshToken {
  refreshToken: string;
  user: Types.ObjectId;
  createdAt: Date;
}

export interface ITempToken {
  tempToken: string;
  createdAt: Date;
}

export interface IDeviceToken {
  user: Types.ObjectId;
  fcmToken: string;
  deviceId: string;
  deviceType: string;
  deviceName?: string;
  osVersion?: string;
  appVersion?: string;
  systemName: "Android" | "iOS";
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessTokenPayload extends JwtPayload {
  _id: string | Types.ObjectId;
  provider: IProvider;
  roles: "user" | "admin" | "superadmin";
}

export interface RefreshTokenPayload extends JwtPayload {
  _token: string;
}

export interface EmailTokenPayload extends JwtPayload {
  email: string;
  isNew: boolean;
  _id?: string | Types.ObjectId;
}
