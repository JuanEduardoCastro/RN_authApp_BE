import "dotenv/config";

function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3005,
  MONGO_DB: getEnv("MONGO_DB"),
  RTOKEN_SECRET_KEY: getEnv("RTOKEN_SECRET_KEY"),
  GMAIL_TOKEN_SECRET_KEY: getEnv("GMAIL_TOKEN_SECRET_KEY"),
  ATOKEN_SECRET_KEY: getEnv("ATOKEN_SECRET_KEY"),
  GMAIL_USER: getEnv("GMAIL_USER"),
  SECRET_KEY_GMAIL: getEnv("SECRET_KEY_GMAIL"),
  BREVO_LOGIN: getEnv("BREVO_LOGIN"),
  BREVO_SECRET_KEY: getEnv("BREVO_SECRET_KEY"),
  // GMAIL_TOKEN_ISSUER: getEnv("GMAIL_TOKEN_ISSUER"),
  // RTOKEN_ISSUER: getEnv("RTOKEN_ISSUER"),
};
