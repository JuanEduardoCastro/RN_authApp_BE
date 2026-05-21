import Agenda, { Job, JobPriority } from "agenda";
import { logger } from "../utils/logger";
import { sendWelcomeMessage } from "../controllers/message.controller";

interface WelcomeMessageJobData {
  userId: string;
  firstName: string;
}

const agenda = new Agenda({
  db: {
    address: process.env.MONGO_DB as string,
    collection: "agenda_jobs",
  },
  processEvery: "30 seconds",
  maxConcurrency: 3,
});

agenda.define(
  "send-welcome-message",
  { priority: JobPriority.normal, concurrency: 3 },
  (job: Job, done) => {
    const { userId, firstName } = job.attrs.data as WelcomeMessageJobData;
    logger.info(`Running welcome message job for user ${userId} (${firstName})`);
    sendWelcomeMessage(userId, firstName)
      .then(() => done())
      .catch((err) => {
        logger.error(`Failed to send welcome message for user ${userId}:`, err);
        done();
      });
  },
);

export const scheduleWelcomeMessage = async (userId: string, firstName: string): Promise<void> => {
  try {
    await agenda.schedule("in 3 minutes", "send-welcome-message", { userId, firstName });
    logger.info(`Welcome message scheduled for user ${userId} in 3 minutes`);
  } catch (error) {
    logger.error(`Failed to schedule welcome message for user ${userId}:`, error);
  }
};

export const startAgenda = async (): Promise<void> => {
  await agenda.start();
  logger.info("Agenda started");
};

const gracefullShutdown = async () => {
  await agenda.stop();
  logger.info("Agenda stopped");
  process.exit(0);
};

process.on("SIGTERM", gracefullShutdown);
process.on("SIGINT", gracefullShutdown);
