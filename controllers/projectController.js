const Project = require('../models/Project');
const Task = require('../models/Task');

// 1. Ambil semua Project + Stats buat Rainbow Bar
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id });
    
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
    res.status(500).json({ message: 'Server Error pas ambil projects' });
  }
};

// 2. Buat Project Baru
exports.createProject = async (req, res) => {
  try {
    const newProject = new Project({
      name: req.body.name,
      user: req.user.id
    });
    const savedProject = await newProject.save();
    res.json(savedProject);
  } catch (err) {
    res.status(500).json({ message: 'Gagal bikin project baru' });
  }
};

// 3. Selesaikan Project (Update Status ke Completed)
exports.completeProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id, 
      { status: 'completed' }, 
      { new: true }
    );
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Gagal selesaikan project' });
  }
};