"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = require("./connection");
const user_route_1 = __importDefault(require("./routes/user.route"));
const checkEnvVars_1 = require("./checkEnvVars");
const helmet_1 = __importDefault(require("helmet"));
const security_1 = require("./middleware/security");
const logger_1 = require("./utils/logger");
const package_json_1 = __importDefault(require("../package.json"));
const notifications_route_1 = __importDefault(require("./routes/notifications.route"));
const APP_VERSION = package_json_1.default.version;
const startServer = async () => {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    }));
    app.use(security_1.enforceHTTPS);
    app.use(express_1.default.json({ limit: "10kb" }));
    app.use((0, cors_1.default)({
        origin: false,
        credentials: false,
    }));
    const PORT = parseInt(process.env.PORT) || 8080;
    await (0, connection_1.connectDB)();
    app.get("/", (_req, res) => {
        res.status(200).json({ message: `Server is healthy --> ${APP_VERSION} ` });
    });
    app.use("/users", user_route_1.default);
    app.use("/notifications", notifications_route_1.default);
    app.listen(PORT, "0.0.0.0", () => {
        logger_1.logger.info(`** Server running on port ${PORT} **`);
    });
};
(0, checkEnvVars_1.checkEnvVars)();
startServer().catch((error) => {
    logger_1.logger.error("XX -> Failed to start server:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map