// (Gak perlu diubah, code lo udah bener)
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  // Opsional: Tambah field warna biar gallery makin cantik
  themeColor: { type: String, default: '#FAEDCE' }, 
  createdAt: { type: Date, default: Date.now }
}, { 
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

ProjectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId'
});

module.exports = mongoose.model('Project', ProjectSchema);