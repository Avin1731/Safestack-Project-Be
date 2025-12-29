const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// --- Rute Publik ---
router.post('/google', authController.googleLogin);

// --- Rute Terproteksi ---
// Menggunakan router.route agar rapi jika kedepannya ada GET /profile
router.route('/profile')
    .put(auth, authController.updateProfile); 

module.exports = router;