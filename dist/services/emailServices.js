"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordValidation = exports.sendEmailValidation = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: config_1.config.GMAIL_USER,
        pass: config_1.config.SECRET_KEY_GMAIL,
    },
});
const sendMail = async (mailOptions) => {
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
        return info;
    }
    catch (error) {
        console.error("Error sending email", error);
        throw error;
    }
};
const createAuthEmail = (to, subject, token) => {
    return {
        from: "Auth-Demo-App <authorization.demo.app@gmail.com>",
        to,
        bcc: "authorization.demo.app@gmail.com",
        subject,
        text: "Plaintext version of the message", // update this
        html: `<p>Please, click this link to confirm your email: <a target="_blank" style="background-color:#199319;color:white;padding:12px;margin:0px10px;text-decoration:none;" href="authapp://app/new-password/${token}">Confirm email</a></p>`,
    };
};
const sendEmailValidation = async (token, email) => {
    const mailOptions = createAuthEmail(email, "New account. Please, confirm your email!", token);
    await sendMail(mailOptions);
};
exports.sendEmailValidation = sendEmailValidation;
const sendResetPasswordValidation = async (token, email) => {
    const mailOptions = createAuthEmail(email, "Reset password. Please, confirm your email!", token);
    await sendMail(mailOptions);
};
exports.sendResetPasswordValidation = sendResetPasswordValidation;
//# sourceMappingURL=emailServices.js.map