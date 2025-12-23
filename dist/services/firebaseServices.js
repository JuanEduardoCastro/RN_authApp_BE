"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = exports.initializeFirebase = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const logger_1 = require("../utils/logger");
let firebaseApp = null;
const initializeFirebase = () => {
    if (firebaseApp)
        return firebaseApp;
    try {
        firebaseApp = firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
        });
        logger_1.logger.info("Firebase Admin initialized successfully.");
        return firebaseApp;
    }
    catch (error) {
        logger_1.logger.error("Error initializing Firebase Admin:", error);
        throw error;
    }
};
exports.initializeFirebase = initializeFirebase;
const sendPushNotification = async (fcmTokens, title, body, data) => {
    const firebase = (0, exports.initializeFirebase)();
    const messaging = firebase.messaging();
    const message = {
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
        logger_1.logger.log(`Successfully sent ${response.successCount} messages`);
        logger_1.logger.log(`Failed to send ${response.failureCount} messages`);
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                failedTokens.push(fcmTokens[idx]);
                logger_1.logger.error(`Error sending to token ${fcmTokens[idx]}:`, resp.error);
            }
        });
        return {
            successCount: response.successCount,
            failureCount: response.failureCount,
            failedTokens,
        };
    }
    catch (error) {
        logger_1.logger.error("Error sending push notification:", error);
        throw error;
    }
};
exports.sendPushNotification = sendPushNotification;
//# sourceMappingURL=firebaseServices.js.map