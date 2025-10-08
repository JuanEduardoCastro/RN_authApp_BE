"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const middleware_1 = require("../middleware");
const userRoutes = express_1.default.Router();
// --- Authentication Routes ---
// userRoutes.post("/login", body("email").isEmail().normalizeEmail(), loginUser);
userRoutes.post("/login", (0, express_validator_1.body)("email").isEmail().normalizeEmail(), user_controller_1.loginUser);
userRoutes.post("/logout", user_controller_1.logoutUser);
userRoutes.post("/token/refresh", middleware_1.validateRefreshTokenMiddleware, user_controller_1.validateNewAccessToken);
// --- User Management Routes ---
userRoutes.post("/", middleware_1.validateEmailTokenMiddleware, (0, express_validator_1.body)("email").isEmail().normalizeEmail(), (0, express_validator_1.body)("password").isLength({ min: 6 }), user_controller_1.createUser);
userRoutes.patch("/:id", middleware_1.validateAccessTokenMiddleware, user_controller_1.editUser);
// --- Password & Email Validation Routes ---
userRoutes.post("/check-email", user_controller_1.checkEmail);
userRoutes.post("/reset-password", user_controller_1.resetPassword);
userRoutes.put("/:id/password", middleware_1.validateEmailTokenMiddleware, (0, express_validator_1.body)("password").isLength({ min: 6 }), user_controller_1.updatePssUser);
exports.default = userRoutes;
//# sourceMappingURL=user.route.js.map