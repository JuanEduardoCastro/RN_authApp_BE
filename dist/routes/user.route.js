"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const middleware_1 = require("../middleware");
const limiters_1 = require("../middleware/limiters");
const userRoutes = express_1.default.Router();
/* --- Authentication Routes --- */
userRoutes.post("/login", limiters_1.loginLimiter, (0, express_validator_1.body)("email").isEmail(), user_controller_1.loginUser);
userRoutes.post("/logout", user_controller_1.logoutUser);
userRoutes.post("/token/refresh", middleware_1.validateRefreshTokenMiddleware, user_controller_1.validateNewAccessToken);
/* --- User Management Routes --- */
userRoutes.post("/create", middleware_1.validateEmailTokenMiddleware, middleware_1.validatePasswordMiddleWare, (0, express_validator_1.body)("email").isEmail(), (0, express_validator_1.body)("password").isLength({ min: 8 }), user_controller_1.createUser);
userRoutes.patch("/:id", middleware_1.validateAccessTokenMiddleware, user_controller_1.editUser);
/* --- Password & Email Validation Routes --- */
userRoutes.post("/check-provider", user_controller_1.checkEmailWithProvider);
userRoutes.post("/check-email", limiters_1.checkEmailLimiter, user_controller_1.checkEmail);
userRoutes.post("/reset-password", limiters_1.resetPasswordLimiter, user_controller_1.resetPassword);
userRoutes.put("/:id/password", middleware_1.validateEmailTokenMiddleware, middleware_1.validatePasswordMiddleWare, (0, express_validator_1.body)("password").isLength({ min: 8 }), user_controller_1.updatePssUser);
exports.default = userRoutes;
//# sourceMappingURL=user.route.js.map