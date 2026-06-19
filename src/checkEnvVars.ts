const requiredEnvVars = [
  "SES_SMTP_HOST",
  "SES_SMTP_PORT",
  "SES_SMTP_USER",
  "SES_SMTP_PASS",
  "MONGO_DB",
  "ATOKEN_SECRET_KEY",
  "RTOKEN_SECRET_KEY",
  "GMAIL_TOKEN_SECRET_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_IOS_CLIENT_ID",
  "APPLE_BUNDLE_ID",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

export const checkEnvVars = () => {
  const missingVars = requiredEnvVars.filter((i) => !process.env[i]);

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: `);
    missingVars.forEach((i) => console.error(` -${i}`));
    console.error("\n Check .env for missing vars");
    process.exit(1);
  }
};
