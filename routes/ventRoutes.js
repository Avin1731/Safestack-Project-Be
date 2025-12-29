const express = require('express');
const router = express.Router();
const ventController = require('../controllers/ventController');
const auth = require('../middleware/authMiddleware');

// Proteksi global
router.use(auth);

// --- 1. Statistik & List ---
router.get('/stats', ventController.getVoidStats);
router.get('/', ventController.getAllVents);

// --- 2. Operasi Utama Vent ---
router.post('/', ventController.createVent);

// HAPUS / DELETE Vent (URL: /vents/:id)
router.delete('/:id', ventController.deleteVent);

// FIX: Tambahkan '/support' di URL agar cocok dengan Frontend (URL: /vents/:id/support)
router.put('/:id/support', ventController.toggleSupport); 

// --- 3. Komentar & Like ---
router.post('/:id/comments', ventController.addComment);
router.put('/:ventId/comments/:commentId/like', ventController.toggleCommentLike);

// --- 4. Sistem Balasan (Replies) ---
router.route('/:ventId/comments/:commentId/reply')
    .post(ventController.replyToComment);

router.put('/:ventId/comments/:commentId/replies/:replyId/like', ventController.toggleReplyLike);

module.exports = router;