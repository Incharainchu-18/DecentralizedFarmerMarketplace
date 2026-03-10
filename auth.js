import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ================================
// Protect routes (JWT middleware)
// ================================
export const auth = async (req, res, next) => {
  try {
    let token;

    // Expect token as: Authorization: Bearer <token>
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      });
    }

    // Optional: account status check
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({
      success: false,
      message: "Not authorized, token invalid",
    });
  }
};

// ================================
// Farmer-only access
// ================================
export const requireFarmer = (req, res, next) => {
  if (req.user.role !== "farmer") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Farmer role required.",
    });
  }
  next();
};

// ================================
// Customer-only access
// ================================
export const requireCustomer = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Customer role required.",
    });
  }
  next();
};
