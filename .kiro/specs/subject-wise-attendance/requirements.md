# Requirements Document

## Introduction

This document outlines the requirements for adding a subject-wise attendance tracking feature to the iCloudEMS V2 Student Portal System. The feature will allow students to view their attendance broken down by individual subjects, including attended/delivered counts and percentages for each course.

## Glossary

- **System**: The iCloudEMS V2 Student Portal web application
- **Student**: A user with a valid roll number who can view their attendance data
- **Subject**: An individual course or class that a student is enrolled in
- **Attendance_Record**: Data showing attended and delivered classes for a specific subject
- **Course_Code**: Unique identifier for each subject (e.g., ENCS254, AUC002)
- **Subject_Type**: Classification of subject as Practical (PR) or Theory (PP)
- **Attendance_Percentage**: Calculated value of (attended/delivered) * 100

## Requirements

### Requirement 1: Display Subject-Wise Attendance Page

**User Story:** As a student, I want to view my attendance broken down by subject, so that I can track my attendance for each individual course.

#### Acceptance Criteria

1. WHEN a student clicks on the Attendance card from the dashboard, THE System SHALL display the subject-wise attendance page
2. WHEN the subject-wise attendance page loads, THE System SHALL display a date range showing the attendance period (From date and To date)
3. WHEN the subject-wise attendance page loads, THE System SHALL display all subjects the student is enrolled in
4. WHEN displaying subjects, THE System SHALL show each subject in a separate card with subject name and course code
5. THE System SHALL display the total attendance summary at the bottom of the page

### Requirement 2: Display Subject Attendance Details

**User Story:** As a student, I want to see detailed attendance information for each subject, so that I understand my attendance status per course.

#### Acceptance Criteria

1. WHEN displaying a subject card, THE System SHALL show the subject name and course code
2. WHEN displaying a subject card, THE System SHALL show the subject type (PR for Practical or PP for Theory)
3. WHEN displaying a subject card, THE System SHALL show the attended count and delivered count in "attended/delivered" format
4. WHEN displaying a subject card, THE System SHALL calculate and display the attendance percentage
5. WHEN the attended count is zero and delivered count is zero, THE System SHALL display "0/0" and "0 %"

### Requirement 3: Calculate Attendance Percentages

**User Story:** As a student, I want accurate attendance percentages calculated for each subject, so that I know my standing in each course.

#### Acceptance Criteria

1. WHEN calculating subject attendance percentage, THE System SHALL use the formula (attended/delivered) * 100
2. WHEN the delivered count is zero, THE System SHALL display 0% as the attendance percentage
3. WHEN displaying percentages, THE System SHALL round to two decimal places
4. WHEN calculating total attendance, THE System SHALL sum all attended classes across all subjects
5. WHEN calculating total attendance, THE System SHALL sum all delivered classes across all subjects
6. WHEN displaying total percentage, THE System SHALL calculate (total_attended/total_delivered) * 100

### Requirement 4: Store Subject-Wise Attendance Data

**User Story:** As a system administrator, I want subject-wise attendance data stored in a structured format, so that it can be easily retrieved and displayed.

#### Acceptance Criteria

1. THE System SHALL store subject-wise attendance data in a JSON file
2. WHEN storing attendance data, THE System SHALL include roll number, subject name, course code, subject type, attended count, and delivered count
3. WHEN storing attendance data, THE System SHALL include the date range (from date and to date)
4. THE System SHALL support multiple subjects per student
5. THE System SHALL allow attendance data to be updated manually by editing the JSON file

### Requirement 5: Retrieve Subject-Wise Attendance Data

**User Story:** As a student, I want the system to fetch my subject-wise attendance data when I view the attendance page, so that I see my current attendance status.

#### Acceptance Criteria

1. WHEN a student requests attendance data, THE System SHALL retrieve data matching the student's roll number
2. WHEN attendance data is not found, THE System SHALL display an appropriate error message
3. WHEN the API request fails, THE System SHALL handle the error gracefully and inform the user
4. THE System SHALL fetch attendance data from the `/api/subject-attendance/:rollNumber` endpoint
5. THE System SHALL display attendance data within 2 seconds of page load

### Requirement 6: Navigate to Subject-Wise Attendance

**User Story:** As a student, I want to access the subject-wise attendance page from the dashboard, so that I can easily view my attendance details.

#### Acceptance Criteria

1. WHEN a student clicks the "Attendance" card on the dashboard, THE System SHALL navigate to the subject-wise attendance page
2. WHEN navigating to the attendance page, THE System SHALL pass the student's roll number
3. THE System SHALL display a back button to return to the dashboard
4. WHEN the back button is clicked, THE System SHALL navigate back to the dashboard
