const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, projectController.getProjects);
router.post('/', auth, projectController.createProject);

// FIX: Ganti jadi PATCH /:id biar match sama frontend hook
router.patch('/:id', auth, projectController.updateProjectStatus); 

module.exports = router;