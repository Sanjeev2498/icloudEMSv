# Student Portal System

A modern, responsive Student Portal Website similar to a school ERP system built with Node.js, Express, and vanilla JavaScript.

## Features

- **Secure Authentication**: Login with roll number and password
- **Dashboard Overview**: Quick view of attendance, fees, and academic info
- **Attendance Tracking**: View attendance statistics with visual progress indicators
- **Weekly Timetable**: Complete class schedule for Monday-Friday
- **Report Card**: Subject-wise marks with grades and percentage
- **Fee Management**: Track fee payments and pending amounts
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, professional interface with smooth transitions

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Session Management**: express-session
- **Authentication**: bcryptjs for password hashing
- **Icons**: Font Awesome 6.x
- **Testing**: Mocha, Chai, Supertest, fast-check (Property-Based Testing)

## Project Structure

```
student-portal-system/
├── server/
│   ├── server.js              # Main server file
│   ├── middleware/
│   │   └── authMiddleware.js  # Authentication middleware
│   └── data/
│       ├── students.json      # Student credentials
│       ├── attendance.json    # Attendance records
│       ├── timetable.json     # Weekly timetable
│       ├── reportcards.json   # Academic records
│       └── fees.json          # Fee information
├── public/
│   ├── index.html             # Login page
│   ├── dashboard.html         # Dashboard page
│   ├── css/
│   │   └── styles.css         # All styles
│   └── js/
│       └── app.js             # Client-side JavaScript
├── test/                      # Test files
├── package.json
└── README.md
```

## Installation

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

## Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## Sample Credentials

Use these credentials to login:

| Roll Number | Password | Name |
|------------|----------|------|
| 2021002 | password123 | Priya Patel |
| 2021003 | password123 | Amit Kumar |

## Testing

Run all tests:
```bash
npm test
```

The test suite includes:
- **Unit Tests**: Specific functionality tests
- **Property-Based Tests**: Universal property validation (100+ iterations each)
- **Integration Tests**: Complete user flow testing

Total: 21 tests covering authentication, data retrieval, navigation, responsive design, and integration flows.

## Features Overview

### Working Modules

1. **Dashboard**
   - Overview cards showing key statistics
   - Attendance summary
   - Fee status
   - Quick information

2. **Attendance**
   - Total days, present days, absent days
   - Attendance percentage with circular progress bar
   - Visual statistics

3. **Timetable**
   - Weekly schedule (Monday-Friday)
   - 6 periods per day
   - Subject, teacher, and time information

4. **Report Card**
   - Subject-wise marks table
   - Total marks and percentage
   - Grade calculation (A+, A, B+, B, C, D, F)

5. **Fees**
   - Total fees, paid amount, pending amount
   - Payment status badge (Paid/Due)
   - Payment reminder for pending dues

### Non-Working Modules (Coming Soon)

- Holidays
- Notifications
- Assignments
- Enrollment

## Design Highlights

- **Modern UI**: Card-based layout with shadows and rounded corners
- **Dark Sidebar**: Professional navigation with icons
- **Light Background**: Clean #f4f6f9 background for main content
- **Smooth Transitions**: CSS transitions for hover effects and interactions
- **Responsive**: Mobile-friendly with collapsible sidebar
- **Professional Typography**: Clean, readable fonts

## API Endpoints

### Authentication
- `POST /api/login` - Authenticate user
- `POST /api/logout` - Destroy session

### Data Retrieval (Protected)
- `GET /api/student/:rollNumber` - Get student profile
- `GET /api/attendance/:rollNumber` - Get attendance data
- `GET /api/timetable` - Get weekly timetable
- `GET /api/reportcard/:rollNumber` - Get report card
- `GET /api/fees/:rollNumber` - Get fee status

## Security Features

- Password hashing with bcryptjs
- Session-based authentication
- Protected API routes with middleware
- Input validation for login credentials
- Secure session cookies (httpOnly)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Development

The application uses:
- Express for server-side routing
- Session management for authentication
- JSON files for data storage (can be replaced with database)
- Vanilla JavaScript (no frontend frameworks)
- CSS Grid and Flexbox for layouts

## License

ISC

## Author

Student Portal System - Academic Year 2024-25
