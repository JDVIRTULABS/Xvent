import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // load .env variables

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined in environment variables");
    }
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB is connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectDB;
