const Location = require("../models/Location");

// Get all locations (shelters and NGOs)
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getLocations };
