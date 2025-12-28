const express = require('express');
const router = express.Router();
const ventController = require('../controllers/ventController');
const authMiddleware = require('../middleware/authMiddleware');

// --- Routes ---

// Stats
router.get('/stats', authMiddleware, ventController.getVoidStats);

// Get All
router.get('/', authMiddleware, ventController.getAllVents);

// Protected Actions (Vent Utama)
router.post('/', authMiddleware, ventController.createVent);
router.delete('/:id', authMiddleware, ventController.deleteVent);
router.put('/:id/support', authMiddleware, ventController.toggleSupport);
router.post('/:id/comments', authMiddleware, ventController.addComment);

// --- COMMENT & REPLY ROUTES ---
router.put('/:ventId/comments/:commentId/like', authMiddleware, ventController.toggleCommentLike);
router.post('/:ventId/comments/:commentId/reply', authMiddleware, ventController.replyToComment);
router.put('/:ventId/comments/:commentId/replies/:replyId/like', authMiddleware, ventController.toggleReplyLike);

module.exports = router;