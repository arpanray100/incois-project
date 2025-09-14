const Alert = require("../models/Alert");
const Hazard = require("../models/HazardReport");

// Create a new alert
const createAlert = async (req, res) => {
  try {
    const { message, hazard, recipients } = req.body;

    const hazardExists = await Hazard.findById(hazard);
    if (!hazardExists) return res.status(404).json({ message: "Hazard not found" });

    const alert = await Alert.create({ message, hazard, recipients });
    await alert.populate("hazard");

    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all alerts
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().populate("hazard").sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get alerts by hazard type
const getAlertsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const alerts = await Alert.find()
      .populate({
        path: "hazard",
        match: { type: type.toLowerCase() },
      })
      .sort({ createdAt: -1 });

    const filtered = alerts.filter((a) => a.hazard);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark alert as read
const markAlertAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    alert.status = "read";
    await alert.save();

    res.json({ message: "Alert marked as read", alert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export all functions
module.exports = {
  createAlert,
  getAlerts,
  getAlertsByType,
  markAlertAsRead,
};
