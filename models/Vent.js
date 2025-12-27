const mongoose = require('mongoose');

const ventSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Konten curhatan harus diisi'],
    trim: true,
    maxlength: [1000, 'Curhatan maksimal 1000 karakter'] // Kita perbanyak dikit biar lega
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
  // --- FITUR SOSIAL (Tanpa Username) ---
  // Array berisi authorHash orang yang klik tombol "Otot/Semangat"
  supports: [String], 
  
  // Array komentar
  comments: [{
    content: String,
    authorHash: String, // Tetap anonim, tapi biar tau mana OP mana komentator
    createdAt: { type: Date, default: Date.now }
  }],
  // -------------------------------------
  
  color: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vent', ventSchema);