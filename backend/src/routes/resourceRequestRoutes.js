const express = require("express");
const router = express.Router();
const { createResourceRequest, getResourceRequests } = require("../controllers/resourceRequestController");

router.post("/", createResourceRequest);
router.get("/", getResourceRequests);

module.exports = router;
