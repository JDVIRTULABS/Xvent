import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("mongodb is connected");
  } catch (error) {
    console.log(`gets a error in db ${error}`);
  }
};

export default connectDB;
