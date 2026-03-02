/**
 * Subject-Wise Attendance Page JavaScript
 * Handles fetching and displaying subject-wise attendance data
 */

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
  initAttendance();
});

/**
 * Initialize attendance page and fetch data
 */
async function initAttendance() {
  // Get roll number from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const rollNumber = urlParams.get('roll');

  if (!rollNumber) {
    handleError('No roll number provided');
    return;
  }

  // Set up back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }

  // Fetch and display attendance data
  try {
    const data = await fetchSubjectAttendance(rollNumber);
    
    // Hide loading spinner
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
    }

    // Render the data
    renderDateRange(data.dateRange);
    renderSubjects(data.subjects);
    renderTotalAttendance(data.totalAttended, data.totalDelivered, data.totalPercentage);
  } catch (error) {
    console.error('Error loading attendance:', error);
    handleError(error.message || 'Unable to load attendance data');
  }
}

/**
 * Fetch subject-wise attendance from API
 * @param {string} rollNumber - Student roll number
 * @returns {Promise<Object>} Attendance data
 */
async function fetchSubjectAttendance(rollNumber) {
  try {
    const response = await fetch(`/api/subject-attendance/${rollNumber}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Attendance data not found');
      }
      throw new Error('Failed to fetch attendance data');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to load attendance data');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Calculate percentage with zero handling
 * @param {number} attended - Number of classes attended
 * @param {number} delivered - Number of classes delivered
 * @returns {number} Percentage rounded to 2 decimal places
 */
function calculatePercentage(attended, delivered) {
  if (delivered === 0) {
    return 0;
  }
  return parseFloat(((attended / delivered) * 100).toFixed(2));
}

/**
 * Handle and display errors
 * @param {string} message - Error message to display
 */
function handleError(message) {
  // Hide loading spinner
  const loadingSpinner = document.getElementById('loadingSpinner');
  if (loadingSpinner) {
    loadingSpinner.style.display = 'none';
  }

  // Show error message
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  
  if (errorMessage && errorText) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
  }
}


/**
 * Render date range display
 * @param {Object} dateRange - Object with from and to dates
 */
function renderDateRange(dateRange) {
  const fromDateEl = document.getElementById('fromDate');
  const toDateEl = document.getElementById('toDate');
  
  if (fromDateEl && dateRange.from) {
    fromDateEl.textContent = dateRange.from;
  }
  
  if (toDateEl && dateRange.to) {
    toDateEl.textContent = dateRange.to;
  }
}

/**
 * Render all subject cards
 * @param {Array} subjects - Array of subject objects
 */
function renderSubjects(subjects) {
  const container = document.getElementById('subjectCardsContainer');
  
  if (!container) {
    console.error('Subject cards container not found');
    return;
  }
  
  // Clear existing content
  container.innerHTML = '';
  
  // Render each subject
  subjects.forEach(subject => {
    const card = renderSubjectCard(subject);
    container.appendChild(card);
  });
}

/**
 * Render individual subject card
 * @param {Object} subject - Subject object with name, code, type, attended, delivered
 * @returns {HTMLElement} Subject card element
 */
function renderSubjectCard(subject) {
  const card = document.createElement('div');
  card.className = 'subject-card';
  
  // Calculate percentage
  const percentage = calculatePercentage(subject.attended, subject.delivered);
  
  // Create card HTML
  card.innerHTML = `
    <div class="subject-header">
      <h3 class="subject-name">${subject.subjectName} (${subject.courseCode})</h3>
      <p class="subject-type">${subject.subjectName} - (${subject.subjectType})</p>
    </div>
    <div class="subject-stats">
      <div class="stat-item">
        <span class="stat-label">Course Code</span>
        <span class="stat-value">${subject.courseCode}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Attended/Delivered</span>
        <span class="stat-value">${subject.attended}/${subject.delivered}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Percent</span>
        <span class="stat-value">${percentage} %</span>
      </div>
    </div>
  `;
  
  return card;
}

/**
 * Render total attendance summary
 * @param {number} totalAttended - Total attended classes
 * @param {number} totalDelivered - Total delivered classes
 * @param {number} totalPercentage - Total percentage
 */
function renderTotalAttendance(totalAttended, totalDelivered, totalPercentage) {
  const totalCountEl = document.getElementById('totalCount');
  const totalPercentageEl = document.getElementById('totalPercentage');
  
  if (totalCountEl) {
    totalCountEl.textContent = `${totalAttended}/${totalDelivered}`;
  }
  
  if (totalPercentageEl) {
    totalPercentageEl.textContent = `${totalPercentage} %`;
  }
}


/**
 * Calculate total attended classes across all subjects
 * @param {Array} subjects - Array of subject objects
 * @returns {number} Total attended classes
 */
function calculateTotalAttended(subjects) {
  return subjects.reduce((total, subject) => total + subject.attended, 0);
}

/**
 * Calculate total delivered classes across all subjects
 * @param {Array} subjects - Array of subject objects
 * @returns {number} Total delivered classes
 */
function calculateTotalDelivered(subjects) {
  return subjects.reduce((total, subject) => total + subject.delivered, 0);
}

/**
 * Calculate overall attendance percentage
 * @param {number} totalAttended - Total attended classes
 * @param {number} totalDelivered - Total delivered classes
 * @returns {number} Overall percentage rounded to 2 decimal places
 */
function calculateOverallPercentage(totalAttended, totalDelivered) {
  return calculatePercentage(totalAttended, totalDelivered);
}
