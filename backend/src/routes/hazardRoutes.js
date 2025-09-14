const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  createHazard,
  getHazards,
  getHazardById
} = require("../controllers/hazardController");

// ⚡ Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // files saved to /uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 🆕 Hazard Report API Routes
// Victim submits: type, description, location, name, phone (+ optional files)
router.post("/", upload.array("media", 5), createHazard); // allow up to 5 files

// Fetch all hazards
router.get("/", getHazards);

// Fetch single hazard by ID
router.get("/:id", getHazardById);

module.exports = router;
