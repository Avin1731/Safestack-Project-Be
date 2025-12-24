const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, projectController.getProjects);
router.post('/', auth, projectController.createProject);
router.put('/:id/complete', auth, projectController.completeProject); // Pastikan completeProject ada

module.exports = router;