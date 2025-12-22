const Vent = require('../models/Vent');
const { generateAnonHash } = require('../utils/hasher');

// 1. Kirim Curhatan Baru (Create)
exports.createVent = async (req, res) => {
  try {
    const { content, mood, position, color, rotation } = req.body;
    
    // Generate hash dari ID user yang sedang login (dari authMiddleware)
    const authorHash = generateAnonHash(req.user.id);

    const newVent = await Vent.create({
      content,
      mood,
      authorHash, // Simpan sebagai identitas anonim
      position,
      color,
      rotation
    });

    res.status(201).json(newVent);
  } catch (error) {
    res.status(500).json({ message: "Gagal posting curhatan" });
  }
};

// 2. Ambil Semua Curhatan (Read)
exports.getAllVents = async (req, res) => {
  try {
    // Kita tidak mengirim 'authorHash' ke frontend demi privasi
    const vents = await Vent.find().sort({ createdAt: -1 });
    res.status(200).json(vents);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data" });
  }
};

// 3. Hapus Curhatan (Hanya jika author-nya sama)
exports.deleteVent = async (req, res) => {
  try {
    const vent = await Vent.findById(req.params.id).select('+authorHash');
    
    if (!vent) return res.status(404).json({ message: "Vent tidak ditemukan" });

    const currentHash = generateAnonHash(req.user.id);
    
    // Cek apakah yang menghapus adalah pemiliknya
    if (vent.authorHash !== currentHash) {
      return res.status(403).json({ message: "Anda tidak berhak menghapus ini" });
    }

    await vent.deleteOne();
    res.status(200).json({ message: "Curhatan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Error saat menghapus" });
  }
};