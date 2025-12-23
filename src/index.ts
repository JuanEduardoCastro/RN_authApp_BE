import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./connection";
import userRoutes from "./routes/user.route";
import { checkEnvVars } from "./checkEnvVars";
import helmet from "helmet";
import { enforceHTTPS } from "./middleware/security";
import { logger } from "./utils/logger";
import packagejson from "../package.json";
import notificationsRouter from "./routes/notifications.route";

const APP_VERSION = packagejson.version;

const startServer = async () => {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(enforceHTTPS);

  app.use(express.json({ limit: "10kb" }));
  app.use(
    cors({
      origin: false,
      credentials: false,
    })
  );

  const PORT = parseInt(process.env.PORT) || 8080;

  await connectDB();

  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ message: `Server is healthy --> ${APP_VERSION} ` });
  });

  app.use("/users", userRoutes);
  app.use("/notifications", notificationsRouter);

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`** Server running on port ${PORT} **`);
  });
};

checkEnvVars();

startServer().catch((error) => {
  logger.error("XX -> Failed to start server:", error);
  process.exit(1);
});
