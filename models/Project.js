const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
}, { 
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

// Virtual untuk narik tasks yang berhubungan dengan project ini
ProjectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId'
});

module.exports = mongoose.model('Project', ProjectSchema);