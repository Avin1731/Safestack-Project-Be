const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Menggunakan .route() agar konsisten dengan modul rute lainnya
router.route('/visit')
    .put(analyticsController.recordVisit);

module.exports = router;