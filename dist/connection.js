"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./utils/logger");
const URI = process.env.MONGO_DB;
if (!URI) {
    throw new Error("MONGO_DB not found in environment vars!");
}
mongoose_1.default.Promise = global.Promise;
const connect = mongoose_1.default.connection;
mongoose_1.default.set("strictQuery", true);
const connectDB = async () => {
    connect.on("connected", async () => {
        logger_1.logger.info("++ --> DB CONNECTED <-- ++");
    });
    connect.on("reconnected", async () => {
        logger_1.logger.info("++ --> DB RECONNECTED <-- ++");
    });
    connect.on("disconnected", async () => {
        logger_1.logger.info("++ --> DB DISCONNECTED <-- ++");
        logger_1.logger.info("Trying to reconnect to Mongo...");
        setTimeout(() => {
            mongoose_1.default.connect(URI, {
                socketTimeoutMS: 3000,
                connectTimeoutMS: 3000,
            });
        }, 3005);
    });
    connect.on("close", async () => {
        logger_1.logger.info("++ --> DB CLOSED <-- ++");
    });
    connect.on("error", async (error) => {
        logger_1.logger.error("++ --> DB ERROR <-- ++", error);
    });
    await mongoose_1.default.connect(URI).catch((error) => logger_1.logger.error(error));
};
exports.connectDB = connectDB;
//# sourceMappingURL=connection.js.map