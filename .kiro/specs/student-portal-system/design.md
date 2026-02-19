# Design Document: Student Portal System

## Overview

The Student Portal System is a web-based application built using Node.js/Express backend with HTML, CSS, and JavaScript frontend. The system provides authenticated students access to their academic information through a modern, responsive interface. The architecture follows a client-server model with session-based authentication, modular frontend components, and JSON-based data storage for simplicity.

## Architecture

### System Architecture

The system uses a three-tier architecture:

1. **Presentation Layer (Frontend)**
   - HTML pages for login and dashboard
   - CSS for styling with responsive design
   - JavaScript for client-side interactivity and dynamic content loading
   - Font Awesome for icons

2. **Application Layer (Backend)**
   - Node.js with Express framework
   - Express-session for session management
   - RESTful API endpoints for data retrieval
   - Authentication middleware for route protection

3. **Data Layer**
   - JSON files for data storage (students.json, attendance.json, timetable.json, reportcards.json, fees.json)
   - In-memory session storage

### Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js v14+, Express.js v4.x
- **Session Management**: express-session
- **Password Hashing**: bcryptjs
- **Data Storage**: JSON files
- **Icons**: Font Awesome 6.x
- **Development**: nodemon for auto-restart

## Components and Interfaces

### Frontend Components

#### 1. Login Page (`login.html`)
- Form with roll number and password inputs
- Submit button triggering authentication
- Error message display area
- Responsive layout centered on screen

#### 2. Dashboard Page (`dashboard.html`)
- Header bar component (student info, logout button)
- Sidebar navigation component
- Main content area (dynamic module loading)
- Module-specific views (attendance, timetable, report card, fees)

#### 3. Stylesheet (`styles.css`)
- Global styles and CSS variables
- Component-specific styles
- Responsive media queries
- Animation and transition definitions

#### 4. Client Script (`app.js`)
- Session validation on page load
- Navigation handling
- Dynamic content loading
- Logout functionality
- API communication functions

### Backend Components

#### 1. Server (`server.js`)
- Express application setup
- Middleware configuration (body-parser, session, static files)
- Route definitions
- Server initialization

#### 2. Authentication Routes (`/api/login`, `/api/logout`)
- POST `/api/login`: Validates credentials, creates session
- POST `/api/logout`: Destroys session
- Returns JSON responses with success/error status

#### 3. Data Routes
- GET `/api/student/:rollNumber`: Returns student profile data
- GET `/api/attendance/:rollNumber`: Returns attendance data
- GET `/api/timetable`: Returns weekly timetable
- GET `/api/reportcard/:rollNumber`: Returns report card data
- GET `/api/fees/:rollNumber`: Returns fee status data

#### 4. Authentication Middleware (`authMiddleware.js`)
- Validates session existence
- Protects API routes
- Returns 401 for unauthenticated requests

### Data Models

#### Student Model
```javascript
{
  rollNumber: string,      // Unique identifier
  password: string,        // Hashed password
  name: string,           // Full name
  class: string,          // Class/Grade
  section: string,        // Section
  profileIcon: string     // Icon identifier or image path
}
```

#### Attendance Model
```javascript
{
  rollNumber: string,
  totalDays: number,
  presentDays: number,
  absentDays: number,
  percentage: number      // Calculated field
}
```

#### Timetable Model
```javascript
{
  day: string,           // Monday-Friday
  periods: [
    {
      periodNumber: number,
      subject: string,
      teacher: string,
      time: string       // e.g., "09:00-10:00"
    }
  ]
}
```

#### Report Card Model
```javascript
{
  rollNumber: string,
  subjects: [
    {
      name: string,
      maxMarks: number,
      obtainedMarks: number
    }
  ],
  totalMarks: number,      // Calculated
  percentage: number,      // Calculated
  grade: string           // Calculated based on percentage
}
```

#### Fees Model
```javascript
{
  rollNumber: string,
  totalFees: number,
  paidAmount: number,
  pendingAmount: number,   // Calculated
  status: string          // "Paid" or "Due"
}
```

## Data Models

### File Structure
```
student-portal-system/
├── server/
│   ├── server.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── data/
│       ├── students.json
│       ├── attendance.json
│       ├── timetable.json
│       ├── reportcards.json
│       └── fees.json
├── public/
│   ├── index.html (login page)
│   ├── dashboard.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── package.json
└── README.md
```

