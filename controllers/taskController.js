const Task = require('../models/Task');

// Ambil semua task milik user yang sedang login
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data task" });
  }
};

// Buat task baru
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;
    const newTask = await Task.create({
      userId: req.user.id,
      title,
      description,
      status,
      priority
    });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat task" });
  }
};

// Update task (pindah status atau edit isi)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task tidak ditemukan" });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Gagal update task" });
  }
};

// Hapus task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) return res.status(404).json({ message: "Task tidak ditemukan" });
    res.status(200).json({ message: "Task berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus task" });
  }
};