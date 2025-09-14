const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
    createAlert,
    getAlerts,
    getAlertsByType,
    markAlertAsRead
} = require('../controllers/alertController');

// Create a new alert
router.post('/', protect, createAlert);

// Get all alerts
router.get('/', protect, getAlerts);

// Get alerts by hazard type
router.get('/type/:type', protect, getAlertsByType);

// Mark alert as read
router.patch('/:id/read', protect, markAlertAsRead);

module.exports = router;
