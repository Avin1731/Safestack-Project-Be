require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Route
const authRoutes = require('./routes/authRoutes');
const ventRoutes = require('./routes/ventRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
// Menggunakan _err agar sesuai dengan regex linter /^[A-Z_]/u
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((_err) => console.error('❌ DB Error:', _err.message));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vents', ventRoutes);
app.use('/api/tasks', taskRoutes);

// Root Check
app.get('/', (req, res) => res.send('Server SafeTask Ready! 🚀'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));