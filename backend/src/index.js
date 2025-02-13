import express from "express";
import dotenv from "dotenv";
import passport from "./config/passport.js";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import session from "express-session";

import authRoutes from "./routes/auth.route.js";
import eventRoutes from "./routes/event.route.js";
import cartRoutes from "./routes/cart.route.js";
import paymentRoutes from "./routes/payment.route.js";  // Payment routes imported
import analyticsRoutes from "./routes/analytics.route.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(cookieParser());

// CORS middleware (Ensure you only have one instance)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Client URL or localhost
  credentials: true,
}));

// Logging middleware (optional)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: "10mb" })); // Allows parsing of larger request bodies

// Session setup (secure session cookies for production)
app.use(session({
  secret: process.env.SESSION_SECRET || 'hi_its_a_secret',  // Use environment variables for security
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // Ensure secure cookies in production
  },
}));

// Passport initialization for authentication
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api', paymentRoutes); // Payment routes that handle payment session and webhook
app.use("/api/analytics", analyticsRoutes);

// Serve frontend in production mode
if (process.env.NODE_ENV !== "development") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// Google authentication routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), async (req, res) => {
  const { accessToken, refreshToken } = generateTokens(req.user._id);
  await storeRefreshToken(req.user._id, refreshToken);
  setCookies(res, accessToken, refreshToken);
  res.redirect("/");
});

// Logout route
app.get("/auth/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  req.logout();
  res.json({ message: "Logged out successfully" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server", error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB(); // Connect to the database
});
