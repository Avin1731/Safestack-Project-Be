const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/authMiddleware');

// Semua rute project wajib login
router.use(auth);

router.route('/')
    .get(projectController.getProjects)
    .post(projectController.createProject);

router.route('/:id')
    .get(projectController.getProjectById) // Tambahan untuk detail proyek
    .patch(projectController.updateProjectStatus)
    .delete(projectController.deleteProject); // Tambahan fitur hapus proyek

module.exports = router;