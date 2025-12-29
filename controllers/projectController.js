const Project = require('../models/Project');
const Task = require('../models/Task');

// 1. Get All Projects + Stats
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
    
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

// 2. Get Single Project Detail (FIX UNTUK ERROR GET)
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!project) {
      return res.status(404).json({ message: 'Project tidak ditemukan atau bukan milikmu' });
    }

    const tasks = await Task.find({ projectId: project._id });
    res.json({
      ...project._doc,
      id: project._id,
      task_stats: {
        todo: tasks.filter(t => t.status === 'todo').length,
        ongoing: tasks.filter(t => t.status === 'in-progress').length,
        done: tasks.filter(t => t.status === 'done').length,
        total: tasks.length
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// 3. Create Project
exports.createProject = async (req, res) => {
  try {
    const newProject = new Project({
      name: req.body.name,
      user: req.user.id,
      themeColor: req.body.themeColor || '#CCD5AE'
    });
    const savedProject = await newProject.save();
    res.json(savedProject);
  } catch (err) {
    res.status(500).json({ message: 'Gagal buat project' });
  }
};

// 4. Update Project Status
exports.updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
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
    res.status(500).json({ message: 'Gagal update status project' });
  }
};

// 5. Delete Project (FIX UNTUK ERROR DELETE)
exports.deleteProject = async (req, res) => {
  try {
    // Hapus project-nya
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!project) {
      return res.status(404).json({ message: 'Project tidak ditemukan atau bukan milikmu' });
    }

    // Bersihkan juga semua task yang ada di dalam project ini
    await Task.deleteMany({ projectId: req.params.id });

    res.json({ message: 'Project dan semua tugas di dalamnya berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus project' });
  }
};