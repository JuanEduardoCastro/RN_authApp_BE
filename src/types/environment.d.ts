declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    PORT: string;
    MONGO_DB: string;
    RTOKEN_SECRET_KEY: string;
    GMAIL_TOKEN_SECRET_KEY: string;
    ATOKEN_SECRET_KEY: string;
    SENDGRID_API_KEY: string;
    SENDGRID_SENDER_EMAIL: string;
  }
}
