const jwt = require("jsonwebtoken");
const User = require("../models/user");

const COOKIE_NAME = "skinsense_token";

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message:
          "You must be logged in to analyze and track your skin.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET is missing from the backend environment."
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message:
          "The account connected to this session no longer exists.",
      });
    }

    /*
     * Store the authenticated user on the request.
     * Controllers can now access:
     *
     * req.user._id
     * req.user.name
     * req.user.email
     */
    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Authentication middleware error:",
      error.message
    );

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message:
          "Your login session has expired. Please log in again.",
      });
    }

  const isDatabaseConnectionError =
  error.name === "MongoNetworkError" ||
  error.name === "MongoServerSelectionError" ||
  error.message?.includes("SSL routines") ||
  error.message?.includes("tlsv1 alert") ||
  error.message?.includes("server selection");

if (isDatabaseConnectionError) {
  return res.status(503).json({
    success: false,
    message:
      "SkinSense could not connect to MongoDB Atlas. Please check the Atlas network access and restart the backend.",
  });
}

return res.status(500).json({
  success: false,
  message:
    "Authentication could not be verified.",
});
  }
};

module.exports = {
  protect,
};