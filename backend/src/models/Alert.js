// models/Alert.js
const mongoose = require('mongoose');

const alertSchema = mongoose.Schema({
    message: { type: String, required: true },
    hazard: { type: mongoose.Schema.Types.ObjectId, ref: 'HazardReport' },
    recipients: [String], // e.g., emails or user IDs
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
