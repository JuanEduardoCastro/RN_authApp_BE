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
const toGoogleUserResponse = (user) => ({
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
const googleLogin = async (req, res, next) => {
    const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    try {
        const token = (0, middleware_1.extractToken)(req);
        if (token) {
            const googleTicket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const googleClienPayload = googleTicket.getPayload();
            if (!googleClienPayload?.email_verified) {
                res.status(401).json({ error: "Email must be verifed." });
                return;
            }
            const googleUser = {
                email: googleClienPayload?.email,
                firstName: googleClienPayload?.given_name,
                lastName: googleClienPayload?.family_name,
                avatarURL: googleClienPayload?.picture,
            };
            const googleExistingUser = await user_model_1.default.findOne({ email: googleClienPayload.email });
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
                        message: "User created and login successfully",
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
                    res.status(400).json({ error: "This email is alredy link with other provider" });
                    return;
                }
                else if (googleExistingUser.provider === "google") {
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
                            message: "User update successfully.",
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
        }
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.googleLogin = googleLogin;
//# sourceMappingURL=googleLogin.controller.js.map