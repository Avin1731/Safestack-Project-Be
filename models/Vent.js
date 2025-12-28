const mongoose = require('mongoose');

const ventSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Konten curhatan harus diisi'],
    trim: true,
    maxlength: [1000, 'Curhatan maksimal 1000 karakter']
  },
  mood: {
    type: String,
    enum: ['😊', '😔', '😠', '🤯', '😭', '😴'], 
    default: '😊'
  },
  authorHash: {
    type: String,
    select: false 
  },
  // --- FITUR SOSIAL ---
  supports: [String], 
  
  // Array komentar
  comments: [{
    content: String,
    authorHash: String,
    createdAt: { type: Date, default: Date.now },
    likes: [String],

    // REPLIES DENGAN TAGGING
    replies: [{
       content: String,
       authorHash: String,
       createdAt: { type: Date, default: Date.now },
       likes: [String], // Array Like untuk Reply
       replyTo: String  // Hash user yang dibalas (Tagging)
    }]
  }],
  
  color: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vent', ventSchema);