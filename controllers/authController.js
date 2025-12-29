const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// IMPORT SITE STAT
const SiteStat = require('../models/SiteStat'); 

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

    // --- LOGIC TAMBAHAN: INCREMENT VISITOR COUNT ---
    // Hanya dijalankan jika login berhasil
    try {
        await SiteStat.findOneAndUpdate(
            { identifier: 'global_counter' },
            { $inc: { visits: 1 } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
    } catch (statError) {
        console.error("Gagal update statistik:", statError);
        // Error statistik jangan sampai menggagalkan login user
    }
    // -----------------------------------------------

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
        quote: user.quote, 
        role: user.role
      }
    });

  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ message: "Login Google Gagal / Token Invalid" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { displayName, photoUrl, quote } = req.body;

    if (!displayName || displayName.trim() === "") {
      return res.status(400).json({ message: "Nama tampilan wajib diisi" });
    }

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