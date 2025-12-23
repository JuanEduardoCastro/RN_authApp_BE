import admin from "firebase-admin";
import { logger } from "../utils/logger";

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    logger.info("Firebase Admin initialized successfully.");
    return firebaseApp;
  } catch (error) {
    logger.error("Error initializing Firebase Admin:", error);
    throw error;
  }
};

export const sendPushNotification = async (
  fcmTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  const firebase = initializeFirebase();
  const messaging = firebase.messaging();

  const message: admin.messaging.MulticastMessage = {
    tokens: fcmTokens,
    notification: {
      title,
      body,
    },
    data: data || {},
    android: {
      priority: "high",
      notification: {
        sound: "default",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
        },
      },
    },
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    logger.log(`Successfully sent ${response.successCount} messages`);
    logger.log(`Failed to send ${response.failureCount} messages`);

    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(fcmTokens[idx]);
        logger.error(`Error sending to token ${fcmTokens[idx]}:`, resp.error);
      }
    });
    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      failedTokens,
    };
  } catch (error) {
    logger.error("Error sending push notification:", error);
    throw error;
  }
};
