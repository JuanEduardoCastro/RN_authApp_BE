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
const test_routes_1 = __importDefault(require("./routes/test.routes"));
const startServer = async () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cors_1.default)());
    const PORT = process.env.PORT || 3000;
    await (0, connection_1.connectDB)();
    app.get("/health", (_req, res) => {
        res.status(200).send("Server is healthy");
    });
    app.use("/users", user_route_1.default);
    app.use("/tests", test_routes_1.default);
    app.listen(PORT, () => {
        console.log(`** Server running on port ${PORT} **`);
    });
};
startServer().catch((error) => {
    console.error("XX -> Failed to start server:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map