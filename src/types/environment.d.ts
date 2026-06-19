declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    NODE_ENV: string;
    SES_SMTP_HOST: string;
    SES_SMTP_PORT: string;
    SES_SMTP_USER: string;
    SES_SMTP_PASS: string;
    SES_FROM_EMAIL: string;
    MONGO_DB: string;
    ATOKEN_SECRET_KEY: string;
    RTOKEN_SECRET_KEY: string;
    GMAIL_TOKEN_SECRET_KEY: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_IOS_CLIENT_ID: string;
    ATOKEN_SECRET_KEY: string;
    APPLE_BUNDLE_ID: string;
    FIREBASE_PROJECT_ID: string;
    FIREBASE_CLIENT_EMAIL: string;
    FIREBASE_PRIVATE_KEY: string;
  }
}
