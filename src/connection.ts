import mongoose from "mongoose";
import * as dotenv from "dotenv";

const connectDB = async () => {
  try {
    // const connnection = await mongoose.connect(URI);
    const connnection = await mongoose.connect(
      `mongodb+srv://jcvenepro:${process.env.SECRET_DB}@cluster0.f6e7p3i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    );
    if (connnection) {
      console.log("++ --> DB CONNECTED <-- ++");
    }
  } catch (error) {
    console.log("XX -> connection.ts:6 -> connectDB -> error:", error);
  }
};

export default connectDB;

/* WnuAi1esHXDgFCm0 - jcvenepro */
