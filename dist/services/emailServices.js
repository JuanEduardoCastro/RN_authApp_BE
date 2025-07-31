"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordValidation = exports.sendEmailValidation = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailService = (mail) => {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.SECRET_KEY_GMAIL,
        },
    });
    transporter.sendMail(mail, (error, info) => {
        if (error) {
            console.log("Error sending email", error);
        }
        else {
            console.log("Email sent!");
        }
    });
};
const sendEmailValidation = (token, email) => {
    let mailValidation = {
        from: "Auth-Demo-App <authorization.demo.app@gmail.com>",
        to: email,
        bcc: "authorization.demo.app@gmail.com",
        subject: "New account. Plase, confirm your email!",
        text: "Plaintext version of the message",
        html: `<p>Plase, click in this link to confirm your email: <a target="_blanc" style="background-color:#199319;color:white;padding:12px;text-decoration:none;" href="authapp://app/new-password/${token}">Confirm email</a></p>`,
    };
    mailService(mailValidation);
};
exports.sendEmailValidation = sendEmailValidation;
const sendResetPasswordValidation = (token, email) => {
    let resetPasswordValidation = {
        from: "Auth-Demo-App <authorization.demo.app@gmail.com>",
        to: email,
        bcc: "authorization.demo.app@gmail.com",
        subject: "Reset password. Plase, confirm your email!",
        text: "Plaintext version of the message",
        html: `<p>Plase, click in this link to confirm your email: <a target="_blanc" style="background-color:#199319;color:white;padding:12px;text-decoration:none;" href="authapp://app/new-password/${token}">Confirm email</a></p>`,
    };
    mailService(resetPasswordValidation);
};
exports.sendResetPasswordValidation = sendResetPasswordValidation;
//# sourceMappingURL=emailServices.js.map