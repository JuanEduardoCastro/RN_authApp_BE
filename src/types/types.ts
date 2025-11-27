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
  createdAt: any;
  updatedAt: any;
}

export interface IProvider {
  enum: ["google", "github", "apple", null];
}
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
