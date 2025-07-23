const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authMiddleware = require("./middleware/authMiddleware");
const donationRoutes = require("./routes/donation.routes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5000', 'https://foodshare-umber.vercel.app'],
  credentials: true
}));

app.use(express.json());

// Serve static frontend files from the "foodshare-frontend" folder
app.use(express.static(path.join(__dirname, "foodshare-frontend")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/donations", authMiddleware, donationRoutes);

// Default route: redirect to login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "foodshare-frontend", "login.html"));
});

// Optional: Health check
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB error:", err));
