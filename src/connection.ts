import "dotenv/config";
import mongoose from "mongoose";
import { logger } from "./utils/logger";

const URI = process.env.MONGO_DB;

if (!URI) {
  throw new Error("MONGO_DB not found in environment vars!");
}

mongoose.Promise = global.Promise;
const connect = mongoose.connection;
mongoose.set("strictQuery", true);

const connectDB = async () => {
  connect.on("connected", async () => {
    logger.info("++ --> DB CONNECTED <-- ++");
  });

  connect.on("reconnected", async () => {
    logger.info("++ --> DB RECONNECTED <-- ++");
  });

  connect.on("disconnected", async () => {
    logger.info("++ --> DB DISCONNECTED <-- ++");
    logger.info("Trying to reconnect to Mongo...");

    setTimeout(() => {
      mongoose.connect(URI, {
        socketTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
    }, 3005);
  });

  connect.on("close", async () => {
    logger.info("++ --> DB CLOSED <-- ++");
  });

  connect.on("error", async (error) => {
    logger.error("++ --> DB ERROR <-- ++", error);
  });

  await mongoose.connect(URI).catch((error) => logger.error(error));
};

export { connectDB };
