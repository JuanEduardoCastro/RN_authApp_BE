"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = void 0;
const google_auth_library_1 = require("google-auth-library");
const middleware_1 = require("../middleware");
const user_model_1 = __importDefault(require("../model/user-model"));
const refreshToken_controller_1 = require("./refreshToken.controller");
const refreshToken_model_1 = require("../model/refreshToken-model");
const toGoogleUserResponse = (user) => ({
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
});
/* Validate user token with middleware */
const googleLogin = async (req, res, next) => {
    const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    try {
        const token = (0, middleware_1.extractToken)(req);
        const googleTicket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const googleClientPayload = googleTicket.getPayload();
        if (!googleClientPayload?.email_verified) {
            res.status(401).json({ error: "Email must be verified." });
            return;
        }
        const googleUser = {
            email: googleClientPayload?.email,
            firstName: googleClientPayload?.given_name,
            lastName: googleClientPayload?.family_name,
            avatarURL: googleClientPayload?.picture,
        };
        const googleExistingUser = await user_model_1.default.findOne({ email: googleClientPayload.email });
        if (googleExistingUser === null) {
            const newGoogleUser = await user_model_1.default.create({
                firstName: googleUser.firstName,
                lastName: googleUser.lastName,
                email: googleUser.email,
                avatarURL: googleUser.avatarURL,
                provider: "google",
            });
            if (newGoogleUser) {
                const accessToken = (0, refreshToken_controller_1.createNewAccessToken)(newGoogleUser._id, newGoogleUser.provider);
                const refreshToken = await (0, refreshToken_controller_1.createRefreshToken)(newGoogleUser);
                res.status(200).json({
                    message: "User created and logged in successfully",
                    data: {
                        refreshToken,
                        accessToken,
                        user: toGoogleUserResponse(newGoogleUser),
                    },
                });
                return;
            }
        }
        else {
            if (googleExistingUser.provider !== "google") {
                res.status(400).json({ error: "This email is already linked with another provider" });
                return;
            }
            await refreshToken_model_1.RefreshToken.findOneAndDelete({ user: googleExistingUser._id });
            const updateGoogleUser = await user_model_1.default.findOneAndUpdate({ email: googleUser.email }, {
                $set: {
                    firstName: googleUser.firstName,
                    lastName: googleUser.lastName,
                    avatarURL: googleUser.avatarURL,
                    provider: "google",
                },
                $unset: {
                    password: 1,
                },
            }, { returnDocument: "after" });
            if (updateGoogleUser) {
                const accessToken = (0, refreshToken_controller_1.createNewAccessToken)(updateGoogleUser._id, updateGoogleUser.provider);
                const refreshToken = await (0, refreshToken_controller_1.createRefreshToken)(updateGoogleUser);
                res.status(200).json({
                    message: "User updated successfully.",
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
    catch (error) {
        next(error);
    }
};
exports.googleLogin = googleLogin;
//# sourceMappingURL=googleLogin.controller.js.map