import { MongoClient } from "mongodb";

const URI = process.env.SECRET_DB;

if (!URI) {
  throw new Error("MONGO_URI not found in environment vars!");
}

export const client = new MongoClient(URI);
let isConnected = false;

export const connectToDB = async () => {
  if (isConnected) {
    console.log("++ --> DB ALREADY CLIENT CONNECTED <-- ++");
    return client;
  }

  try {
    await client.connect();
    isConnected = true;
    console.log("++ --> DB NEW CLIENT CONNECTED <-- ++");
    return client;
  } catch (error) {
    console.log("XX -> connection.ts:6 -> connectToDB -> error:", error);
    throw error;
  }
};

process.on("SIGINT", async () => {
  await client.close();
  process.exit(0);
});
