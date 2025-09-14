const express = require("express");
const router = express.Router();
const { createServiceRequest, getServiceRequests } = require("../controllers/serviceRequestController");

router.post("/", createServiceRequest);
router.get("/", getServiceRequests);

module.exports = router;
