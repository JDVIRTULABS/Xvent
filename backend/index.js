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

// ✅ Connect to database
connectDB();

// ✅ Allowed frontend origins
const allowedOrigins = [
  "https://www.xvent.in",
  "https://xvent.in",
  "http://localhost:5173",
  "http://localhost:5174",
];

// ✅ CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl/Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // ✅ This sets Access-Control-Allow-Origin automatically
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle all OPTIONS preflight requests
app.options("*", cors());

// ✅ Body parsers
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// ✅ Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/event", eventRoute);

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.json({ success: true, message: "Server running ✅" });
});

// ✅ Global CORS error handler
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res
      .status(403)
      .json({ success: false, message: "CORS blocked: Origin not allowed" });
  }
  next(err);
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