### Session Data Structure
```javascript
{
  sessionID: string,
  cookie: {
    maxAge: number,
    httpOnly: boolean
  },
  student: {
    rollNumber: string,
    name: string
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Authentication Validation
*For any* student credentials (roll number and password), if the credentials match a record in the database, then authentication should succeed and create a valid session; otherwise, authentication should fail with an error message.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Session Protection
*For any* API request to protected endpoints, if a valid session exists, then the request should be processed; otherwise, the request should be rejected with a 401 status code.

**Validates: Requirements 2.4**

### Property 3: Session Termination
*For any* authenticated session, when logout is triggered, the session should be destroyed and subsequent requests should be treated as unauthenticated.

**Validates: Requirements 2.2**

### Property 4: Attendance Percentage Calculation
*For any* attendance record with total days and present days, the calculated percentage should equal (presentDays / totalDays) * 100, and absent days should equal totalDays - presentDays.

**Validates: Requirements 4.2**

### Property 5: Grade Calculation Consistency
*For any* report card with subject marks, the total marks should equal the sum of all obtained marks, the percentage should equal (totalObtained / totalMax) * 100, and the grade should be consistently derived from the percentage using the grading scale.

**Validates: Requirements 6.2, 6.3, 6.4**

### Property 6: Fee Status Consistency
*For any* fee record, the pending amount should equal totalFees - paidAmount, and the status should be "Paid" if pendingAmount equals 0, otherwise "Due".

**Validates: Requirements 7.2, 7.3**

### Property 7: Navigation Content Loading
*For any* navigation menu item selection, if the item is a working module (Dashboard, Attendance, Timetable, Report Card, Fees), then the corresponding content should be loaded in the main area; if the item is non-working, then a "Coming Soon" message should be displayed.

**Validates: Requirements 3.3, 3.5**

### Property 8: Responsive Layout Adaptation
*For any* viewport width, the layout should adapt appropriately: sidebar should be visible and functional on desktop (width >= 768px) and should collapse or transform for mobile (width < 768px) while maintaining all functionality.

**Validates: Requirements 8.1, 8.3**

### Property 9: Data Retrieval by Roll Number
*For any* authenticated student with roll number R, all data retrieval operations (attendance, report card, fees) should return data associated with roll number R and no other student's data.

**Validates: Requirements 10.6**

### Property 10: Empty Credential Rejection
*For any* login attempt where roll number or password is empty or contains only whitespace, the authentication should fail with a validation error message.

**Validates: Requirements 1.4**

## Error Handling

### Frontend Error Handling

1. **Login Errors**
   - Display user-friendly error messages for invalid credentials
   - Show validation errors for empty fields
   - Handle network errors gracefully with retry options

2. **Session Expiration**
   - Detect 401 responses from API calls
   - Redirect to login page with appropriate message
   - Clear any cached session data

3. **Data Loading Errors**
   - Display error messages when data fails to load
   - Provide retry mechanisms
   - Show loading states during API calls

### Backend Error Handling

1. **Authentication Errors**
   - Return 401 for invalid credentials
   - Return 400 for malformed requests
   - Log authentication attempts for security monitoring

2. **Data Access Errors**
   - Handle file read errors gracefully
   - Return 404 for non-existent student records
   - Return 500 for server errors with generic messages

3. **Session Errors**
   - Handle session creation failures
   - Manage session storage errors
   - Implement session timeout handling

### Error Response Format
```javascript
{
  success: boolean,
  message: string,
  error: string (optional, for debugging)
}
```

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples, edge cases, and error conditions:

1. **Authentication Tests**
   - Test successful login with valid credentials
   - Test failed login with invalid credentials
   - Test empty field validation
   - Test password hashing verification

2. **Calculation Tests**
   - Test attendance percentage calculation with specific values
   - Test grade calculation with boundary values (0%, 100%, grade thresholds)
   - Test fee pending amount calculation

3. **Session Tests**
   - Test session creation on successful login
   - Test session destruction on logout
   - Test session validation middleware

4. **API Endpoint Tests**
   - Test each endpoint with valid data
   - Test endpoints with invalid roll numbers
   - Test protected endpoints without authentication

### Property-Based Testing

Property tests will verify universal properties across all inputs using a JavaScript property-based testing library (fast-check):

1. **Property Test Configuration**
   - Minimum 100 iterations per test
   - Use fast-check for JavaScript property-based testing
   - Tag each test with feature name and property number

2. **Authentication Property Tests**
   - **Feature: student-portal-system, Property 1**: Authentication Validation
   - **Feature: student-portal-system, Property 2**: Session Protection
   - **Feature: student-portal-system, Property 3**: Session Termination
   - **Feature: student-portal-system, Property 10**: Empty Credential Rejection

3. **Calculation Property Tests**
   - **Feature: student-portal-system, Property 4**: Attendance Percentage Calculation
   - **Feature: student-portal-system, Property 5**: Grade Calculation Consistency
   - **Feature: student-portal-system, Property 6**: Fee Status Consistency

4. **Navigation Property Tests**
   - **Feature: student-portal-system, Property 7**: Navigation Content Loading

5. **Data Access Property Tests**
   - **Feature: student-portal-system, Property 9**: Data Retrieval by Roll Number

### Integration Testing

- Test complete user flows (login → navigate → view data → logout)
- Test responsive behavior across different viewport sizes
- Test API integration between frontend and backend

### Testing Approach

- Use Mocha/Chai for unit testing framework
- Use fast-check for property-based testing
- Use Supertest for API endpoint testing
- Manual testing for responsive design and UI/UX validation
- Both unit tests and property tests are complementary and necessary for comprehensive coverage
