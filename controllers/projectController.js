const Project = require('../models/Project');
const Task = require('../models/Task');

// 1. Get Projects + Stats (Ini udah bener logic-nya)
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 }); // Tambah sort biar yang baru diatas
    
    const projectWithStats = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ projectId: project._id });
      return {
        ...project._doc,
        id: project._id,
        task_stats: {
          todo: tasks.filter(t => t.status === 'todo').length,
          ongoing: tasks.filter(t => t.status === 'in-progress').length,
          done: tasks.filter(t => t.status === 'done').length,
          total: tasks.length
        }
      };
    }));

    res.json(projectWithStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 2. Create Project (Udah bener)
exports.createProject = async (req, res) => {
  try {
    const newProject = new Project({
      name: req.body.name,
      user: req.user.id,
      themeColor: req.body.themeColor || '#CCD5AE' // Opsional: kalo mau simpen warna tema
    });
    const savedProject = await newProject.save();
    res.json(savedProject);
  } catch (err) {
    res.status(500).json({ message: 'Gagal buat project' });
  }
};

// 3. Update Project Status (FIXED & SECURE)
exports.updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body; // Ambil status dari body kiriman frontend

    // SECURITY: Pastikan yang diupdate punya user yang login (req.user.id)
    // Jangan pakai findByIdAndUpdate doang, nanti orang lain bisa nembak ID project lo
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, 
      { status: status || 'completed' }, 
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project tidak ditemukan atau bukan milikmu' });
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal update status project' });
  }
};