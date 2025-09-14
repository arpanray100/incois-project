const Hazard = require("../models/HazardReport");

// Create a new hazard with optional media uploads
const createHazard = async (req, res) => {
  try {
    // Build media array if files exist
    let media = [];
    if (req.files && req.files.length > 0) {
      media = req.files.map(file => ({
        fileType: file.mimetype.split("/")[0], // "image", "video", "audio", etc.
        fileUrl: `/uploads/${file.filename}`,  // save relative path for browser access
        originalName: file.originalname
      }));
    }

    // ✅ Parse location if sent as string (FormData sends objects as strings)
    let locationObj;
    if (req.body.location) {
      try {
        locationObj = JSON.parse(req.body.location);
      } catch (err) {
        console.warn("Failed to parse location:", err);
        locationObj = undefined;
      }
    }

    const hazard = new Hazard({
      user: req.user ? req.user.id : null, // optional authentication
      type: req.body.type,
      description: req.body.description,
      location: locationObj,
      media,
      // 🆕 Victim details
      name: req.body.name,
      phone: req.body.phone
    });

    await hazard.save();
    res.status(201).json(hazard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all hazards
const getHazards = async (req, res) => {
  try {
    const hazards = await Hazard.find().populate("user", "name email");
    res.json(hazards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get hazard by ID
const getHazardById = async (req, res) => {
  try {
    const hazard = await Hazard.findById(req.params.id).populate("user", "name email");
    if (!hazard) return res.status(404).json({ message: "Hazard not found" });
    res.json(hazard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createHazard,
  getHazards,
  getHazardById,
};
