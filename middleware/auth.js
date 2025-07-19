const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Access denied, token missing" });

  try {
    const token = authHeader.split(" ")[1]; // Bearer <token>
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
}

module.exports = verifyToken;
