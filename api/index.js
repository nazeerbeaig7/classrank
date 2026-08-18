const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const connectDB = require('../backend/config/db');
const errorHandler = require('../backend/middleware/errorMiddleware');
const Admin = require('../backend/models/Admin');
const Settings = require('../backend/models/Settings');

const app = express();

// Connect Database (connection is cached across serverless invocations)
let isConnected = false;
const ensureDB = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;

    // Ensure default Admin exists
    try {
      const adminCount = await Admin.countDocuments();
      if (adminCount === 0) {
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
  }
};

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', app: 'ClassRank API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', require('../backend/routes/authRoutes'));
app.use('/api/students', require('../backend/routes/studentRoutes'));
app.use('/api/leaderboard', require('../backend/routes/leaderboardRoutes'));
app.use('/api/dashboard', require('../backend/routes/dashboardRoutes'));
app.use('/api/students', require('../backend/routes/excelRoutes'));
app.use('/api/settings', require('../backend/routes/settingsRoutes'));

app.use(errorHandler);

// Serverless export
module.exports = async (req, res) => {
  await ensureDB();
  return app(req, res);
};
