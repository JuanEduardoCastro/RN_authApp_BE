import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { connectToDB } from "./connection";
import userRoutes from "./routes/user.route";
import testRoutes from "./routes/test.routes";

const startServer = async () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  const PORT = process.env.PORT || 3005;

  await connectToDB();

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
