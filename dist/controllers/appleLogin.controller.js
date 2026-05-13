"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appleLogin = void 0;
const user_model_1 = __importDefault(require("../model/user-model"));
const refreshToken_controller_1 = require("./refreshToken.controller");
const refreshToken_model_1 = require("../model/refreshToken-model");
const toAppleUserResponse = (user) => ({
    id: user._id,
    firstName: user.firstName,
    email: user.email,
    lastName: user.lastName,
    phoneNumber: {
        code: user.phoneNumber.code,
        dialCode: user.phoneNumber.dialCode,
        number: user.phoneNumber.number,
    },
    occupation: user.occupation,
    provider: user.provider,
    avatarURL: user.avatarURL,
    roles: user.roles,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
const appleLogin = async (req, res, next) => {
    try {
        const { appleUser } = req.body;
        if (!appleUser || !appleUser.email) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const existingUser = await user_model_1.default.findOne({ email: appleUser.email });
        if (existingUser === null) {
            const newAppleUser = await user_model_1.default.create({
                firstName: appleUser.firstName,
                lastName: appleUser.lastName,
                email: appleUser.email,
                provider: "apple",
            });
            if (newAppleUser) {
                const accessToken = (0, refreshToken_controller_1.createNewAccessToken)(newAppleUser._id, newAppleUser.provider, newAppleUser.roles);
                const refreshToken = await (0, refreshToken_controller_1.createRefreshToken)(newAppleUser);
                res.status(200).json({
                    message: "User created and logged in successfully",
                    data: {
                        refreshToken,
                        accessToken,
                        user: toAppleUserResponse(newAppleUser),
                    },
                });
                return;
            }
        }
        else {
            if (existingUser.provider !== "apple") {
                res.status(400).json({ error: "This email is already linked with another provider" });
                return;
            }
            await refreshToken_model_1.RefreshToken.deleteMany({ user: existingUser._id });
            const updatedAppleUser = await user_model_1.default.findOneAndUpdate({ email: appleUser.email }, {
                firstName: appleUser.firstName || existingUser.firstName,
                lastName: appleUser.lastName || existingUser.lastName,
                provider: "apple",
            }, { returnDocument: "after" });
            if (updatedAppleUser) {
                const accessToken = (0, refreshToken_controller_1.createNewAccessToken)(updatedAppleUser._id, updatedAppleUser.provider, updatedAppleUser.roles);
                const refreshToken = await (0, refreshToken_controller_1.createRefreshToken)(updatedAppleUser);
                res.status(200).json({
                    message: "User updated successfully.",
                    data: {
                        accessToken,
                        refreshToken,
                        user: toAppleUserResponse(updatedAppleUser),
                    },
                });
                return;
            }
        }
    }
    catch (error) {
        next(error);
    }
};
exports.appleLogin = appleLogin;
//# sourceMappingURL=appleLogin.controller.js.map