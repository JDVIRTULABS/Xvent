import jwt from "jsonwebtoken";

const allowedOrigins = [
  "https://www.xvent.in",
  "https://xvent.in",
  "http://localhost:5174",
  "http://localhost:5174",
];

const isAuthenticated = async (req, res, next) => {
  try {
    // ✅ Dynamically set the correct origin for this request
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
    }

    // ✅ Get token from cookies
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    // ✅ Verify token
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    if (!decode || !decode.userId) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    req.id = decode.userId;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({
      message: "Authentication failed",
      success: false,
    });
  }
};

export default isAuthenticated;
