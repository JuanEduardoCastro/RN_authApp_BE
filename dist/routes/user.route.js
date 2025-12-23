"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const middleware_1 = require("../middleware");
const limiters_1 = require("../middleware/limiters");
const deviceToken_controller_1 = require("../controllers/deviceToken.controller");
const googleLogin_controller_1 = require("../controllers/googleLogin.controller");
const githubLogin_controller_1 = require("../controllers/githubLogin.controller");
const userRoutes = (0, express_1.Router)();
/* --- Authentication Routes --- */
userRoutes.post("/login", limiters_1.loginLimiter, (0, express_validator_1.body)("email").isEmail(), user_controller_1.loginUser);
userRoutes.post("/logout", limiters_1.logoutLimiter, middleware_1.validateAccessTokenMiddleware, user_controller_1.logoutUser);
userRoutes.post("/token/refresh", limiters_1.tokenRefreshLimiter, middleware_1.validateRefreshTokenMiddleware, user_controller_1.validateNewAccessToken);
/* --- User Management Routes --- */
userRoutes.post("/create", limiters_1.createUserLimiter, middleware_1.validateEmailTokenMiddleware, middleware_1.validatePasswordMiddleWare, (0, express_validator_1.body)("email").isEmail(), (0, express_validator_1.body)("password").isLength({ min: 8, max: 60 }), user_controller_1.createUser);
userRoutes.patch("/:id", middleware_1.validateAccessTokenMiddleware, (0, express_validator_1.body)("firstName").optional().trim().isLength({ max: 100 }).escape(), (0, express_validator_1.body)("lastName").optional().trim().isLength({ max: 100 }).escape(), (0, express_validator_1.body)("occupation").optional().trim().isLength({ max: 200 }).escape(), (0, express_validator_1.body)("phoneNumber.code").optional().trim().isLength({ max: 10 }), (0, express_validator_1.body)("phoneNumber.dialCode").optional().trim().isLength({ max: 10 }), (0, express_validator_1.body)("phoneNumber.number").optional().trim().isLength({ max: 20 }), user_controller_1.editUser);
userRoutes.patch("/management/:id", middleware_1.validateRoleMiddleware, (0, express_validator_1.body)("roles").isIn(["user", "admin", "superadmin"]), user_controller_1.editRole);
/* --- Password & Email Validation Routes --- */
userRoutes.post("/check-email", limiters_1.checkEmailLimiter, (0, express_validator_1.body)("email").isEmail().normalizeEmail(), user_controller_1.checkEmail);
userRoutes.post("/reset-password", limiters_1.resetPasswordLimiter, (0, express_validator_1.body)("email").isEmail().normalizeEmail(), user_controller_1.resetPassword);
userRoutes.put("/:id/password", limiters_1.newPasswordLimiter, middleware_1.validateEmailTokenMiddleware, middleware_1.validatePasswordMiddleWare, (0, express_validator_1.body)("password").isLength({ min: 8, max: 60 }), user_controller_1.updatePasswordUser);
/* --- FCM tokens Routes --- */
userRoutes.post("/device-token", limiters_1.deviceTokenLimiter, middleware_1.validateAccessTokenMiddleware, (0, express_validator_1.body)("fcmToken").isString().trim().isLength({ min: 10, max: 500 }), (0, express_validator_1.body)("deviceId").isString().trim().isLength({ min: 1, max: 200 }), (0, express_validator_1.body)("deviceName").optional().trim().isLength({ max: 100 }), (0, express_validator_1.body)("osVersion").optional().trim().isLength({ max: 50 }), (0, express_validator_1.body)("appVersion").optional().trim().isLength({ max: 50 }), (0, express_validator_1.body)("systemName").isIn(["Android", "iOS"]), deviceToken_controller_1.setDevicetoken);
userRoutes.patch("/device-token/last-used", limiters_1.deviceTokenLimiter, middleware_1.validateAccessTokenMiddleware, (0, express_validator_1.body)("deviceId").isString().trim().isLength({ min: 1, max: 200 }), deviceToken_controller_1.updateDeviceToken);
userRoutes.delete("/device-token/:deviceId", limiters_1.deviceTokenLimiter, middleware_1.validateAccessTokenMiddleware, deviceToken_controller_1.deactivateDeviceToken);
userRoutes.get("/devices", limiters_1.deviceTokenLimiter, middleware_1.validateAccessTokenMiddleware, deviceToken_controller_1.getAllUsersDevice);
/* --- Google validate token Routes --- */
userRoutes.post("/google-login", limiters_1.googleLoginLimiter, middleware_1.validateGoogleToken, googleLogin_controller_1.googleLogin);
/* --- GitHub validate token Routes --- */
userRoutes.post("/github-login", limiters_1.githubLoginLimiter, middleware_1.validateGithubToken, githubLogin_controller_1.githubLogin);
exports.default = userRoutes;
//# sourceMappingURL=user.route.js.map