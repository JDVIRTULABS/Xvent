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

// Database connection
connectDB();

// Allowed origins
const allowedOrigins = [
  "https://www.xvent.in",
  "https://xvent.in",
  "http://localhost:5173",
  "http://localhost:5174",
];

// ✅✅✅ CORS MUST BE FIRST - Move this to the top ✅✅✅
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin like mobile apps or curl requests
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cookie"] // Add this
}));

// ✅ Handle preflight requests IMMEDIATELY after CORS
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "https://www.xvent.in");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Cookie");
  res.header("Access-Control-Allow-Credentials", "true");
  res.status(204).send();
});

// Other middleware (AFTER CORS)
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/event", eventRoute);

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "I'm running from server side",
    success: true,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});