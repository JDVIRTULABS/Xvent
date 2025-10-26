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

// ✅ Enhanced CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      console.log('🔍 CORS Check - Origin:', origin);
      
      if (!origin || allowedOrigins.includes(origin)) {
        console.log('✅ CORS: Origin allowed');
        callback(null, origin);
      } else {
        console.log('❌ CORS: Origin blocked');
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// ✅ Handle preflight requests explicitly
// app.options('*', cors());

// ✅ Body parsers
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// ✅ Test CORS route
app.get("/api/v1/test-cors", (req, res) => {
  res.json({ 
    success: true, 
    message: "CORS test successful",
    origin: req.headers.origin
  });
});

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
    console.log('🚫 CORS Error:', err.message);
    return res.status(403).json({ 
      success: false, 
      message: "CORS blocked: Origin not allowed",
      allowedOrigins: allowedOrigins 
    });
  }
  next(err);
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));