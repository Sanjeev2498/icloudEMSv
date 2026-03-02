# Design Document: Subject-Wise Attendance Feature

## Overview

This design document describes the implementation of a subject-wise attendance tracking feature for the iCloudEMS V2 Student Portal. The feature will display detailed attendance information for each subject a student is enrolled in, including attended/delivered counts and percentages.

## Architecture

The feature follows the existing three-tier architecture:

1. **Data Layer**: JSON file storing subject-wise attendance records
2. **API Layer**: Express.js endpoint to serve attendance data
3. **Presentation Layer**: HTML page with JavaScript to fetch and display attendance data

### Component Interaction

```
Dashboard (app.js)
    ↓ (click Attendance card)
attendance.html
    ↓ (fetch data)
Server API (/api/subject-attendance/:rollNumber)
    ↓ (read file)
subject-attendance.json
    ↓ (return data)
attendance.js (render UI)
```

## Components and Interfaces

### 1. Data Model (`server/data/subject-attendance.json`)

**Structure:**
```json
[
  {
    "rollNumber": "2401420048",
    "dateRange": {
      "from": "01/01/2026",
      "to": "31/05/2026"
    },
    "subjects": [
      {
        "subjectName": "DATABASE MANAGEMENT SYSTEMS LAB",
        "courseCode": "ENCS254",
        "subjectType": "PR",
        "attended": 10,
        "delivered": 12
      }
    ]
  }
]
```

**Fields:**
- `rollNumber`: Student identifier (string)
- `dateRange`: Object with `from` and `to` date strings
- `subjects`: Array of subject attendance records
  - `subjectName`: Full name of the subject (string)
  - `courseCode`: Unique course identifier (string)
  - `subjectType`: "PR" (Practical) or "PP" (Theory)
  - `attended`: Number of classes attended (integer)
  - `delivered`: Number of classes delivered (integer)

### 2. Server API Endpoint

**Endpoint:** `GET /api/subject-attendance/:rollNumber`

**Request:**
- URL Parameter: `rollNumber` (string)

**Response:**
```json
{
  "dateRange": {
    "from": "01/01/2026",
    "to": "31/05/2026"
  },
  "subjects": [...],
  "totalAttended": 139,
  "totalDelivered": 188,
  "totalPercentage": 73.94
}
```

**Error Response:**
```json
{
  "error": "Attendance data not found"
}
```

**Implementation:**
- Read `subject-attendance.json` file
- Filter by roll number
- Calculate total attended, total delivered, and total percentage
- Return formatted response

### 3. Frontend Page (`public/attendance.html`)

**Structure:**
- Header with title "Attendance Details"
- Date range display card
- Subject cards (one per subject)
- Total attendance summary card
- Back button to dashboard

**Styling:**
- Reuse existing CSS classes from `styles.css`
- Blue header matching dashboard theme
- White cards with shadows
- Responsive design for mobile and desktop

### 4. Frontend JavaScript (`public/js/attendance.js`)

**Functions:**

```javascript
// Initialize page and fetch data
async function initAttendance()

// Fetch subject-wise attendance from API
async function fetchSubjectAttendance(rollNumber)

// Render date range display
function renderDateRange(dateRange)

// Render all subject cards
function renderSubjects(subjects)

// Render individual subject card
function renderSubjectCard(subject)

// Calculate and render total attendance
function renderTotalAttendance(totalAttended, totalDelivered, totalPercentage)

// Calculate percentage
function calculatePercentage(attended, delivered)

// Handle errors
function handleError(message)
```

### 5. Dashboard Integration (`public/js/app.js`)

**Modification:**
- Update Attendance card click handler
- Navigate to `attendance.html` with roll number parameter

```javascript
// In loadDashboardCards()
if (card.title === 'Attendance') {
    card.element.addEventListener('click', () => {
        window.location.href = `attendance.html?roll=${rollNumber}`;
    });
}
```

## Data Models

### SubjectAttendance

