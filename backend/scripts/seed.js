const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const Settings = require('../models/Settings');

const sampleStudents = [
  // 0 Backlogs
  { rollNumber: '23JD1A0501', name: 'Aarav Sharma', email: 'aarav.sharma@student.classrank.edu', backlogCount: 0, cgpa: 9.60, percentage: 91.20 },
  { rollNumber: '23JD1A0502', name: 'Ananya Patel', email: 'ananya.patel@student.classrank.edu', backlogCount: 0, cgpa: 9.45, percentage: 89.50 },
  { rollNumber: '23JD1A0503', name: 'Rohan Verma', email: 'rohan.verma@student.classrank.edu', backlogCount: 0, cgpa: 9.30, percentage: 88.00 },
  { rollNumber: '23JD1A0504', name: 'Diya Rao', email: 'diya.rao@student.classrank.edu', backlogCount: 0, cgpa: 9.10, percentage: 86.40 },
  { rollNumber: '23JD1A0505', name: 'Kiran Kumar', email: 'kiran.kumar@student.classrank.edu', backlogCount: 0, cgpa: 8.90, percentage: 84.55 },
  { rollNumber: '23JD1A0506', name: 'Priya Reddy', email: 'priya.reddy@student.classrank.edu', backlogCount: 0, cgpa: 8.75, percentage: 83.10 },
  
  // 1 Backlog (Note: Student D has high percentage 92.5%, but 1 backlog, so ranks after 0 backlogs!)
  { rollNumber: '23JD1A0507', name: 'Devendra Singh', email: 'devendra.singh@student.classrank.edu', backlogCount: 1, cgpa: 9.50, percentage: 92.50 },
  { rollNumber: '23JD1A0508', name: 'Esha Gupta', email: 'esha.gupta@student.classrank.edu', backlogCount: 1, cgpa: 8.90, percentage: 85.00 },
  { rollNumber: '23JD1A0509', name: 'Farhan Khan', email: 'farhan.khan@student.classrank.edu', backlogCount: 1, cgpa: 8.40, percentage: 81.20 },
  { rollNumber: '23JD1A0510', name: 'Gautam Iyer', email: 'gautam.iyer@student.classrank.edu', backlogCount: 1, cgpa: 8.10, percentage: 77.80 },

  // 2 Backlogs
  { rollNumber: '23JD1A0511', name: 'Harini Sundaram', email: 'harini.sundaram@student.classrank.edu', backlogCount: 2, cgpa: 8.80, percentage: 83.50 },
  { rollNumber: '23JD1A0512', name: 'Ishaan Malhotra', email: 'ishaan.malhotra@student.classrank.edu', backlogCount: 2, cgpa: 7.90, percentage: 75.00 },
  { rollNumber: '23JD1A0513', name: 'Jaya Lakshmi', email: 'jaya.lakshmi@student.classrank.edu', backlogCount: 2, cgpa: 7.50, percentage: 71.30 },

  // 3+ Backlogs
  { rollNumber: '23JD1A0514', name: 'Karthik Raja', email: 'karthik.raja@student.classrank.edu', backlogCount: 3, cgpa: 7.80, percentage: 74.20 },
  { rollNumber: '23JD1A0515', name: 'Leela Nambiar', email: 'leela.nambiar@student.classrank.edu', backlogCount: 4, cgpa: 6.90, percentage: 65.40 }
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Student.deleteMany({});
    await Admin.deleteMany({});
    await Settings.deleteMany({});

    console.log('[Seed] Seeding Admin user...');
    const adminSalt = await bcrypt.genSalt(10);
    const adminHashedPassword = await bcrypt.hash('adminpassword123', adminSalt);
    
    await Admin.create({
      name: 'System Admin',
      email: 'admin@classrank.edu',
      password: adminHashedPassword,
      role: 'admin'
    });

    console.log('[Seed] Seeding sample students...');
    const studentSalt = await bcrypt.genSalt(10);

    const hashedStudents = await Promise.all(
      sampleStudents.map(async (s) => ({
        ...s,
        password: await bcrypt.hash(`Student@${s.rollNumber}`, studentSalt),
        canEditSelf: true
      }))
    );

    await Student.insertMany(hashedStudents);

    console.log('[Seed] Seeding default settings...');
    await Settings.create({
      key: 'global_config',
      allowStudentEdits: true,
      academicYear: '2025-2026',
      departmentName: 'Computer Science & Engineering'
    });

    console.log('✅ Database seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('🔑 Admin Credentials:');
    console.log('   Email:    admin@classrank.edu');
    console.log('   Password: adminpassword123');
    console.log('----------------------------------------------------');
    console.log('🎓 Sample Student Credentials:');
    console.log('   Roll No:  23JD1A0501 (Aarav Sharma)');
    console.log('   Password: Student@23JD1A0501');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
