const Task = require('../models/Task');

// 1. Ambil Task berdasarkan Project ID
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const query = { user: req.user.id };
    
    // Jika projectId ada, filter task spesifik project itu
    if (projectId) query.projectId = projectId;

    const tasks = await Task.find(query);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Gagal ambil task workspace' });
  }
};

// 2. Tambah Task Baru
exports.createTask = async (req, res) => {
  try {
    const { title, status, projectId, description } = req.body;
    
    const newTask = new Task({
      title,
      description,
      status: status || 'todo',
      projectId, // Wajib masukin projectId dari FE
      user: req.user.id
    });

    const savedTask = await newTask.save();
    res.json(savedTask);
  } catch (err) {
    res.status(500).json({ message: 'Gagal nambah task ke workspace' });
  }
};

// 3. Update Task (Ini yang tadi bikin crash karena undefined)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Gagal update status task' });
  }
};

// 4. Hapus Task
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tugas telah dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus tugas' });
  }
};