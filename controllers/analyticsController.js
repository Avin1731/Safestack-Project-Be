const SiteStat = require('../models/SiteStat');

exports.getGlobalStats = async (req, res) => {
  try {
    // HANYA MEMBACA (FIND), TIDAK ADA UPDATE
    let stat = await SiteStat.findOne({ identifier: 'global_counter' });
    
    // Jika belum ada data, kembalikan 0 (jangan create baru di sini biar bersih)
    const visits = stat ? stat.visits : 0;

    res.status(200).json({ visits });
  } catch (error) {
    console.error("Analytics Error:", error);
    // Return 0 agar frontend tidak error
    res.status(200).json({ visits: 0 }); 
  }
};