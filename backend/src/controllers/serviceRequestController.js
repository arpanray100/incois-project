const ServiceRequest = require("../models/ServiceRequest");

// Submit new service request
exports.createServiceRequest = async (req, res) => {
  try {
    const request = new ServiceRequest(req.body);
    await request.save();
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all service requests
exports.getServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
