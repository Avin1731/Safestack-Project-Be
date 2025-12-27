const express = require('express');
const router = express.Router();
const ventController = require('../controllers/ventController');
const authMiddleware = require('../middleware/authMiddleware');

// --- ROUTE BARU: STATS (Letakkan paling atas) ---
router.get('/stats', authMiddleware, ventController.getVoidStats);

// Get All
router.get('/', authMiddleware, ventController.getAllVents);

// Protected Actions
router.post('/', authMiddleware, ventController.createVent);
router.delete('/:id', authMiddleware, ventController.deleteVent);

// Interaksi
router.put('/:id/support', authMiddleware, ventController.toggleSupport);
router.post('/:id/comments', authMiddleware, ventController.addComment);

module.exports = router;