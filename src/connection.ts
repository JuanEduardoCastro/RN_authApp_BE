import mongoose from "mongoose";

const URI = process.env.MONGO_DB;

if (!URI) {
  throw new Error("MONGO_URI not found in environment vars!");
}

mongoose.Promise = global.Promise;
const connect = mongoose.connection;
mongoose.set("strictQuery", true);

const connectDB = async () => {
  connect.on("connected", async () => {
    console.log("++ --> DB CONNECTED <-- ++");
  });

  connect.on("reconnected", async () => {
    console.log("++ --> DB RECONNECTED <-- ++");
  });

  connect.on("disconnected", async () => {
    console.log("++ --> DB DISCONNECTED <-- ++");
    console.log("Trying to reconnect to Mongo...");

    setTimeout(() => {
      mongoose.connect(URI, {
        socketTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
    }, 3005);
  });

  connect.on("close", async () => {
    console.log("++ --> DB CLOSED <-- ++");
  });

  connect.on("error", async (error) => {
    console.log("++ --> DB ERROR <-- ++", error);
  });

  await mongoose.connect(URI).catch((error) => console.log(error));
};

export { connectDB };
