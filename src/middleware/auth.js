const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log("Headers:", req.headers); // Log all headers
  console.log("Authorization header:", req.headers.authorization); // Log just the auth header
  console.log("Cookies:", req.cookies); // Log cookies

  // Check if auth header exists and has the right format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Extract token from Bearer token
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    // Or get token from cookies
    token = req.cookies.token;
  }

  console.log("Final token value:", token);

  // Check if token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and explicitly check active status
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(
        new ErrorResponse("User not found with the provided token", 401)
      );
    }

    // Check if user account is active
    if (user.isActive === false) {
      return next(
        new ErrorResponse("Account is inactive. Please contact support.", 403)
      );
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);

    // More specific error message based on the error type
    if (err.name === "TokenExpiredError") {
      return next(
        new ErrorResponse("Token has expired, please login again", 401)
      );
    } else if (err.name === "JsonWebTokenError") {
      return next(new ErrorResponse("Invalid token, please login again", 401));
    } else {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
