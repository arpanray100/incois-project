const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  requestDetails: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
