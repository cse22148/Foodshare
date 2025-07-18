const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const authMiddleware = require("./middleware/authMiddleware");


const donationRoutes = require("./routes/donation.routes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);


app.use("/api/donations", authMiddleware, donationRoutes);


app.get('/api/test', (req, res) => {
  res.json({ message: "API is working!" });
});


app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});


app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB error:", err));
