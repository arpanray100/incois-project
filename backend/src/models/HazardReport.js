const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  fileType: { type: String },    // "image" | "video" | "audio" | "doc"
  fileUrl: { type: String },     // stored path or cloud URL
  originalName: { type: String } // original uploaded filename
});

const hazardReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: [
      "tsunami",
      "storm surge",
      "high waves",
      "swell surge",
      "flooding",
      "flood",
      "earthquake",
      "fire",
      "cyclone",
      "other"
    ],
    required: true,
    lowercase: true,
  },
  description: { type: String, required: true },
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  // Supports multiple files
  media: [mediaSchema],

  // 🆕 Victim details
  name: { type: String, required: true },   // Victim’s name
  phone: { type: String, required: true },  // Victim’s phone number

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("HazardReport", hazardReportSchema);
