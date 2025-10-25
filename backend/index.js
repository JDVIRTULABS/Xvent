import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import eventRoute from "./routes/event.route.js"
// import messageRoute from "./routes/message.route.js";

dotenv.config({});

const app = express();

const PORT = process.env.PORT || 3000;
console.log(PORT);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "I'm running from server side",
    suceess: true,
  });
});

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
const corsOption = {
  origin: ["https://www.xvent.in","http://localhost:5173", "http://localhost:5174"], // allow both
  credentials: true, // lowercase + required
};
app.use(cors(corsOption));

// api routes

app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/event", eventRoute);
// app.use("/api/v1/message", messageRoute);
// "https://xvent.onrender.com/api/v1/user"

app.listen(PORT, () => {
  connectDB();
  console.log(`port is running on ${PORT}`);
});
