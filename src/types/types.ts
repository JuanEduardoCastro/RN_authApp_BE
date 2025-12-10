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
  roles: [string];
  createdAt: Date;
  updatedAt: Date;
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
  deviceType: "android" | "ios";
  deviceName?: string;
  osVersion?: string;
  appVersion?: string;
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}
