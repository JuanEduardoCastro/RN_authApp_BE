"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const middleware_1 = require("../middleware");
const userRoutes = express_1.default.Router();
userRoutes.post("/checkemail", user_controller_1.checkEmail); // OK!
userRoutes.post("/resetpassword", user_controller_1.resetPassword);
userRoutes.post("/create", middleware_1.validateEmailTokenMiddleware, user_controller_1.createUser); // OK!
userRoutes.post("/login", user_controller_1.loginUser); // OK!
userRoutes.put("/updatepuser/:id", middleware_1.validateEmailTokenMiddleware, user_controller_1.updatePssUser); // OK!
userRoutes.put("/edit/:id", middleware_1.validateAccessTokenMiddleware, user_controller_1.editUser);
userRoutes.post("/logout", user_controller_1.logoutUser);
userRoutes.get("/validatetoken", middleware_1.validateRefreshTokenMiddleware, user_controller_1.validateNewAccessToken);
exports.default = userRoutes;
//# sourceMappingURL=user.route.js.map