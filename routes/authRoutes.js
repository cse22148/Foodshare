const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User.js");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// POST /api/auth/google - Google Login
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

    // 🔍 Check if the user already exists
    let existingUser = await User.findOne({ email });

    let role = existingUser ? existingUser.role : null;

    // If not exists, create user with null role
    if (!existingUser) {
      existingUser = new User({
        name,
        email,
        picture,
        role: null, // user must select role later
      });
      await existingUser.save();
    }

    // ✅ Generate JWT with role included
    const token = jwt.sign(
      {
        name,
        email,
        picture,
        role, // null if first-time user
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, name, role });
  } catch (err) {
    console.error("Google Login Error:", err.message);
    res.status(401).json({ message: "Google login failed" });
  }
});

// POST /api/auth/set-role - Assign role to user
router.post("/set-role", async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Issue new JWT with updated role
    const token = jwt.sign(
      {
        name: updatedUser.name,
        email: updatedUser.email,
        picture: updatedUser.picture,
        role: updatedUser.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, role: updatedUser.role });
  } catch (err) {
    console.error("Set Role Error:", err.message);
    res.status(500).json({ message: "Failed to set role" });
  }
});

module.exports = router;
