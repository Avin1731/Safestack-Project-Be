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

// 2. Ambil Semua (Modified for isMine Logic)
exports.getAllVents = async (req, res) => {
  try {
    const { filter, sort } = req.query; 
    const currentHash = req.user ? generateAnonHash(req.user.id) : null;

    let query = {};
    if (filter && filter !== 'all') {
        query.mood = filter;
    }

    const vents = await Vent.find(query).select('+authorHash').sort({ createdAt: -1 });

    let sanitizedVents = vents.map(v => {
      const ventObj = v.toObject();
      const isOwner = currentHash && ventObj.authorHash === currentHash;
      const isSupported = currentHash && ventObj.supports.includes(currentHash);

      // Process Comments to inject isMine flag
      const processedComments = ventObj.comments.map(c => {
          const isCommentMine = currentHash && c.authorHash === currentHash;
          const isCommentOP = c.authorHash === ventObj.authorHash;

          const processedReplies = c.replies.map(r => {
              const isReplyMine = currentHash && r.authorHash === currentHash;
              const isReplyOP = r.authorHash === ventObj.authorHash;
              return {
                  ...r,
                  isMine: isReplyMine,
                  isOP: isReplyOP
              };
          });

          return {
              ...c,
              isMine: isCommentMine,
              isOP: isCommentOP,
              replies: processedReplies
          };
      });

      delete ventObj.authorHash; // Hide main vent author hash
      // Note: We keep comment/reply authorHash visible for Avatar generation

      return { 
          ...ventObj, 
          comments: processedComments,
          isOwner, 
          isSupported, 
          supportCount: ventObj.supports.length,
          commentCount: ventObj.comments.length
      };
    });

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

// 3. Toggle Support
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
            authorHash: userHash,
            likes: [],
            replies: []
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

// 6. Get Stats
exports.getVoidStats = async (req, res) => {
  try {
    const moodCounts = await Vent.aggregate([
      { $group: { _id: "$mood", count: { $sum: 1 } } }
    ]);

    const stats = { all: 0 };
    moodCounts.forEach(item => {
      stats[item._id] = item.count;
      stats.all += item.count;
    });

    const needLove = await Vent.findOne({
       mood: { $in: ['😔', '😭', '🤯', '😴'] },
       supports: { $size: 0 } 
    }).sort({ createdAt: -1 });

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

// 7. Toggle Like Komentar
exports.toggleCommentLike = async (req, res) => {
    try {
        const { ventId, commentId } = req.params;
        const userHash = generateAnonHash(req.user.id);
        const vent = await Vent.findById(ventId);

        if (!vent) return res.status(404).json({ message: "Vent not found" });

        const comment = vent.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        const index = comment.likes.indexOf(userHash);
        if (index === -1) {
            comment.likes.push(userHash);
        } else {
            comment.likes.splice(index, 1);
        }

        await vent.save();
        res.status(200).json(vent.comments);
    } catch (error) {
        res.status(500).json({ message: "Gagal like komentar" });
    }
};

// 8. Reply Komentar (With Tagging)
exports.replyToComment = async (req, res) => {
    try {
        const { ventId, commentId } = req.params;
        const { content, replyTo } = req.body; // replyTo is hash of target user
        const userHash = generateAnonHash(req.user.id);
        const vent = await Vent.findById(ventId);

        if (!vent) return res.status(404).json({ message: "Vent not found" });

        const comment = vent.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        comment.replies.push({
            content,
            authorHash: userHash,
            replyTo: replyTo || null,
            likes: []
        });

        await vent.save();
        res.status(201).json(vent.comments);
    } catch (error) {
        res.status(500).json({ message: "Gagal membalas komentar" });
    }
};

// 9. Toggle Like Reply
exports.toggleReplyLike = async (req, res) => {
    try {
        const { ventId, commentId, replyId } = req.params;
        const userHash = generateAnonHash(req.user.id);
        const vent = await Vent.findById(ventId);

        if (!vent) return res.status(404).json({ message: "Vent not found" });

        const comment = vent.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        const reply = comment.replies.id(replyId);
        if (!reply) return res.status(404).json({ message: "Reply not found" });

        const index = reply.likes.indexOf(userHash);
        if (index === -1) {
            reply.likes.push(userHash);
        } else {
            reply.likes.splice(index, 1);
        }

        await vent.save();
        res.status(200).json(vent.comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gagal like reply" });
    }
};