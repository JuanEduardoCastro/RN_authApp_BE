"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const refreshToken_controller_1 = require("../controllers/refreshToken.controller");
const testRoutes = express_1.default.Router();
testRoutes.post("/create-email-token", refreshToken_controller_1.createEmailTokenTest);
exports.default = testRoutes;
//# sourceMappingURL=test.routes.js.map