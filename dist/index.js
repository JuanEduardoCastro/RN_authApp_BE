"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = __importDefault(require("./connection"));
const user_route_1 = __importDefault(require("./routes/user.route"));
require("dotenv/config");
const test_routes_1 = __importDefault(require("./routes/test.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const PORT = process.env.PORT || 3005;
(0, connection_1.default)();
app.get("/test", (req, res) => {
    console.log("Test OK");
    res.send("Test OK");
});
app.use("/users", user_route_1.default);
app.use("/tests", test_routes_1.default);
app.listen(PORT, () => {
    console.log(`** server running on port ${PORT} **`);
});
//# sourceMappingURL=index.js.map