import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  // ✅ Set CORS headers for all responses, including errors
  res.header("Access-Control-Allow-Origin", "https://www.xvent.in","https://xvent.in","http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    req.id = decode.userId || decode.id;
    if (!req.id) {
      return res.status(401).json({
        message: "Invalid token payload",
        success: false,
      });
    }

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
