# Auth App — Backend

> REST API powering the Auth App mobile application.

A Node.js + TypeScript REST API built with Express 5, handling JWT authentication, OAuth token exchange (Google, GitHub, Apple), user management, transactional email, and Firebase Cloud Messaging push notifications.

---

## Frontend

This API is consumed by the **Auth App** React Native mobile app.

- **Repo:** [RN_authApp](https://github.com/JuanEduardoCastro/RN_authApp)
- **Stack:** React Native 0.82 · TypeScript · Redux Toolkit · Firebase · react-native-keychain
- **Features:** Google / GitHub / Apple Sign-In, biometric login (Face ID / Touch ID), JWT silent refresh, deep linking, multi-theme UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript 5.8 (strict mode) |
| Framework | Express 5 |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT (jsonwebtoken) · bcrypt |
| OAuth | google-auth-library · apple-signin-auth · axios (GitHub PKCE) |
| Email | SendGrid |
| Push notifications | Firebase Admin SDK (FCM) |
| Security | Helmet · express-rate-limit · express-validator · HTTPS enforcement |
| Deployment | AWS EC2 (us-east-1) · Nginx · PM2 · Let's Encrypt SSL |

---

## API Endpoints

Base URL: `https://api.authdemoapp-jec.com`

### Authentication — `/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/users/login` | — | Email + password login |
| `POST` | `/users/logout` | Access token | Delete refresh token |
| `POST` | `/users/token/refresh` | Refresh token | Issue new access token |
| `POST` | `/users/google-login` | Google ID token | Google OAuth login / register |
| `POST` | `/users/github-login` | GitHub code | GitHub PKCE login / register |
| `POST` | `/users/apple-login` | Apple identity token | Apple Sign-In login / register |

### User Management — `/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/users/check-email` | — | Check availability + send verification email |
| `POST` | `/users/create` | Email token | Create new account |
| `POST` | `/users/reset-password` | — | Send password reset email |
| `PUT` | `/users/:id/password` | Email token | Update password |
| `PATCH` | `/users/:id` | Access token | Edit profile (name, occupation, phone) |
| `PATCH` | `/users/management/:id` | Role token | Update user role (admin only) |

### FCM Device Tokens — `/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/users/device-token` | Access token | Register FCM device token |
| `PATCH` | `/users/device-token/last-used` | Access token | Update last-used timestamp |
| `DELETE` | `/users/device-token/:deviceId` | Access token | Deactivate device token |
| `GET` | `/users/devices` | Access token | List user's registered devices |

### Push Notifications — `/notifications` (admin only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/notifications/fcm-tokens` | List all FCM tokens (filterable by platform) |
| `GET` | `/notifications/fcm-token-user` | Get tokens by user email |
| `POST` | `/notifications/send` | Send push notification |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health + version |

---

## Architecture

### Token flow

```
Login / OAuth
  └─ Issues: accessToken (short-lived) + refreshToken (long-lived, stored in DB)

Request cycle
  └─ Client sends accessToken in Authorization header
       ├─ Valid   → proceed
       └─ Expired → POST /users/token/refresh with refreshToken
                       ├─ Valid   → new accessToken issued, old refreshToken rotated
                       └─ Invalid → 401, client logs out
```

### OAuth flow (all three providers)

All three OAuth strategies follow the same pattern — the client handles the provider's auth flow natively and sends the resulting token to the backend:

1. Client sends provider token to `/users/google-login`, `/github-login`, or `/apple-login`
2. Backend middleware validates the token against the provider's API
3. User is created if new, or retrieved if existing
4. Backend issues its own JWT pair (access + refresh tokens)

### Security layers

- **Helmet** — sets secure HTTP headers on every response
- **HTTPS enforcement** — HTTP requests are redirected 301 to HTTPS in production
- **Rate limiting** — per-route limits via `express-rate-limit` (e.g. login: 5 req/15min, token refresh: 10 req/15min)
- **Input validation** — `express-validator` on all routes; XSS-escaped fields on profile updates
- **Refresh token rotation** — each refresh call issues a new token and invalidates the old one
- **Env validation** — `checkEnvVars()` runs at startup and exits immediately if any required variable is missing

---

## Project Structure

```
src/
  controllers/      # Route handlers — user, auth, deviceToken, pushNotification
  middleware/       # JWT validation, OAuth validators, rate limiters, security
  model/            # Mongoose schemas — User, RefreshToken, DeviceToken
  routes/           # Route definitions — user.route.ts, notifications.route.ts
  services/         # Firebase Admin (FCM), SendGrid (email)
  constants/        # Token expiry config
  types/            # TypeScript type definitions
  utils/            # Logger
  connection.ts     # MongoDB connection
  checkEnvVars.ts   # Required env var validation at startup
  index.ts          # Express app entry point
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB instance (local or Atlas)
- Firebase project with Admin SDK credentials
- SendGrid account with verified sender

### Install

```bash
npm install
```

### Environment variables

Create a `.env` file at the project root:

```
NODE_ENV=development
PORT=8080
MONGO_DB=mongodb://...

ATOKEN_SECRET_KEY=
RTOKEN_SECRET_KEY=
GMAIL_TOKEN_SECRET_KEY=

GOOGLE_CLIENT_ID=
APPLE_BUNDLE_ID=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

SENDGRID_API_KEY=
SENDGRID_SENDER_EMAIL=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

> `FIREBASE_PRIVATE_KEY` must include the full `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` string. The initialization code calls `.replace(/\\n/g, '\n')` to convert literal `\n` to real newlines.

### Run (development)

```bash
npm run dev
```

### Build & run (production)

```bash
npm run build
npm start
```

---

## Deployment

Hosted on **AWS EC2** (`us-east-1`) behind **Nginx** with **Let's Encrypt SSL**.  
Process managed by **PM2** (process name: `nodejs-backend`).

Access the server via **AWS Session Manager** (no open SSH port needed):

```bash
aws ssm start-session --target <instance-id> --region us-east-1
```

Deploy a new build on the server:

```bash
cd /home/ec2-user/RN_authApp_BE
git pull origin main
npm install
npm run build
pm2 restart nodejs-backend
pm2 logs nodejs-backend --lines 50
```

Update environment variables directly on the server:

```bash
nano /home/ec2-user/RN_authApp_BE/.env
pm2 stop nodejs-backend && pm2 flush nodejs-backend && pm2 start nodejs-backend
```

---

## License

MIT
