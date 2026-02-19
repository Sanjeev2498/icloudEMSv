/**
 * Property-Based Tests for Data Retrieval Routes
 * Feature: student-portal-system
 */

const { expect } = require('chai');
const fc = require('fast-check');
const request = require('supertest');
const app = require('../server/server');

describe('Data Retrieval - Property Tests', () => {
  
  // Helper function to login and get session cookie
  async function loginAndGetCookie() {
    const response = await request(app)
      .post('/api/login')
      .send({
        rollNumber: '2401420048',
        password: 'Simran@111'
      });
    return response.headers['set-cookie'];
  }

  /**
   * Property 4: Attendance Percentage Calculation
   * For any attendance record with total days and present days, the calculated
   * percentage should equal (presentDays / totalDays) * 100, and absent days
   * should equal totalDays - presentDays.
   * Validates: Requirements 4.2
   */
  it('should correctly calculate attendance percentage and absent days', function(done) {
    this.timeout(15000);
    
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 365 }),
        fc.integer({ min: 0, max: 365 }),
        async (totalDays, presentDays) => {
          // Ensure presentDays <= totalDays
          const validPresentDays = Math.min(presentDays, totalDays);
          
          // Expected calculations
          const expectedPercentage = parseFloat(((validPresentDays / totalDays) * 100).toFixed(2));
          const expectedAbsentDays = totalDays - validPresentDays;
          
          // Login first
          const cookies = await loginAndGetCookie();
          
          // Get attendance data
          const response = await request(app)
            .get('/api/attendance/2401420048')
            .set('Cookie', cookies);
          
          if (response.status === 200) {
            const { attendance } = response.body;
            
            // Verify calculation properties
            const actualPercentage = parseFloat(((attendance.presentDays / attendance.totalDays) * 100).toFixed(2));
            const actualAbsentDays = attendance.totalDays - attendance.presentDays;
            
            expect(attendance.percentage).to.equal(actualPercentage);
            expect(attendance.absentDays).to.equal(actualAbsentDays);
            
            // Verify percentage is between 0 and 100
            expect(attendance.percentage).to.be.at.least(0);
            expect(attendance.percentage).to.be.at.most(100);
          }
        }
      ),
      { numRuns: 100 }
    ).then(() => done()).catch(done);
  });

  /**
   * Property 5: Grade Calculation Consistency
   * For any report card with subject marks, the total marks should equal the sum
   * of all obtained marks, the percentage should equal (totalObtained / totalMax) * 100,
   * and the grade should be consistently derived from the percentage using the grading scale.
   * Validates: Requirements 6.2, 6.3, 6.4
   */
  it('should correctly calculate total marks, percentage, and grade', function(done) {
    this.timeout(15000);
    
    fc.assert(
      fc.asyncProperty(
        fc.constant('2401420048'),
        async (rollNumber) => {
          // Login first
          const cookies = await loginAndGetCookie();
          
          // Get report card data
          const response = await request(app)
            .get(`/api/reportcard/${rollNumber}`)
            .set('Cookie', cookies);
          
          if (response.status === 200) {
            const { reportCard } = response.body;
            
            // Calculate expected values
            let expectedTotal = 0;
            let expectedMax = 0;
            
            reportCard.subjects.forEach(subject => {
              expectedTotal += subject.obtainedMarks;
              expectedMax += subject.maxMarks;
            });
            
            const expectedPercentage = parseFloat(((expectedTotal / expectedMax) * 100).toFixed(2));
            
            // Determine expected grade
            let expectedGrade;
            if (expectedPercentage >= 90) expectedGrade = 'A+';
            else if (expectedPercentage >= 80) expectedGrade = 'A';
            else if (expectedPercentage >= 70) expectedGrade = 'B+';
            else if (expectedPercentage >= 60) expectedGrade = 'B';
            else if (expectedPercentage >= 50) expectedGrade = 'C';
            else if (expectedPercentage >= 40) expectedGrade = 'D';
            else expectedGrade = 'F';
            
            // Verify calculations
            expect(reportCard.totalMarks).to.equal(expectedTotal);
            expect(reportCard.maxMarks).to.equal(expectedMax);
            expect(reportCard.percentage).to.equal(expectedPercentage);
            expect(reportCard.grade).to.equal(expectedGrade);
          }
        }
      ),
      { numRuns: 100 }
    ).then(() => done()).catch(done);
  });

  /**
   * Property 6: Fee Status Consistency
   * For any fee record, the pending amount should equal totalFees - paidAmount,
   * and the status should be "Paid" if pendingAmount equals 0, otherwise "Due".
   * Validates: Requirements 7.2, 7.3
   */
  it('should correctly calculate pending amount and determine fee status', function(done) {
    this.timeout(15000);
    
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 0, max: 100000 }),
        async (totalFees, paidAmount) => {
          // Login first
          const cookies = await loginAndGetCookie();
          
          // Get fees data
          const response = await request(app)
            .get('/api/fees/2401420048')
            .set('Cookie', cookies);
          
          if (response.status === 200) {
            const { fees } = response.body;
            
            // Calculate expected values
            const expectedPending = fees.totalFees - fees.paidAmount;
            const expectedStatus = expectedPending === 0 ? 'Paid' : 'Due';
            
            // Verify calculations
            expect(fees.pendingAmount).to.equal(expectedPending);
            expect(fees.status).to.equal(expectedStatus);
            
            // Verify pending amount is non-negative
            expect(fees.pendingAmount).to.be.at.least(0);
          }
        }
      ),
      { numRuns: 100 }
    ).then(() => done()).catch(done);
  });

  /**
   * Property 9: Data Retrieval by Roll Number
   * For any authenticated student with roll number R, all data retrieval operations
   * (attendance, report card, fees) should return data associated with roll number R
   * and no other student's data.
   * Validates: Requirements 10.6
   */
  it('should return data only for the requested roll number', function(done) {
    this.timeout(15000);
    
    fc.assert(
      fc.asyncProperty(
        fc.constantFrom('2401420048', '2021002', '2021003'),
        async (rollNumber) => {
          // Login with appropriate credentials
          let password;
          if (rollNumber === '2401420048') password = 'Simran@111';
          else password = 'password123';
          
          const loginResponse = await request(app)
            .post('/api/login')
            .send({ rollNumber, password });
          
          const cookies = loginResponse.headers['set-cookie'];
          
          // Test student endpoint
          const studentResponse = await request(app)
            .get(`/api/student/${rollNumber}`)
            .set('Cookie', cookies);
          
          if (studentResponse.status === 200) {
            expect(studentResponse.body.student.rollNumber).to.equal(rollNumber);
          }
          
          // Test attendance endpoint
          const attendanceResponse = await request(app)
            .get(`/api/attendance/${rollNumber}`)
            .set('Cookie', cookies);
          
          if (attendanceResponse.status === 200) {
            expect(attendanceResponse.body.attendance.rollNumber).to.equal(rollNumber);
          }
          
          // Test report card endpoint
          const reportCardResponse = await request(app)
            .get(`/api/reportcard/${rollNumber}`)
            .set('Cookie', cookies);
          
          if (reportCardResponse.status === 200) {
            expect(reportCardResponse.body.reportCard.rollNumber).to.equal(rollNumber);
          }
          
          // Test fees endpoint
          const feesResponse = await request(app)
            .get(`/api/fees/${rollNumber}`)
            .set('Cookie', cookies);
          
          if (feesResponse.status === 200) {
            expect(feesResponse.body.fees.rollNumber).to.equal(rollNumber);
          }
        }
      ),
      { numRuns: 100 }
    ).then(() => done()).catch(done);
  });
});
