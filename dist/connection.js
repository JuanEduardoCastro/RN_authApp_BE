"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDB = exports.client = void 0;
const mongodb_1 = require("mongodb");
const URI = process.env.SECRET_DB;
if (!URI) {
    throw new Error("MONGO_URI not found in environment vars!");
}
exports.client = new mongodb_1.MongoClient(URI);
let isConnected = false;
const connectToDB = async () => {
    if (isConnected) {
        console.log("++ --> DB ALREADY CLIENT CONNECTED <-- ++");
        return exports.client;
    }
    try {
        await exports.client.connect();
        isConnected = true;
        console.log("++ --> DB NEW CLIENT CONNECTED <-- ++");
        return exports.client;
    }
    catch (error) {
        console.log("XX -> connection.ts:6 -> connectToDB -> error:", error);
        throw error;
    }
};
exports.connectToDB = connectToDB;
process.on("SIGINT", async () => {
    await exports.client.close();
    process.exit(0);
});
//# sourceMappingURL=connection.js.map