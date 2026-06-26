import mongoose from "mongoose";

const appStatsSchema = new mongoose.Schema({
  key: {
    type: String,
    default: "global",
    unique: true,
  },
  deletedUserCount: {
    type: Number,
    default: 0,
  },
});

const AppStats = mongoose.model("AppStats", appStatsSchema);
export default AppStats;
