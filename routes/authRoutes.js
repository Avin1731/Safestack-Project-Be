const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // 1. IMPORT MIDDLEWARE
const User = require('../models/User'); 

// POST /api/auth/google
router.post('/google', authController.googleLogin);

// PUT /api/auth/profile (Update Nama & Foto)
// 2. PASANG MIDDLEWARE DI SINI (sebelum async)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { displayName, photoUrl } = req.body;
    
    // Sekarang req.user.id aman karena sudah dicek authMiddleware
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      { displayName, photoUrl }, 
      { new: true }
    ).select('-password'); // Jangan balikin password
    
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal update profil" });
  }
});

module.exports = router;