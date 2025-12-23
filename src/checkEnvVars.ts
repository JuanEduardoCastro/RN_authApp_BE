const requiredEnvVars = [
  "MONGO_DB",
  "ATOKEN_SECRET_KEY",
  "RTOKEN_SECRET_KEY",
  "GMAIL_TOKEN_SECRET_KEY",
  "GOOGLE_CLIENT_ID",
  "SENDGRID_API_KEY",
  "SENDGRID_SENDER_EMAIL",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_CLIENT_EMAIL",
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
