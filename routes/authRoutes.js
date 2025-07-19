const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const authMiddleware = require("../middleware/authmiddleware");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// 🔒 Hardcoded users (for testing only)
const hardcodedUsers = [
  {
    name: "Donor User",
    email: "donor@example.com",
    password: "donor123",
    role: "donor",
    phone: "N/A",
  },
  {
    name: "NGO Agent",
    email: "ngo@example.com",
    password: "ngo123",
    role: "ngo",
    phone: "9876543210",
  },
  {
    name: "Biogas Agent",
    email: "biogas@example.com",
    password: "biogas123",
    role: "biogas",
    phone: "8765432109",
  },
];

// 👤 Normal Login Endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = hardcodedUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔐 Google OAuth Login
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is missing" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    const token = jwt.sign(
      { name, email, role: null, picture },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, name, role: null });
  } catch (err) {
    console.error("Google login error:", err.message);
    res.status(401).json({ message: "Google login failed" });
  }
});

// 🆕 Replace token with selected role (after Google login)
router.post("/select-role", async (req, res) => {
  try {
    const { token, selectedRole } = req.body;

    if (!token || !selectedRole) {
      return res.status(400).json({ message: "Token and selectedRole are required." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { name, email, picture } = decoded;

    const updatedToken = jwt.sign(
      { name, email, role: selectedRole, picture },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token: updatedToken, role: selectedRole, name });
  } catch (err) {
    console.error("Select Role error:", err.message);
    res.status(401).json({ message: "Invalid or expired token." });
  }
});

// ✅ Save selected role in MongoDB user
router.post("/set-role", authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;

    if (!["donor", "ngo", "biogas"].includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({ message: "Role updated successfully" });
  } catch (err) {
    console.error("Error setting role:", err);
    res.status(500).json({ message: "Server error while setting role" });
  }
});

// ✅ Get user profile info after login (protected)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select("name email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});



module.exports = router;
