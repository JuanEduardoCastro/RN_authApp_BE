"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubLogin = void 0;
const user_model_1 = __importDefault(require("../model/user-model"));
const refreshToken_model_1 = require("../model/refreshToken-model");
const refreshToken_controller_1 = require("./refreshToken.controller");
const toGithubUserResponse = (user) => ({
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
const githubLogin = async (req, res, next) => {
    try {
        const { githubUser } = req.body;
        console.log("XX -> githubLogin.controller.ts:26 -> githubLogin -> githubUser :", githubUser);
        if (!githubUser || !githubUser.email) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const existingUser = await user_model_1.default.findOne({ email: githubUser.email });
        if (existingUser === null) {
            const newGithubUser = await user_model_1.default.create({
                firstName: githubUser.firstName,
                lastName: githubUser.lastName,
                email: githubUser.email,
                avatarURL: githubUser.avatarURL,
                provider: "github",
            });
            if (newGithubUser) {
                const accessToken = (0, refreshToken_controller_1.createNewAccessToken)(newGithubUser._id, newGithubUser.provider);
                const refreshToken = await (0, refreshToken_controller_1.createRefreshToken)(newGithubUser);
                res.status(200).json({
                    message: "User created and logged in successfully",
                    data: {
                        refreshToken,
                        accessToken,
                        user: toGithubUserResponse(newGithubUser),
                    },
                });
                return;
            }
        }
        else {
            if (existingUser.provider !== null && existingUser.provider !== "github") {
                res.status(400).json({ error: "This email is already linked with another provider" });
                return;
            }
            await refreshToken_model_1.RefreshToken.findOneAndDelete({ user: existingUser._id });
            const updateGithubUser = await user_model_1.default.findOneAndUpdate({ email: githubUser.email }, {
                $set: {
                    firstName: githubUser.firstName,
                    lastName: githubUser.lastName,
                    avatarURL: githubUser.avatarURL,
                    provider: "github",
                },
                $unset: {
                    password: 1,
                },
            }, { returnDocument: "after" });
            if (updateGithubUser) {
                const accessToken = (0, refreshToken_controller_1.createNewAccessToken)(updateGithubUser._id, updateGithubUser.provider);
                const refreshToken = await (0, refreshToken_controller_1.createRefreshToken)(updateGithubUser);
                res.status(200).json({
                    message: "User updated successfully.",
                    data: {
                        accessToken,
                        refreshToken,
                        user: toGithubUserResponse(updateGithubUser),
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
exports.githubLogin = githubLogin;
//# sourceMappingURL=githubLogin.controller.js.map