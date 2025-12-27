const Vent = require('../models/Vent');
const { generateAnonHash } = require('../utils/hasher');

// 1. Kirim Curhatan
exports.createVent = async (req, res) => {
  try {
    const { content, mood, color } = req.body;
    if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized" });

    const authorHash = generateAnonHash(req.user.id);

    const newVent = await Vent.create({
      content, mood, authorHash, color
    });

    res.status(201).json({ ...newVent.toObject(), isOwner: true });
  } catch (error) {
    res.status(500).json({ message: "Gagal memposting." });
  }
};

// 2. Ambil Semua (Dengan Filter & Sort)
exports.getAllVents = async (req, res) => {
  try {
    const { filter, sort } = req.query; 
    const currentHash = req.user ? generateAnonHash(req.user.id) : null;

    let query = {};
    if (filter && filter !== 'all') {
        query.mood = filter;
    }

    // Logic Sort
    let sortOption = { createdAt: -1 }; 
    // Note: Sort by array length via Mongoose find() is limited. 
    // Untuk performa terbaik di production harusnya pakai aggregate, 
    // tapi untuk MVP ini kita handle sort array di memori JS di bawah.

    const vents = await Vent.find(query).select('+authorHash').sort({ createdAt: -1 });

    let sanitizedVents = vents.map(v => {
      const ventObj = v.toObject();
      const isOwner = currentHash && ventObj.authorHash === currentHash;
      const isSupported = currentHash && ventObj.supports.includes(currentHash);

      delete ventObj.authorHash;
      return { 
          ...ventObj, 
          isOwner, 
          isSupported, 
          supportCount: ventObj.supports.length,
          commentCount: ventObj.comments.length
      };
    });

    // Manual Sort in Memory
    if (sort === 'supported') {
        sanitizedVents.sort((a, b) => b.supportCount - a.supportCount);
    } else if (sort === 'discussed') {
        sanitizedVents.sort((a, b) => b.commentCount - a.commentCount);
    }

    res.status(200).json(sanitizedVents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data" });
  }
};

// 3. Toggle Support (Otot)
exports.toggleSupport = async (req, res) => {
    try {
        const vent = await Vent.findById(req.params.id);
        const userHash = generateAnonHash(req.user.id);

        const index = vent.supports.indexOf(userHash);
        if (index === -1) {
            vent.supports.push(userHash);
        } else {
            vent.supports.splice(index, 1);
        }

        await vent.save();
        res.status(200).json({ 
            isSupported: index === -1, 
            supportCount: vent.supports.length 
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal berinteraksi" });
    }
};

// 4. Kirim Komentar
exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const vent = await Vent.findById(req.params.id);
        const userHash = generateAnonHash(req.user.id);

        vent.comments.push({
            content,
            authorHash: userHash
        });

        await vent.save();
        res.status(201).json(vent.comments);
    } catch (error) {
        res.status(500).json({ message: "Gagal berkomentar" });
    }
};

// 5. Hapus Vent
exports.deleteVent = async (req, res) => {
    try {
      const vent = await Vent.findById(req.params.id).select('+authorHash');
      if (!vent) return res.status(404).json({ message: "Vent tidak ditemukan" });
  
      const currentHash = generateAnonHash(req.user.id);
      if (vent.authorHash !== currentHash) {
        return res.status(403).json({ message: "Anda tidak berhak menghapus ini" });
      }
  
      await vent.deleteOne();
      res.status(200).json({ message: "Curhatan berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ message: "Error saat menghapus" });
    }
};

// 6. GET STATS (COUNTER & TRENDING) -- BARU
exports.getVoidStats = async (req, res) => {
  try {
    // A. Hitung Jumlah per Mood
    const moodCounts = await Vent.aggregate([
      { $group: { _id: "$mood", count: { $sum: 1 } } }
    ]);

    // Format object: { '😊': 5, all: 20 }
    const stats = { all: 0 };
    moodCounts.forEach(item => {
      stats[item._id] = item.count;
      stats.all += item.count;
    });

    // B. Logika Pojok Peduli
    // 1. Need Love: Mood sedih/stress, support 0, ambil terbaru
    const needLove = await Vent.findOne({
       mood: { $in: ['😔', '😭', '🤯', '😴'] },
       supports: { $size: 0 } 
    }).sort({ createdAt: -1 });

    // 2. Top Supported: Support terbanyak
    const topSupported = await Vent.aggregate([
        { $addFields: { supportLen: { $size: "$supports" } } },
        { $sort: { supportLen: -1 } },
        { $limit: 1 }
    ]);

    res.status(200).json({
      counts: stats,
      trending: {
        needLove: needLove || null,
        topSupported: topSupported[0] || null
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal ambil stats" });
  }
};