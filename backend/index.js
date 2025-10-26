import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import eventRoute from "./routes/event.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

// ✅ Allowed frontend origins
const allowedOrigins = [
  "https://www.xvent.in",
  "https://xvent.in",
  "http://localhost:5173",
  "http://localhost:5174",
];

// ✅ Use CORS before any routes
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200,
  })
);

// ✅ Handle all OPTIONS preflight requests (Express 5 safe)
app.options(/.*/, cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ✅ Body parsing and cookies
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// ✅ Routes (after CORS)
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/event", eventRoute);

app.get("/api/v1/test-cors", (req, res) => {
  res.json({
    success: true,
    origin: req.headers.origin,
    message: "CORS working ✅",
  });
});

app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
