const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Ubah ke GET karena sifatnya sekarang hanya mengambil data
router.get('/visit', analyticsController.getGlobalStats);

module.exports = router;