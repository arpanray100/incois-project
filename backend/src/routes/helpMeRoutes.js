// routes/helpMeRoutes.js
const express = require("express");
const router = express.Router();
const ResourceRequest = require("../models/ResourceRequest");
const ServiceRequest = require("../models/ServiceRequest");

// ✅ Get all Help-Me submissions (both resource + service)
// routes/helpMeRoutes.js
router.get("/submissions", async (req, res) => {
  try {
    const resources = await ResourceRequest.find().sort({ createdAt: -1 });
    const services = await ServiceRequest.find().sort({ createdAt: -1 });

    // Add type field so frontend can distinguish
    const formattedResources = resources.map(r => ({ ...r._doc, type: "resource" }));
    const formattedServices = services.map(s => ({ ...s._doc, type: "service" }));

    const allSubmissions = [...formattedResources, ...formattedServices];

    res.json(allSubmissions); // ✅ return plain array
  } catch (error) {
    res.status(500).json({ message: "Error fetching submissions", error });
  }
});


module.exports = router;
