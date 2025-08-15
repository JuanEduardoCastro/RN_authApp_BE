import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./connection";
import userRoutes from "./routes/user.route";
import "dotenv/config";
import testRoutes from "./routes/test.routes";

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3005;

connectDB();

app.get("/test", (req: Request, res: Response) => {
  console.log("Test OK");
  res.send("Test OK");
});

app.use("/users", userRoutes);
app.use("/tests", testRoutes);

app.listen(PORT, () => {
  console.log(`** server running on port ${PORT} **`);
});
