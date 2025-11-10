"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendGridResetPasswordValidation = exports.sendGridEmailValidation = void 0;
const config_1 = require("../config");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(config_1.config.SENDGRID_API_KEY);
/* -------------------------- */
const createGridEmail = (to, subject, token) => {
    let details = {
        title: "",
        bodyText: "",
        buttonText: "",
        buttonColor: "",
        extraText: "",
    };
    if (subject.includes("password")) {
        details = {
            title: "Reset Password!",
            bodyText: "We received a request to reset the password for your account. If you initiated this request, please click the button below to proceed.",
            buttonText: "Reset My Password",
            buttonColor: "e74c3c",
            extraText: "",
        };
    }
    else {
        details = {
            title: "Email Confirmation!",
            bodyText: "Thank you for signing up! To complete your registration and activate your new account, please click the button below to confirm your email address.",
            buttonText: "Confirm My Email",
            buttonColor: "7646c9",
            extraText: "This only takes a moment and will secure your access to all features.",
        };
    }
    return {
        from: config_1.config.SENDGRID_SENDER_EMAIL,
        to,
        replyTo: config_1.config.SENDGRID_SENDER_EMAIL,
        bcc: [config_1.config.SENDGRID_SENDER_EMAIL],
        subject,
        text: `Please, click this link to confirm your email: `,
        html: `
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${details.title}</title>
      <style type="text/css">
          body {
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              font-family: Arial, sans-serif;
          }
          table {
              border-collapse: collapse;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
          }
          td {
              padding: 0;
          }
          a {
              text-decoration: none;
          }
          /* Mobile styles (optional, but recommended) */
          @media only screen and (max-width: 600px) {
              .container {
                  width: 100% !important;
              }
              .content {
                  padding: 20px !important;
              }
          }
      </style>
    </head> 
    <body style="margin: 0; padding: 0; background-color: #f1f5f9;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 20px 0 30px 0;">
            <table border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="border-collapse: collapse; background-color: #f1f5f9; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <tr>
                  <td align="center" style="padding: 40px 0 20px 0; background-color: #7646c9;">
                      <h1 style="color: #f1f5f9; margin: 0; font-size: 24px;">Auth Sample App</h1>
                  </td>
              </tr>
              <tr>
                <td style="padding: 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #333333;" class="content">  
                  <p style="margin: 0 0 15px 0; font-weight: bold;">Hello,</p>                     
                  <p style="margin: 0 0 15px 0;">${details.bodyText}</p>
                  <table border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0; width: 100%;">
                    <tr>
                      <td align="center">
                        <a href="https://app.authdemoapp-jec.com/app/new-password/${token}" target="_blank" 
                        clicktracking=off
                          style="
                              background-color: #${details.buttonColor}; 
                              border: 1px solid #1B1B1E; 
                              color: #f1f5f9; 
                              padding: 12px 25px; 
                              display: inline-block; 
                              border-radius: 6px; 
                              font-size: 18px; 
                              font-weight: bold; 
                              text-decoration: none; 
                              text-align: center;
                              mso-padding-alt: 0; /* Outlook fix */
                          ">
                          ${details.buttonText}
                        </a>
                    </td>         
                    </tr>
                  </table>
                  <p style="margin: 0 0 15px 0;">${details.extraText}</p>                     
                  <p style="margin: 0;">If you did not initiate this request, please disregard this email.</p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 30px; background-color: #eeeeee; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #777777;">
                    <p style="margin: 0;">&copy; 2025 - Auth Sample App. All rights reserved.</p>
                    <p style="margin: 10px 0 0 0;">authorization.demo.app@gmail.com | <a href="mailto:authorization.demo.app@gmail.com" style="color: #777777; text-decoration: underline;">Unsubscribe</a></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    `,
        trackingSettings: {
            clickTracking: {
                enable: false,
                enableText: false,
            },
        },
    };
};
const sendGridMail = async (mailGridOptions) => {
    try {
        const info = await sgMail.send(mailGridOptions);
        console.log(console.log("Email sent: " + info));
    }
    catch (error) {
        console.error("Error sending email", error);
        throw error;
    }
};
const sendGridEmailValidation = async (token, email) => {
    const mailGridOptions = createGridEmail(email, "New account. Please, confirm your email!", token);
    await sendGridMail(mailGridOptions);
};
exports.sendGridEmailValidation = sendGridEmailValidation;
const sendGridResetPasswordValidation = async (token, email) => {
    const mailGridOptions = createGridEmail(email, "Reset password. Please, confirm your email!", token);
    await sendGridMail(mailGridOptions);
};
exports.sendGridResetPasswordValidation = sendGridResetPasswordValidation;
//# sourceMappingURL=gridServices.js.map