```typescript
interface SubjectAttendance {
  rollNumber: string;
  dateRange: {
    from: string;  // Format: DD/MM/YYYY
    to: string;    // Format: DD/MM/YYYY
  };
  subjects: Subject[];
}

interface Subject {
  subjectName: string;
  courseCode: string;
  subjectType: "PR" | "PP";  // PR = Practical, PP = Theory
  attended: number;
  delivered: number;
}
```

### API Response

```typescript
interface AttendanceResponse {
  dateRange: {
    from: string;
    to: string;
  };
  subjects: Subject[];
  totalAttended: number;
  totalDelivered: number;
  totalPercentage: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: All subjects are rendered
*For any* list of subjects in the attendance data, all subjects should appear in the rendered page output.
**Validates: Requirements 1.3**

### Property 2: Subject cards contain required information
*For any* subject, the rendered card should contain the subject name, course code, and subject type.
**Validates: Requirements 1.4, 2.1, 2.2**

### Property 3: Attendance format is correct
*For any* subject with attended and delivered counts, the rendered format should display as "attended/delivered" (e.g., "10/12").
**Validates: Requirements 2.3**

### Property 4: Percentage calculation is accurate
*For any* subject with attended and delivered values where delivered > 0, the displayed percentage should equal (attended/delivered) * 100 rounded to two decimal places.
**Validates: Requirements 2.4, 3.1, 3.3**

### Property 5: Total attendance calculation is correct
*For any* list of subjects, the total attended should equal the sum of all individual attended values, the total delivered should equal the sum of all individual delivered values, and the total percentage should equal (total_attended/total_delivered) * 100.
**Validates: Requirements 3.4, 3.5, 3.6**

### Property 6: Data structure completeness
*For any* stored attendance record, it should contain all required fields: rollNumber, dateRange (with from and to), and subjects array with each subject having subjectName, courseCode, subjectType, attended, and delivered.
**Validates: Requirements 4.2, 4.3**

### Property 7: Roll number filtering
*For any* roll number query to the API, the returned data should only include attendance records matching that specific roll number.
**Validates: Requirements 5.1**

### Property 8: URL contains roll number parameter
*For any* navigation to the attendance page, the URL should contain the roll number as a query parameter.
**Validates: Requirements 6.2**

## Error Handling

### Division by Zero
When `delivered` count is 0, the percentage calculation should return 0% instead of attempting division by zero.

### Missing Data
- If no attendance data exists for a roll number, return 404 with error message
- If the JSON file is missing or corrupted, return 500 with error message
- Display user-friendly error messages on the frontend

### API Failures
- Implement try-catch blocks around API calls
- Display error messages to users when data cannot be loaded
- Provide retry mechanism or instructions to refresh

### Invalid Input
- Validate roll number format before querying
- Handle missing or malformed query parameters
- Return appropriate HTTP status codes (400 for bad requests)

## Testing Strategy

### Unit Tests
- Test percentage calculation function with various inputs
- Test total calculation function with different subject arrays
- Test zero division handling
- Test data validation for required fields
- Test API endpoint with valid and invalid roll numbers
- Test error handling for missing data

### Property-Based Tests
- Property 1: Generate random subject arrays and verify all are rendered
- Property 2: Generate random subjects and verify cards contain all required fields
- Property 3: Generate random attended/delivered values and verify format
- Property 4: Generate random attended/delivered values and verify percentage calculation
- Property 5: Generate random subject arrays and verify total calculations
- Property 6: Generate random attendance records and verify data structure
- Property 7: Generate random roll numbers and verify filtering
- Property 8: Generate random roll numbers and verify URL parameters

**Testing Framework:** Jest for JavaScript unit and property-based tests
**Property Test Configuration:** Minimum 100 iterations per property test
**Test Tags:** Each property test must include a comment: `// Feature: subject-wise-attendance, Property {number}: {property_text}`

### Integration Tests
- Test full flow from dashboard click to attendance page display
- Test API endpoint integration with data file
- Test error scenarios (missing file, invalid data)
- Test navigation back to dashboard

### Manual Testing
- Verify UI matches design screenshots
- Test responsive design on mobile and desktop
- Verify accessibility (screen readers, keyboard navigation)
- Test with real student data
