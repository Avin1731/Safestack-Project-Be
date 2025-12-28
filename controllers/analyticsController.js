const SiteStat = require('../models/SiteStat');

exports.recordVisit = async (req, res) => {
  try {
    // Cari dokumen stats, kalau belum ada buat baru (upsert: true)
    // Lalu increment visits +1 secara atomik
    const stat = await SiteStat.findOneAndUpdate(
      { identifier: 'global_counter' },
      { $inc: { visits: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ visits: stat.visits });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Gagal mencatat kunjungan" });
  }
};