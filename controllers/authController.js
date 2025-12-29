const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Login via Google OAuth
 */
exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({
        googleId,
        email,
        displayName: name,
        photoUrl: picture,
        quote: "Let's make things happen.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Login Berhasil",
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoUrl: user.photoUrl,
        quote: user.quote, // Return quote
        role: user.role
      }
    });

  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ message: "Login Google Gagal / Token Invalid" });
  }
};

/**
 * Update Profil User (Nama, Foto, Quote)
 */
exports.updateProfile = async (req, res) => {
  try {
    // Ambil data dari body
    const { displayName, photoUrl, quote } = req.body;

    if (!displayName || displayName.trim() === "") {
      return res.status(400).json({ message: "Nama tampilan wajib diisi" });
    }

    // Update dan return data baru (new: true)
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      { displayName, photoUrl, quote }, 
      { new: true, runValidators: true }
    ).select('-password'); 

    if (!updatedUser) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    res.status(200).json({
      message: "Profil berhasil diperbarui",
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        photoUrl: updatedUser.photoUrl,
        quote: updatedUser.quote,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat memperbarui profil" });
  }
};