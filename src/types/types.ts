import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  email: string;
  password: string;
  lastName?: string | null | undefined;
  phoneNumber?: IPhoneNumber;
  occupation?: string | null | undefined;
  isGoogleLogin?: boolean;
  isGitHubLogin?: boolean;
  isAppleLogin?: boolean;
  avatarURL?: string | null;
  roles: [string];
  createdAt: any;
  updatedAt: any;
}

export interface IPhoneNumber {
  code: string | null;
  dialCode: string | null;
  number: string | null;
}

export interface IRefreshToken {
  rtokken: string;
  user: Types.ObjectId;
  createdAt: Date;
}

export interface ITempToken {
  ttokken: string;
  createdAt: Date;
}
