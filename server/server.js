/**
 * Student Portal System - Main Server
 * Express server with session management and authentication
 */

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
  secret: 'student-portal-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true
  }
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Import dependencies for authentication
const bcrypt = require('bcryptjs');
const fs = require('fs');

// POST /api/login - Authenticate student
app.post('/api/login', (req, res) => {
  const { rollNumber, password } = req.body;

  // Validate empty fields
  if (!rollNumber || !password || rollNumber.trim() === '' || password.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Roll number and password are required'
    });
  }

  try {
    // Read students data
    const studentsData = fs.readFileSync(path.join(__dirname, 'data/students.json'), 'utf8');
    const students = JSON.parse(studentsData);

    // Find student by roll number
    const student = students.find(s => s.rollNumber === rollNumber);

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid roll number or password'
      });
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, student.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid roll number or password'
      });
    }

    // Create session
    req.session.student = {
      rollNumber: student.rollNumber,
      name: student.name,
      class: student.class,
      section: student.section,
      profileIcon: student.profileIcon
    };

    // Return success
    res.json({
      success: true,
      message: 'Login successful',
      student: req.session.student
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// POST /api/logout - Destroy session
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed. Please try again.'
      });
    }
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
});

// Import authentication middleware
const authMiddleware = require('./middleware/authMiddleware');

// GET /api/student/check - Check if session is valid
app.get('/api/student/check', authMiddleware, (req, res) => {
  res.json({
    success: true,
    student: req.session.student
  });
});

// GET /api/student/:rollNumber - Get student profile data
app.get('/api/student/:rollNumber', authMiddleware, (req, res) => {
  const { rollNumber } = req.params;

  try {
    // Read students data
    const studentsData = fs.readFileSync(path.join(__dirname, 'data/students.json'), 'utf8');
    const students = JSON.parse(studentsData);

    // Find student by roll number
    const student = students.find(s => s.rollNumber === rollNumber);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Return student data (without password)
    const { password, ...studentData } = student;
    res.json({
      success: true,
      student: studentData
    });

  } catch (error) {
    console.error('Error fetching student data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// GET /api/attendance/:rollNumber - Get attendance data
app.get('/api/attendance/:rollNumber', authMiddleware, (req, res) => {
  const { rollNumber } = req.params;

  try {
    // Read attendance data
    const attendanceData = fs.readFileSync(path.join(__dirname, 'data/attendance.json'), 'utf8');
    const attendanceRecords = JSON.parse(attendanceData);

    // Find attendance by roll number
    const attendance = attendanceRecords.find(a => a.rollNumber === rollNumber);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance data not found'
      });
    }

    // Calculate percentage and absent days
    const percentage = ((attendance.presentDays / attendance.totalDays) * 100).toFixed(2);
    const absentDays = attendance.totalDays - attendance.presentDays;

    res.json({
      success: true,
      attendance: {
        ...attendance,
        percentage: parseFloat(percentage),
        absentDays: absentDays
      }
    });

  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// GET /api/timetable - Get weekly timetable
app.get('/api/timetable', authMiddleware, (req, res) => {
  try {
    // Read timetable data
    const timetableData = fs.readFileSync(path.join(__dirname, 'data/timetable.json'), 'utf8');
    const timetable = JSON.parse(timetableData);

    res.json({
      success: true,
      timetable: timetable
    });

  } catch (error) {
    console.error('Error fetching timetable data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// GET /api/reportcard/:rollNumber - Get report card data
app.get('/api/reportcard/:rollNumber', authMiddleware, (req, res) => {
  const { rollNumber } = req.params;

  try {
    // Read report card data
    const reportCardData = fs.readFileSync(path.join(__dirname, 'data/reportcards.json'), 'utf8');
    const reportCards = JSON.parse(reportCardData);

    // Find report card by roll number
    const reportCard = reportCards.find(r => r.rollNumber === rollNumber);

    if (!reportCard) {
      return res.status(404).json({
        success: false,
        message: 'Report card not found'
      });
    }

    // Check if it's a credit-based system or marks-based system
    const isCreditBased = reportCard.subjects[0].hasOwnProperty('credits');

    if (isCreditBased) {
      // Calculate SGPA for credit-based system
      const gradePoints = {
        'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0
      };

      let totalCredits = 0;
      let totalGradePoints = 0;

      reportCard.subjects.forEach(subject => {
        const credits = subject.credits;
        const gradePoint = gradePoints[subject.grade] || 0;
        totalCredits += credits;
        totalGradePoints += credits * gradePoint;
      });

      const sgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

      res.json({
        success: true,
        reportCard: {
          ...reportCard,
          totalCredits: totalCredits,
          sgpa: parseFloat(sgpa),
          isCreditBased: true
        }
      });
    } else {
      // Calculate total marks, percentage, and grade for marks-based system
      let totalObtained = 0;
      let totalMax = 0;

      reportCard.subjects.forEach(subject => {
        totalObtained += subject.obtainedMarks;
        totalMax += subject.maxMarks;
      });

      const percentage = ((totalObtained / totalMax) * 100).toFixed(2);
      
      // Calculate grade based on percentage
      let grade;
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D';
      else grade = 'F';

      res.json({
        success: true,
        reportCard: {
          ...reportCard,
          totalMarks: totalObtained,
          maxMarks: totalMax,
          percentage: parseFloat(percentage),
          grade: grade,
          isCreditBased: false
        }
      });
    }

  } catch (error) {
    console.error('Error fetching report card data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// GET /api/fees/:rollNumber - Get fee status data
app.get('/api/fees/:rollNumber', authMiddleware, (req, res) => {
  const { rollNumber } = req.params;

  try {
    // Read fees data
    const feesData = fs.readFileSync(path.join(__dirname, 'data/fees.json'), 'utf8');
    const feesRecords = JSON.parse(feesData);

    // Find fees by roll number
    const fees = feesRecords.find(f => f.rollNumber === rollNumber);

    if (!fees) {
      return res.status(404).json({
        success: false,
        message: 'Fee information not found'
      });
    }

    // Calculate pending amount and determine status
    const pendingAmount = fees.totalFees - fees.paidAmount;
    const status = pendingAmount === 0 ? 'Paid' : 'Due';

    res.json({
      success: true,
      fees: {
        ...fees,
        pendingAmount: pendingAmount,
        status: status
      }
    });

  } catch (error) {
    console.error('Error fetching fees data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Start Server (only if not in test mode)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Student Portal Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
