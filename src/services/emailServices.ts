import nodemailer from "nodemailer";

const mailService = (mail: any) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.SECRET_KEY_GMAIL,
    },
  });

  transporter.sendMail(mail, (error, info) => {
    if (error) {
      console.log("Error sending email", error);
    } else {
      console.log("Email sent!");
    }
  });
};

export const sendEmailValidation = (token: string, email: string) => {
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

export const sendResetPasswordValidation = (token: string, email: string) => {
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
