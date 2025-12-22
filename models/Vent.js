const mongoose = require('mongoose');

const VentSchema = new mongoose.Schema({
  content: { type: String, required: true, maxLength: 500 },
  mood: { type: String, required: true }, // Emoji
  authorHash: { type: String, required: true, select: false }, // Anonim logic

  // Posisi Canvas (X, Y)
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  rotation: { type: Number, default: 0 },
  color: { type: String, default: '#fff740' }, // Warna kertas

  replies: [{
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vent', VentSchema);