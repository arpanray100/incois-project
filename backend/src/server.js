const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Connect
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("INCOIS Backend API running ✅");
});

// Serve static uploads (for hazard media files)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/hazards", require("./routes/hazardRoutes"));
app.use("/api/alerts", require("./routes/alertRoutes")); // added alerts route
app.use("/api/locations", require("./routes/locationRoutes")); // new locations route
app.use("/api/resource-request", require("./routes/resourceRequestRoutes"));
app.use("/api/service-request", require("./routes/serviceRequestRoutes"));
app.use("/api/help-me", require("./routes/helpMeRoutes"));


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
}); 