# Implementation Plan: Subject-Wise Attendance Feature

## Overview

This implementation plan breaks down the subject-wise attendance feature into discrete coding tasks. Each task builds on previous work and includes testing to validate functionality.

## Tasks

- [x] 1. Create subject-wise attendance data file
  - Create `server/data/subject-attendance.json` with sample data for roll number 2401420048
  - Include date range, subjects with course codes, types, attended/delivered counts
  - Match the subjects from the provided screenshots
  - _Requirements: 4.2, 4.3_

- [x] 2. Implement server API endpoint
  - [x] 2.1 Add GET endpoint `/api/subject-attendance/:rollNumber` in `server/server.js`
    - Read subject-attendance.json file
    - Filter by roll number
    - Calculate total attended, total delivered, and total percentage
    - Return formatted response with error handling
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 2.2 Write unit tests for API endpoint
    - Test successful data retrieval
    - Test 404 for missing roll number
    - Test error handling for file read failures
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 2.3 Write property test for roll number filtering
    - **Property 7: Roll number filtering**
    - **Validates: Requirements 5.1**

- [x] 3. Create attendance page HTML
  - Create `public/attendance.html` with structure:
    - Header with title "Attendance Details"
    - Date range display section
    - Container for subject cards
    - Total attendance summary section
    - Back button to dashboard
  - Use existing CSS classes from styles.css
  - _Requirements: 1.1, 1.2, 1.5, 6.3_

- [x] 4. Implement attendance page JavaScript
  - [x] 4.1 Create `public/js/attendance.js` with core functions
    - `initAttendance()` - Initialize page and fetch data
    - `fetchSubjectAttendance(rollNumber)` - API call
    - `calculatePercentage(attended, delivered)` - Percentage calculation with zero handling
    - `handleError(message)` - Error display
    - _Requirements: 2.4, 3.1, 3.2, 5.3_

  - [x] 4.2 Write property test for percentage calculation
    - **Property 4: Percentage calculation is accurate**
    - **Validates: Requirements 2.4, 3.1, 3.3**

  - [x] 4.3 Implement rendering functions
    - `renderDateRange(dateRange)` - Display date range
    - `renderSubjects(subjects)` - Render all subject cards
    - `renderSubjectCard(subject)` - Render individual card
    - `renderTotalAttendance(totalAttended, totalDelivered, totalPercentage)` - Display totals
    - _Requirements: 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

  - [x] 4.4 Write property test for subject rendering
    - **Property 1: All subjects are rendered**
    - **Validates: Requirements 1.3**

  - [x] 4.5 Write property test for subject card content
    - **Property 2: Subject cards contain required information**
    - **Validates: Requirements 1.4, 2.1, 2.2**

  - [x] 4.6 Write property test for attendance format
    - **Property 3: Attendance format is correct**
    - **Validates: Requirements 2.3**

- [x] 5. Implement total calculation logic
  - [x] 5.1 Add calculation functions in attendance.js
    - Calculate sum of all attended classes
    - Calculate sum of all delivered classes
    - Calculate overall percentage
    - _Requirements: 3.4, 3.5, 3.6_

  - [x] 5.2 Write property test for total calculations
    - **Property 5: Total attendance calculation is correct**
    - **Validates: Requirements 3.4, 3.5, 3.6**

- [x] 6. Checkpoint - Ensure attendance page works independently
  - Test attendance.html directly with a roll number parameter
  - Verify all data displays correctly
  - Ensure all tests pass, ask the user if questions arise

- [x] 7. Integrate with dashboard
  - [x] 7.1 Update dashboard attendance card click handler in `public/js/app.js`
    - Navigate to `attendance.html?roll=${rollNumber}` on click
    - Remove "Coming Soon" behavior for Attendance card
    - _Requirements: 1.1, 6.1, 6.2_

  - [x] 7.2 Write property test for URL parameter
    - **Property 8: URL contains roll number parameter**
    - **Validates: Requirements 6.2**

  - [x] 7.3 Implement back button navigation in attendance.html
    - Navigate back to dashboard.html on click
    - _Requirements: 6.4_

- [x] 8. Add CSS styling for attendance page
  - Add styles for subject cards in `public/css/styles.css`
  - Ensure responsive design for mobile and desktop
  - Match the blue header theme from screenshots
  - Style date range display, subject cards, and total summary
  - _Requirements: 1.2, 1.4, 1.5_

- [-] 9. Final checkpoint - End-to-end testing
  - [x] 9.1 Write integration tests
    - Test full flow from dashboard to attendance page
    - Test navigation back to dashboard
    - Test with multiple students
    - _Requirements: 1.1, 6.1, 6.4_

  - [x] 9.2 Write property test for data structure
    - **Property 6: Data structure completeness**
    - **Validates: Requirements 4.2, 4.3**

  - [-] 9.3 Manual testing
    - Verify UI matches provided screenshots
    - Test with real data
    - Test error scenarios
    - Ensure all tests pass, ask the user if questions arise

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The feature should match the screenshots provided by the user
