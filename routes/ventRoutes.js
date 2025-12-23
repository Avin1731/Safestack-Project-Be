const express = require('express');
const router = express.Router();
const ventController = require('../controllers/ventController');
const authMiddleware = require('../middleware/authMiddleware');

// Route untuk melihat semua curhatan (Public/Logged in)
router.get('/', ventController.getAllVents);

// Route yang butuh login (Protected)
router.post('/', authMiddleware, ventController.createVent);
router.delete('/:id', authMiddleware, ventController.deleteVent);

module.exports = router;