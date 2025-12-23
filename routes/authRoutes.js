const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/User'); 

// POST /api/auth/google
router.post('/google', authController.googleLogin);

// PUT /api/auth/profile (Update Nama & Foto Kustom SafeTask)
router.put('/profile', async (req, res) => {
  try {
    const { displayName, photoUrl } = req.body;
    // req.user.id berasal dari auth middleware
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      { displayName, photoUrl }, 
      { new: true }
    );
    res.json(updatedUser);
  } catch {
    res.status(500).json({ message: "Gagal update profil" });
  }
});

module.exports = router;