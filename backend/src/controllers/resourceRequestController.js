const ResourceRequest = require("../models/ResourceRequest");

// Submit new resource request
exports.createResourceRequest = async (req, res) => {
  try {
    const request = new ResourceRequest(req.body);
    await request.save();
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all resource requests
exports.getResourceRequests = async (req, res) => {
  try {
    const requests = await ResourceRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
