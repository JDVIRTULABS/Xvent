import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

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

// ✅ ENHANCED CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
}));

// ✅ Handle preflight requests globally
app.options('*', cors());

// ✅ Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// ✅ Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/event", eventRoute);

// ✅ Test endpoint to verify CORS
app.get("/api/v1/test-cors", (req, res) => {
  res.json({ 
    success: true, 
    message: "CORS is working!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.json({ success: true, message: "Server running ✅" });
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));