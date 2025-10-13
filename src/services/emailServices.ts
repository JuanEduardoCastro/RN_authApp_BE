import nodemailer from "nodemailer";
import { config } from "../config";

type MailOptions = {
  from: string;
  to: string;
  bcc: string;
  subject: string;
  text: string;
  html: string;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.GMAIL_USER,
    pass: config.SECRET_KEY_GMAIL,
  },
});

const sendMail = async (mailOptions: MailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email", error);
    throw error;
  }
};

const createAuthEmail = (to: string, subject: string, token: string): MailOptions => {
  return {
    from: "Auth-Demo-App <authorization.demo.app@gmail.com>",
    to,
    bcc: "authorization.demo.app@gmail.com",
    subject,
    text: "Plaintext version of the message", // update this
    html: `<p>Please, click this link to confirm your email: <a target="_blank" style="background-color:#199319;color:white;padding:12px;margin:0px10px;text-decoration:none;" href="authapp://app/new-password/${token}">Confirm email</a></p>`,
  };
};

export const sendEmailValidation = async (token: string, email: string) => {
  const mailOptions = createAuthEmail(email, "New account. Please, confirm your email!", token);
  await sendMail(mailOptions);
};

export const sendResetPasswordValidation = async (token: string, email: string) => {
  const mailOptions = createAuthEmail(email, "Reset password. Please, confirm your email!", token);
  await sendMail(mailOptions);
};
