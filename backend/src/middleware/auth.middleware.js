import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Protect route middleware - Verifies if the user has a valid access token
export const protectRoute = async (req, res, next) => {
    try {
        // Get the token from headers (or cookies if you're using cookies for token storage)
        const token = req.headers["authorization"]?.split(" ")[1] || req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No access token provided" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the user based on the decoded userId (if needed for further validation)
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user; // Attach user to request object for use in next route
        next(); // Continue to the next middleware or route handler
    } catch (error) {
        console.error("Error in protectRoute middleware:", error.message);
        return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
    }
};

// Admin route middleware - Checks if the user is an admin
export const adminRoute = (req, res, next) => {
    // Check if the user's role is admin
    if (req.user && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Admins only" });
    }

    // Proceed to the next middleware or route handler
    next();
};
