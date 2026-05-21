import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./connection";
import userRoutes from "./routes/user.route";
import { checkEnvVars } from "./checkEnvVars";
import helmet from "helmet";
import { enforceHTTPS } from "./middleware/security";
import { logger } from "./utils/logger";
import packagejson from "../package.json";
import notificationsRoutes from "./routes/notifications.route";
import messageRoutes from "./routes/message.route";
import { startAgenda } from "./services/agendaService";

const APP_VERSION = packagejson.version;

const startServer = async () => {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(enforceHTTPS);

  app.use(express.json({ limit: "5mb" }));
  app.use(
    cors({
      origin: false,
      credentials: false,
    }),
  );

  const PORT = parseInt(process.env.PORT) || 8080; // defaults to 8080 if PORT not set

  await connectDB();
  await startAgenda();

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ message: `Server is healthy --> ${APP_VERSION} ` });
  });

  app.use("/users", userRoutes);
  app.use("/notifications", notificationsRoutes);
  app.use("/messages", messageRoutes);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err.message, err);
    const status = (err as any).status ?? 500;
    res.status(status).json({ error: err.message ?? "Internal server error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`** Server running on port ${PORT} **`);
  });
};

checkEnvVars();

startServer().catch((error) => {
  logger.error("XX -> Failed to start server:", error);
  process.exit(1);
});
