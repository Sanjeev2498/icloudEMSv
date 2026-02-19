/**
 * Integration Tests for Complete User Flows
 * Feature: student-portal-system
 * Validates: All Requirements
 */

const { expect } = require('chai');
const request = require('supertest');
const app = require('../server/server');

describe('Integration Tests - Complete User Flows', () => {
  
  /**
   * Test: Complete login → navigate → view data → logout flow
   */
  it('should complete full user journey from login to logout', async function() {
    this.timeout(10000);
    
    // Step 1: Login
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        rollNumber: '2401420048',
        password: 'Simran@111'
      });
    
    expect(loginResponse.status).to.equal(200);
    expect(loginResponse.body.success).to.be.true;
    expect(loginResponse.body.student).to.have.property('rollNumber', '2401420048');
    
    const cookies = loginResponse.headers['set-cookie'];
    expect(cookies).to.exist;
    
    // Step 2: Access student data
    const studentResponse = await request(app)
      .get('/api/student/2401420048')
      .set('Cookie', cookies);
    
    expect(studentResponse.status).to.equal(200);
    expect(studentResponse.body.success).to.be.true;
    expect(studentResponse.body.student).to.have.property('name');
    
    // Step 3: Access attendance data
    const attendanceResponse = await request(app)
      .get('/api/attendance/2401420048')
      .set('Cookie', cookies);
    
    expect(attendanceResponse.status).to.equal(200);
    expect(attendanceResponse.body.success).to.be.true;
    expect(attendanceResponse.body.attendance).to.have.property('percentage');
    
    // Step 4: Access timetable
    const timetableResponse = await request(app)
      .get('/api/timetable')
      .set('Cookie', cookies);
    
    expect(timetableResponse.status).to.equal(200);
    expect(timetableResponse.body.success).to.be.true;
    expect(timetableResponse.body.timetable).to.be.an('array');
    
    // Step 5: Access report card
    const reportCardResponse = await request(app)
      .get('/api/reportcard/2401420048')
      .set('Cookie', cookies);
    
    expect(reportCardResponse.status).to.equal(200);
    expect(reportCardResponse.body.success).to.be.true;
    expect(reportCardResponse.body.reportCard).to.have.property('grade');
    
    // Step 6: Access fees
    const feesResponse = await request(app)
      .get('/api/fees/2401420048')
      .set('Cookie', cookies);
    
    expect(feesResponse.status).to.equal(200);
    expect(feesResponse.body.success).to.be.true;
    expect(feesResponse.body.fees).to.have.property('status');
    
    // Step 7: Logout
    const logoutResponse = await request(app)
      .post('/api/logout')
      .set('Cookie', cookies);
    
    expect(logoutResponse.status).to.equal(200);
    expect(logoutResponse.body.success).to.be.true;
    
    // Step 8: Verify session is destroyed (should get 401)
    const afterLogoutResponse = await request(app)
      .get('/api/student/2401420048')
      .set('Cookie', cookies);
    
    expect(afterLogoutResponse.status).to.equal(401);
  });

  /**
   * Test: Error handling for invalid login
   */
  it('should handle invalid login credentials', async function() {
    this.timeout(5000);
    
    const response = await request(app)
      .post('/api/login')
      .send({
        rollNumber: 'invalid',
        password: 'wrong'
      });
    
    expect(response.status).to.equal(401);
    expect(response.body.success).to.be.false;
    expect(response.body.message).to.exist;
  });

  /**
   * Test: Error handling for empty credentials
   */
  it('should handle empty credentials', async function() {
    this.timeout(5000);
    
    const response = await request(app)
      .post('/api/login')
      .send({
        rollNumber: '',
        password: ''
      });
    
    expect(response.status).to.equal(400);
    expect(response.body.success).to.be.false;
    expect(response.body.message).to.include('required');
  });

  /**
   * Test: Unauthorized access to protected endpoints
   */
  it('should block unauthenticated access to protected endpoints', async function() {
    this.timeout(5000);
    
    const endpoints = [
      '/api/student/2401420048',
      '/api/attendance/2401420048',
      '/api/timetable',
      '/api/reportcard/2401420048',
      '/api/fees/2401420048'
    ];
    
    for (const endpoint of endpoints) {
      const response = await request(app).get(endpoint);
      expect(response.status).to.equal(401);
      expect(response.body.success).to.be.false;
    }
  });

  /**
   * Test: Data consistency across endpoints
   */
  it('should maintain data consistency across all endpoints', async function() {
    this.timeout(10000);
    
    // Login
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        rollNumber: '2401420048',
        password: 'Simran@111'
      });
    
    const cookies = loginResponse.headers['set-cookie'];
    
    // Fetch all data
    const [studentRes, attendanceRes, reportCardRes, feesRes] = await Promise.all([
      request(app).get('/api/student/2401420048').set('Cookie', cookies),
      request(app).get('/api/attendance/2401420048').set('Cookie', cookies),
      request(app).get('/api/reportcard/2401420048').set('Cookie', cookies),
      request(app).get('/api/fees/2401420048').set('Cookie', cookies)
    ]);
    
    // Verify all requests succeeded
    expect(studentRes.status).to.equal(200);
    expect(attendanceRes.status).to.equal(200);
    expect(reportCardRes.status).to.equal(200);
    expect(feesRes.status).to.equal(200);
    
    // Verify roll number consistency
    expect(studentRes.body.student.rollNumber).to.equal('2401420048');
    expect(attendanceRes.body.attendance.rollNumber).to.equal('2401420048');
    expect(reportCardRes.body.reportCard.rollNumber).to.equal('2401420048');
    expect(feesRes.body.fees.rollNumber).to.equal('2401420048');
  });
});
