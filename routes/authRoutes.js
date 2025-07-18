const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Hardcoded users for testing login
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
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = hardcodedUsers.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase().trim() &&
        u.password === password
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

// 🔐 Google OAuth Login Endpoint
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

    const role = "donor"; // default role for Google logins

    const token = jwt.sign(
      { name, email, role, picture },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, role, name });
  } catch (err) {
    console.error("Google login error:", err.message);
    res.status(401).json({ message: "Google login failed" });
  }
});

module.exports = router;
