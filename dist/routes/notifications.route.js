"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const express_validator_1 = require("express-validator");
const pushNotification_controller_1 = require("../controllers/pushNotification.controller");
const limiters_1 = require("../middleware/limiters");
const notificationsRouter = (0, express_1.Router)();
/* --- Get ALL FCM Tokens (admin only) --- */
notificationsRouter.get("/fcm-tokens", limiters_1.getTokensLimiter, middleware_1.validateRoleMiddleware, [(0, express_validator_1.query)("systemName").optional().isIn(["Android", "iOS"])], pushNotification_controller_1.getAllFcmTokens);
/* --- Get FCM Tokens by user (admin only) --- */
notificationsRouter.get("/fcm-token-user", limiters_1.getTokensLimiter, middleware_1.validateRoleMiddleware, [(0, express_validator_1.query)("email").notEmpty().isEmail()], pushNotification_controller_1.getFcmTokensByUser);
/* --- Send Push Notification (Admin only) --- */
notificationsRouter.post("/send", limiters_1.createNotificationLimiter, middleware_1.validateRoleMiddleware, [
    (0, express_validator_1.body)("title").notEmpty().trim().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)("body").notEmpty().trim().isLength({ min: 1, max: 500 }),
    (0, express_validator_1.body)("data").optional().isObject(),
    (0, express_validator_1.body)("systemName").optional().isIn(["Android", "iOS"]),
    (0, express_validator_1.body)("userIds").optional().isArray(),
], pushNotification_controller_1.sendNotification);
exports.default = notificationsRouter;
//# sourceMappingURL=notifications.route.js.map