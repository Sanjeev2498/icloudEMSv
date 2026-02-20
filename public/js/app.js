/**
 * Student Portal - Client-side JavaScript
 */

// Login functionality
if (document.getElementById('loginForm')) {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const rollNumber = document.getElementById('rollNumber').value;
    const password = document.getElementById('password').value;

    // Clear previous error
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rollNumber, password })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to dashboard
        window.location.href = '/dashboard.html';
      } else {
        // Show error message
        errorMessage.textContent = data.message;
        errorMessage.classList.add('show');
      }
    } catch (error) {
      errorMessage.textContent = 'Network error. Please try again.';
      errorMessage.classList.add('show');
    }
  });
}

// Dashboard functionality
if (document.getElementById('mainContent')) {
  let currentStudent = null;

  // Session validation and student info loading
  async function validateSession() {
    try {
      // Try to fetch student data to validate session
      const response = await fetch('/api/student/2401420048', { credentials: 'include' });
      
      if (response.status === 401) {
        // Not authenticated, redirect to login
        window.location.href = '/index.html';
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      // Don't redirect on network errors, just log them
      return true;
    }
  }

  // Load student info from session storage or fetch
  async function loadStudentInfo() {
    try {
      const rollNumber = '2401420048'; // This should come from session
      const response = await fetch(`/api/student/${rollNumber}`, { credentials: 'include' });
      const data = await response.json();
      
      if (data.success && data.student) {
        const student = data.student;
        const studentName = document.getElementById('studentName');
        const studentRoll = document.getElementById('studentRoll');
        const studentIcon = document.getElementById('studentIcon');
        
        studentName.textContent = student.name || 'Student';
        studentRoll.textContent = student.rollNumber || '';
        studentIcon.textContent = student.profileIcon || '👨‍🎓';
      }
    } catch (error) {
      console.error('Error loading student info:', error);
    }
  }

  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = '/index.html';
      }
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/index.html';
    }
  });

  // Navigation handling
  const navItems = document.querySelectorAll('.nav-item:not(.disabled)');
  const mainContent = document.getElementById('mainContent');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();

      // Remove active class from all items
      navItems.forEach(nav => nav.classList.remove('active'));

      // Add active class to clicked item
      item.classList.add('active');

      // Get page to load
      const page = item.getAttribute('data-page');

      // Load content
      loadContent(page);
    });
  });

  // Load content based on page
  function loadContent(page) {
    const contentWrapper = mainContent.querySelector('.content-wrapper');

    switch (page) {
      case 'dashboard':
        loadDashboard(contentWrapper);
        break;
      case 'attendance':
        loadAttendance(contentWrapper);
        break;
      case 'timetable':
        loadTimetable(contentWrapper);
        break;
      case 'reportcard':
        loadReportCard(contentWrapper);
        break;
      case 'fees':
        loadFees(contentWrapper);
        break;
      case 'personalinfo':
        loadPersonalInfo(contentWrapper);
        break;
      case 'universityinfo':
        loadUniversityInfo(contentWrapper);
        break;
      default:
        loadComingSoon(contentWrapper, page);
    }
  }

  // Load "Coming Soon" page for non-working modules
  function loadComingSoon(container, pageName) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 60px 20px;">
        <i class="fas fa-tools" style="font-size: 80px; color: #ddd; margin-bottom: 20px;"></i>
        <h2 style="color: #666; margin-bottom: 10px;">Coming Soon</h2>
        <p style="color: #999;">The ${pageName} module is under development.</p>
      </div>
    `;
  }

  // Placeholder functions for content loading (will be implemented in next tasks)
  async function loadDashboard(container) {
    try {
      // Fetch student data
      const rollNumber = '2401420048'; // This should come from session
      
      const [attendanceRes, feesRes] = await Promise.all([
        fetch(`/api/attendance/${rollNumber}`, { credentials: 'include' }),
        fetch(`/api/fees/${rollNumber}`, { credentials: 'include' })
      ]);

      const attendanceData = await attendanceRes.json();
      const feesData = await feesRes.json();

      const attendance = attendanceData.attendance || {};
      const fees = feesData.fees || {};

      container.innerHTML = `
        <h1 style="margin-bottom: 30px; color: var(--dark-bg);">
          <i class="fas fa-home"></i> Dashboard Overview
        </h1>
        
        <div class="dashboard-grid">
          <div class="card overview-card" onclick="loadContent('attendance')" style="cursor: pointer;">
            <div class="card-icon" style="background: #3498db;">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="card-content">
              <h3>Attendance</h3>
              <p class="card-value">${attendance.percentage || 0}%</p>
              <p class="card-label">${attendance.presentDays || 0}/${attendance.totalDays || 0} Days Present</p>
            </div>
          </div>

          <div class="card overview-card" onclick="loadContent('fees')" style="cursor: pointer;">
            <div class="card-icon" style="background: #27ae60;">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="card-content">
              <h3>Fee Status</h3>
              <p class="card-value">${fees.status || 'N/A'}</p>
              <p class="card-label">₹${fees.paidAmount || 0} / ₹${fees.totalFees || 0}</p>
            </div>
          </div>

          <div class="card overview-card" onclick="loadContent('timetable')" style="cursor: pointer;">
            <div class="card-icon" style="background: #f39c12;">
              <i class="fas fa-clock"></i>
            </div>
            <div class="card-content">
              <h3>Today's Classes</h3>
              <p class="card-value">6</p>
              <p class="card-label">Periods Scheduled</p>
            </div>
          </div>

          <div class="card overview-card" onclick="loadContent('reportcard')" style="cursor: pointer;">
            <div class="card-icon" style="background: #e74c3c;">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="card-content">
              <h3>Report Card</h3>
              <p class="card-value">View</p>
              <p class="card-label">Check Your Grades</p>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top: 25px;">
          <div class="card-header">
            <h3 class="card-title"><i class="fas fa-info-circle"></i> Quick Info</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <i class="fas fa-user"></i>
              <span>Student Portal System</span>
            </div>
            <div class="info-item">
              <i class="fas fa-graduation-cap"></i>
              <span>Academic Year 2024-25</span>
            </div>
            <div class="info-item">
              <i class="fas fa-calendar"></i>
              <span>Semester: Current</span>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      container.innerHTML = `
        <div class="card">
          <p style="color: var(--danger-color);">Error loading dashboard data.</p>
        </div>
      `;
    }
  }

  async function loadAttendance(container) {
    try {
      const rollNumber = '2401420048'; // This should come from session
      
      const response = await fetch(`/api/attendance/${rollNumber}`, { credentials: 'include' });
      const data = await response.json();
      const attendance = data.attendance || {};

      container.innerHTML = `
        <h1 style="margin-bottom: 30px; color: var(--dark-bg);">
          <i class="fas fa-calendar-check"></i> Attendance
        </h1>
        
        <div class="attendance-grid">
          <div class="card attendance-card">
            <div class="attendance-stat">
              <div class="stat-icon" style="background: #3498db;">
                <i class="fas fa-calendar-alt"></i>
              </div>
              <div class="stat-info">
                <h3>Total Days</h3>
                <p class="stat-value">${attendance.totalDays || 0}</p>
              </div>
            </div>
          </div>

          <div class="card attendance-card">
            <div class="attendance-stat">
              <div class="stat-icon" style="background: #27ae60;">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="stat-info">
                <h3>Present Days</h3>
                <p class="stat-value">${attendance.presentDays || 0}</p>
              </div>
            </div>
          </div>

          <div class="card attendance-card">
            <div class="attendance-stat">
              <div class="stat-icon" style="background: #e74c3c;">
                <i class="fas fa-times-circle"></i>
              </div>
              <div class="stat-info">
                <h3>Absent Days</h3>
                <p class="stat-value">${attendance.absentDays || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top: 25px;">
          <div class="card-header">
            <h3 class="card-title"><i class="fas fa-chart-line"></i> Attendance Percentage</h3>
          </div>
          <div class="attendance-percentage">
            <div class="percentage-circle">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#f0f0f0" stroke-width="20"/>
                <circle cx="100" cy="100" r="90" fill="none" stroke="#27ae60" stroke-width="20"
                  stroke-dasharray="${(attendance.percentage || 0) * 5.65} 565"
                  stroke-dashoffset="0" transform="rotate(-90 100 100)" stroke-linecap="round"/>
              </svg>
              <div class="percentage-text">
                <span class="percentage-value">${attendance.percentage || 0}%</span>
                <span class="percentage-label">Attendance</span>
              </div>
            </div>
            <div class="attendance-details">
              <div class="detail-item">
                <i class="fas fa-info-circle"></i>
                <span>Maintain at least 75% attendance for eligibility</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-calendar-check"></i>
                <span>Present: ${attendance.presentDays || 0} out of ${attendance.totalDays || 0} days</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Absent: ${attendance.absentDays || 0} days</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      container.innerHTML = `
        <div class="card">
          <p style="color: var(--danger-color);">Error loading attendance data.</p>
        </div>
      `;
    }
  }

  async function loadTimetable(container) {
    try {
      const response = await fetch('/api/timetable', { credentials: 'include' });
      const data = await response.json();
      const timetable = data.timetable || [];

      let tableHTML = `
        <h1 style="margin-bottom: 30px; color: var(--dark-bg);">
          <i class="fas fa-clock"></i> Weekly Timetable
        </h1>
        
        <div class="card">
          <div class="timetable-wrapper">
            <table class="timetable-table">
              <thead>
                <tr>
                  <th>Period</th>
      `;

      // Add day headers
      timetable.forEach(day => {
        tableHTML += `<th>${day.day}</th>`;
      });

      tableHTML += `
                </tr>
              </thead>
              <tbody>
      `;

      // Get max periods
      const maxPeriods = Math.max(...timetable.map(day => day.periods.length));

      // Add period rows
      for (let i = 0; i < maxPeriods; i++) {
        tableHTML += `<tr><td class="period-number">Period ${i + 1}</td>`;
        
        timetable.forEach(day => {
          const period = day.periods[i];
          if (period) {
            tableHTML += `
              <td class="period-cell">
                <div class="period-subject">${period.subject}</div>
                <div class="period-teacher">${period.teacher}</div>
                <div class="period-time">${period.time}</div>
              </td>
            `;
          } else {
            tableHTML += `<td class="period-cell empty">-</td>`;
          }
        });
        
        tableHTML += `</tr>`;
      }

      tableHTML += `
              </tbody>
            </table>
          </div>
        </div>
      `;

      container.innerHTML = tableHTML;
    } catch (error) {
      container.innerHTML = `
        <div class="card">
          <p style="color: var(--danger-color);">Error loading timetable data.</p>
        </div>
      `;
    }
  }

  async function loadReportCard(container) {
    try {
      const rollNumber = '2401420048'; // This should come from session
      
      const response = await fetch(`/api/reportcard/${rollNumber}`, { credentials: 'include' });
      const data = await response.json();
      const reportCard = data.reportCard || {};

      if (reportCard.isCreditBased) {
        // Credit-based system with SGPA
        let tableHTML = `
          <h1 style="margin-bottom: 30px; color: var(--dark-bg);">
            <i class="fas fa-file-alt"></i> Grade Sheet - Even Semester 2024-2025
          </h1>
          
          <div class="card">
            <div class="report-summary">
              <div class="summary-item">
                <div class="summary-label">Total Credits</div>
                <div class="summary-value">${reportCard.totalCredits || 0}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Credits Earned</div>
                <div class="summary-value">${reportCard.totalCredits || 0}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">SGPA</div>
                <div class="summary-value">${reportCard.sgpa || 0}</div>
              </div>
            </div>
          </div>

          <div class="card" style="margin-top: 25px;">
            <div class="card-header">
              <h3 class="card-title"><i class="fas fa-list"></i> Course Details</h3>
            </div>
            <div class="report-table-wrapper">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Course Title</th>
                    <th style="text-align: center;">Credit</th>
                    <th style="text-align: center;">Grade</th>
                  </tr>
                </thead>
                <tbody>
        `;

        if (reportCard.subjects && reportCard.subjects.length > 0) {
          reportCard.subjects.forEach(subject => {
            tableHTML += `
              <tr>
                <td class="subject-name">${subject.name}</td>
                <td style="text-align: center;">${subject.credits}</td>
                <td style="text-align: center;">${subject.grade}</td>
              </tr>
            `;
          });
        }

        tableHTML += `
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="card" style="margin-top: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>Date:</strong> 12-06-2025
              </div>
              <div>
                <strong>Controller of Examinations</strong>
              </div>
            </div>
          </div>
        `;

        container.innerHTML = tableHTML;
      } else {
        // Marks-based system with percentage
        let tableHTML = `
          <h1 style="margin-bottom: 30px; color: var(--dark-bg);">
            <i class="fas fa-file-alt"></i> Report Card
          </h1>
          
          <div class="card">
            <div class="report-summary">
              <div class="summary-item">
                <div class="summary-label">Total Marks</div>
                <div class="summary-value">${reportCard.totalMarks || 0} / ${reportCard.maxMarks || 0}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Percentage</div>
                <div class="summary-value">${reportCard.percentage || 0}%</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Grade</div>
                <div class="summary-value grade-${reportCard.grade || 'F'}">${reportCard.grade || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="card" style="margin-top: 25px;">
            <div class="card-header">
              <h3 class="card-title"><i class="fas fa-list"></i> Subject-wise Marks</h3>
            </div>
            <div class="report-table-wrapper">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Max Marks</th>
                    <th>Obtained Marks</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
        `;

        if (reportCard.subjects && reportCard.subjects.length > 0) {
          reportCard.subjects.forEach(subject => {
            const percentage = ((subject.obtainedMarks / subject.maxMarks) * 100).toFixed(2);
            let grade;
            if (percentage >= 90) grade = 'A+';
            else if (percentage >= 80) grade = 'A';
            else if (percentage >= 70) grade = 'B+';
            else if (percentage >= 60) grade = 'B';
            else if (percentage >= 50) grade = 'C';
            else if (percentage >= 40) grade = 'D';
            else grade = 'F';

            tableHTML += `
              <tr>
                <td class="subject-name">${subject.name}</td>
                <td>${subject.maxMarks}</td>
                <td>${subject.obtainedMarks}</td>
                <td>${percentage}%</td>
                <td><span class="grade-badge grade-${grade}">${grade}</span></td>
              </tr>
            `;
          });
        }

        tableHTML += `
                </tbody>
              </table>
            </div>
          </div>
        `;

        container.innerHTML = tableHTML;
      }
    } catch (error) {
      container.innerHTML = `
        <div class="card">
          <p style="color: var(--danger-color);">Error loading report card data.</p>
        </div>
      `;
    }
  }

  async function loadFees(container) {
    try {
      const rollNumber = '2401420048'; // This should come from session
      
      const response = await fetch(`/api/fees/${rollNumber}`, { credentials: 'include' });
      const data = await response.json();
      const fees = data.fees || {};

      let feeBreakdownHTML = '';
      if (fees.feeBreakdown && fees.feeBreakdown.length > 0) {
        feeBreakdownHTML = `
          <div class="card" style="margin-top: 25px;">
            <div class="card-header">
              <h3 class="card-title"><i class="fas fa-list"></i> Academic Fees</h3>
            </div>
            <div class="fee-breakdown-wrapper">
              <table class="fee-breakdown-table">
                <thead>
                  <tr>
                    <th>Head Name</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
        `;
        
        fees.feeBreakdown.forEach(item => {
          feeBreakdownHTML += `
            <tr>
              <td class="fee-head-name">${item.headName}</td>
              <td class="fee-amount-cell">₹${item.amount.toFixed(2)}</td>
            </tr>
          `;
        });
        
        feeBreakdownHTML += `
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      container.innerHTML = `
        <h1 style="margin-bottom: 30px; color: var(--dark-bg);">
          <i class="fas fa-money-bill-wave"></i> Fee Status
        </h1>
        
        <div class="fees-grid">
          <div class="card fee-card">
            <div class="fee-icon" style="background: #3498db;">
              <i class="fas fa-wallet"></i>
            </div>
            <div class="fee-info">
              <h3>Total Fees</h3>
              <p class="fee-amount">₹${fees.totalFees || 0}</p>
            </div>
          </div>

          <div class="card fee-card">
            <div class="fee-icon" style="background: #27ae60;">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="fee-info">
              <h3>Paid Amount</h3>
              <p class="fee-amount">₹${fees.paidAmount || 0}</p>
            </div>
          </div>

          <div class="card fee-card">
            <div class="fee-icon" style="background: ${fees.pendingAmount > 0 ? '#e74c3c' : '#27ae60'};">
              <i class="fas fa-${fees.pendingAmount > 0 ? 'exclamation-circle' : 'check-circle'}"></i>
            </div>
            <div class="fee-info">
              <h3>Pending Amount</h3>
              <p class="fee-amount">₹${fees.pendingAmount || 0}</p>
            </div>
          </div>
        </div>

        ${feeBreakdownHTML}

        ${fees.pendingAmount > 0 ? `
          <div class="card" style="margin-top: 25px; border-left: 4px solid var(--warning-color);">
            <div style="display: flex; align-items: center; gap: 15px;">
              <i class="fas fa-exclamation-triangle" style="font-size: 32px; color: var(--warning-color);"></i>
              <div>
                <h3 style="margin-bottom: 5px; color: var(--dark-bg);">Payment Reminder</h3>
                <p style="color: #666; margin: 0;">You have a pending balance of ₹${fees.pendingAmount}. Please clear your dues at the earliest.</p>
              </div>
            </div>
          </div>
        ` : ''}
      `;
    } catch (error) {
      container.innerHTML = `
        <div class="card">
          <p style="color: var(--danger-color);">Error loading fee data.</p>
        </div>
      `;
    }
  }

  async function loadPersonalInfo(container) {
    try {
      const rollNumber = '2401420048'; // This should come from session
      
      const response = await fetch(`/api/student/${rollNumber}`, { credentials: 'include' });
      const data = await response.json();
      const student = data.student || {};

      container.innerHTML = `
        <h1 style="margin-bottom: 30px; color: var(--dark-bg);">
          <i class="fas fa-user"></i> Personal Information
        </h1>
        
        <div class="card">
          <div class="info-section">
            <div class="info-row">
              <div class="info-label"><i class="fas fa-user"></i> Name</div>
              <div class="info-value">${student.name || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label"><i class="fas fa-male"></i> Father Name</div>
              <div class="info-value">${student.fatherName || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label"><i class="fas fa-female"></i> Mother Name</div>
              <div class="info-value">${student.motherName || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label"><i class="fas fa-envelope"></i> Email</div>
              <div class="info-value">${student.email || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label"><i class="fas fa-calendar"></i> Date of Birth</div>
              <div class="info-value">${student.dob || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label"><i class="fas fa-phone"></i> Phone</div>
              <div class="info-value">${student.phone || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label"><i class="fas fa-venus-mars"></i> Gender</div>
              <div class="info-value">${student.gender || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label"><i class="fas fa-pray"></i> Religion</div>
              <div class="info-value">${student.religion || 'N/A'}</div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      container.innerHTML = `
        <div class="card">
          <p style="color: var(--danger-color);">Error loading personal information.</p>
        </div>
      `;
    }
  }

  async function loadUniversityInfo(container) {
    try {
      const rollNumber = '2401420048'; // This should come from session
      
      const response = await fetch(`/api/student/${rollNumber}`, { credentials: 'include' });
      const data = await response.json();
      const student = data.student || {};

      container.innerHTML = `
        <h1 style="margin-bottom: 30px; color: var(--dark-bg);">
          <i class="fas fa-university"></i> University Information
        </h1>
        
        <div class="card">
          <div class="info-section">
            <div class="info-row">
              <div class="info-label"><i class="fas fa-id-card"></i> Admission Number</div>
              <div class="info-value">${student.admissionNumber || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label"><i class="fas fa-file-alt"></i> Application Number</div>
              <div class="info-value">${student.applicationNumber || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label"><i class="fas fa-book"></i> Semester</div>
              <div class="info-value">${student.semester || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label"><i class="fas fa-users"></i> Division</div>
              <div class="info-value">${student.division || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label"><i class="fas fa-chalkboard"></i> Class</div>
              <div class="info-value">${student.class || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label"><i class="fas fa-id-badge"></i> Roll Number</div>
              <div class="info-value">${student.rollNumber || 'N/A'}</div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      container.innerHTML = `
        <div class="card">
          <p style="color: var(--danger-color);">Error loading university information.</p>
        </div>
      `;
    }
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // Initialize dashboard
  async function init() {
    await loadStudentInfo();
    loadContent('dashboard');
  }

  init();
}
