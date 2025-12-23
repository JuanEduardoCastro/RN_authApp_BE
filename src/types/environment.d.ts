declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    PORT: string;
    MONGO_DB: string;
    RTOKEN_SECRET_KEY: string;
    GMAIL_TOKEN_SECRET_KEY: string;
    GOOGLE_CLIENT_ID: string;
    ATOKEN_SECRET_KEY: string;
    SENDGRID_API_KEY: string;
    SENDGRID_SENDER_EMAIL: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    FIREBASE_PROJECT_ID: string;
    FIREBASE_PRIVATE_KEY: string;
    FIREBASE_CLIENT_EMAIL: string;
  }
}
