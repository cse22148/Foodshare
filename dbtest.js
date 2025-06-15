require('dotenv').config();
const mongoose = require('mongoose');

console.log("Connecting to:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(" MongoDB connected successfully");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error(" MongoDB connection failed", err.message);
  });
