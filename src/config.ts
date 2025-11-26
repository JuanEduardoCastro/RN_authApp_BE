function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8080,
  MONGO_DB: getEnv("MONGO_DB"),
  RTOKEN_SECRET_KEY: getEnv("RTOKEN_SECRET_KEY"),
  GMAIL_TOKEN_SECRET_KEY: getEnv("GMAIL_TOKEN_SECRET_KEY"),
  ATOKEN_SECRET_KEY: getEnv("ATOKEN_SECRET_KEY"),
  SENDGRID_API_KEY: getEnv("SENDGRID_API_KEY"),
  SENDGRID_SENDER_EMAIL: getEnv("SENDGRID_SENDER_EMAIL"),
};
