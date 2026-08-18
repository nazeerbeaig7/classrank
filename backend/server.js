const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const Admin = require('./models/Admin');
const Settings = require('./models/Settings');

// Initialize Express App
const app = express();

// Connect Database
connectDB().then(async () => {
  // Ensure default Admin exists
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('[Server] Initializing default Administrator account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('adminpassword123', salt);
      await Admin.create({
        name: 'ClassRank Admin',
        email: 'admin@classrank.edu',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('[Server] Admin created: admin@classrank.edu / adminpassword123');
    }

    // Ensure default settings exist
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({
        key: 'global_config',
        allowStudentEdits: true,
        academicYear: '2025-2026',
        departmentName: 'Computer Science & Engineering'
      });
    }
  } catch (err) {
    console.error('[Server] Initialization error:', err.message);
  }
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'ClassRank API Server',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/students', require('./routes/excelRoutes')); // import & export
app.use('/api/settings', require('./routes/settingsRoutes'));

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[ClassRank Server] Running on http://localhost:${PORT}`);
});
