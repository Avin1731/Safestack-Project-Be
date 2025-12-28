const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Route Publik (Tidak perlu Auth/Login karena visitor counter biasanya umum)
router.put('/visit', analyticsController.recordVisit);

module.exports = router;