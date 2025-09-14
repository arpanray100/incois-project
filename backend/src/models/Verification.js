// src/models/Verification.js
const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema({
  contact: { type: String, required: true }, // phone or email
  contactType: { type: String, enum: ["phone", "email"], required: true },
  otp: { type: String, required: true },
  verified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Verification", verificationSchema);
