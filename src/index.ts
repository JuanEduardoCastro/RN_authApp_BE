if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

import express, { Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./connection";
import userRoutes from "./routes/user.route";
import testRoutes from "./routes/test.routes";

console.log("----> ", process.env.NODE_ENV);
const startServer = async () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  const PORT = process.env.PORT || 8080;

  await connectDB();

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).send("Server is healthy");
  });

  app.use("/users", userRoutes);
  app.use("/tests", testRoutes);

  app.listen(PORT, () => {
    console.log(`** Server running on port ${PORT} **`);
  });
};

startServer().catch((error) => {
  console.error("XX -> Failed to start server:", error);
  process.exit(1);
});
