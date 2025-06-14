const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";

// Hardcoded users for each role (now includes phone)
const hardcodedUsers = [
  {
    name: "Donor User",
    email: "donor@example.com",
    password: "donor123",
    role: "donor",
    phone: "N/A"
  },
  {
    name: "NGO Agent",
    email: "ngo@example.com",
    password: "ngo123",
    role: "ngo",
    phone: "9876543210" // <- add real or dummy contact
  },
  {
    name: "Biogas Agent",
    email: "biogas@example.com",
    password: "biogas123",
    role: "biogas",
    phone: "8765432109" // <- add real or dummy contact
  }
];

// POST /api/login - login with hardcoded users
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = hardcodedUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
  { id: user._id, name: user.name, email: user.email, role: user.role }, 
  process.env.JWT_SECRET
);

    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error"});
  }
});

module.exports = router;
