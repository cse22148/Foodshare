const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donorName: {
    type: String,
    required: true,
  },
  donorEmail: {
    type: String,
    required: true, 
  },
  foodType: {
    type: String,
    enum: ["packed", "fresh", "organic"],
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["ngo", "biogas"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Collected"],
    default: "Pending",
  },
  collectedAt: {
    type: Date,
  },
  estimatedArrival: {
    type: Date,
  },
  agentName: {
    type: String,
  },
  agentPhone: {
    type: String,
  },
  notification: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Donation", donationSchema);
