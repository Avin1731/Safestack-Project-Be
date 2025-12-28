require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. Import Route
const authRoutes = require('./routes/authRoutes');
const ventRoutes = require('./routes/ventRoutes');
const taskRoutes = require('./routes/taskRoutes');
const projectRoutes = require('./routes/projectRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes'); // <--- TAMBAHAN UNTUK VISITOR COUNTER

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Koneksi Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((_err) => console.error('❌ DB Error:', _err.message));

// 2. Daftarkan Routes
app.use('/api/auth', authRoutes);
app.use('/api/vents', ventRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analytics', analyticsRoutes); // <--- DAFTARKAN RUTE DI SINI

app.get('/', (req, res) => res.send('Server SafeTask Ready! 🚀'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));