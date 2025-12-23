const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    // 1. Verifikasi token dari Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    // 2. Cari user di DB, kalau ga ada bikin baru
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({
        googleId,
        email,
        displayName: name,
        photoUrl: picture,
      });
    }

    // 3. Buat JWT Token buat session aplikasi kita sendiri
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
      }
    });

  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ message: "Login Google Gagal / Token Invalid" });
  }
};