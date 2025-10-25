import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import eventRoute from "./routes/event.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
connectDB();

// ✅ CORS CONFIGURATION
const allowedOrigins = [
  "https://www.xvent.in",
  "https://xvent.in",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Cookie",
    "Accept",
    "Origin",
  ],
}));

// Handle preflight globally
app.options("*", cors());

// Body parsers
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/event", eventRoute);

// Test route
app.get("/api/v1/test-cors", (req, res) => {
  res.json({ success: true, message: "CORS working!", origin: req.headers.origin });
});

// Root
app.get("/", (req, res) => {
  res.json({ message: "Server running", success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
