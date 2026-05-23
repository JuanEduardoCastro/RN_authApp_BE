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
  payloads: { fcmTokens: string[]; badgeCount: number }[],
  title: string,
  body: string,
  data?: Record<string, string>,
) => {
  const firebase = initializeFirebase();
  const messaging = firebase.messaging();

  let successCount = 0;
  let failureCount = 0;
  const failedTokens: string[] = [];
  try {
    for (const payload of payloads) {
      const message: admin.messaging.MulticastMessage = {
        tokens: payload.fcmTokens,
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
              badge: payload.badgeCount,
              sound: "default",
            },
          },
        },
      };

      const response = await messaging.sendEachForMulticast(message);
      successCount += response.successCount;
      failureCount += response.failureCount;

      response.responses.forEach((resp, index) => {
        if (!resp.success) {
          failedTokens.push(payload.fcmTokens[index]);
          logger.error(`Error sending to token ${payload.fcmTokens[index]}:`, resp.error);
        }
      });
    }
    logger.log(`Successfully sent ${successCount} messages`);
    logger.log(`Failed to send ${failureCount} messages`);
    return { successCount, failureCount, failedTokens };
  } catch (error) {
    logger.error("Error sending push notification:", error);
    throw error;
  }
};
