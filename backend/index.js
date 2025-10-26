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

// ✅ Define allowed origins (NO trailing slash)
const allowedOrigins = [
  "https://www.xvent.in",
  "https://xvent.in",
  "http://localhost:5173",
  "http://localhost:5174",
];

// ✅ Use CORS safely
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS,PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ✅ Other middlewares
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// ✅ Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/event", eventRoute);

// ✅ Test route
app.get("/api/v1/test-cors", (req, res) => {
  res.json({
    success: true,
    origin: req.headers.origin,
    cookies: req.cookies,
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
});
