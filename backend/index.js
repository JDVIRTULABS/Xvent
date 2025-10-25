import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import eventRoute from "./routes/event.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
connectDB();

// ✅ ENHANCED CORS HEADERS
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://www.xvent.in",
    "https://xvent.in",
    "http://localhost:5173",
    "http://localhost:5174"
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  
  // ✅ ADD ALL POTENTIAL HEADERS YOUR FRONTEND MIGHT SEND
  res.setHeader(
    "Access-Control-Allow-Headers", 
    "Content-Type, Authorization, X-Requested-With, Cookie, Accept, x-requested-with, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  
  // Handle preflight
  if (req.method === "OPTIONS") {
    console.log("✅ Preflight successful");
    return res.status(200).end();
  }
  
  next();
});

// Body parsers
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/event", eventRoute);

// Test endpoint
app.get("/api/v1/test-cors", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working!",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({ 
    message: "Server is running",
    success: true 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});