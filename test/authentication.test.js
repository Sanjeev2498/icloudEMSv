/**
 * Property-Based Tests for Authentication
 * Feature: student-portal-system
 */

const { expect } = require('chai');
const fc = require('fast-check');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Import app
const app = require('../server/server');

describe('Authentication - Property Tests', () => {
  
  /**
   * Property 1: Authentication Validation
   * For any student credentials (roll number and password), if the credentials
   * match a record in the database, then authentication should succeed and create
   * a valid session; otherwise, authentication should fail with an error message.
   * Validates: Requirements 1.1, 1.2, 1.3
   */
  it('should authenticate valid credentials and reject invalid ones', function(done) {
    this.timeout(15000);
    
    // Valid credentials map
    const validCredentials = {
      '2401420048': 'Simran@111',
      '2021002': 'password123',
      '2021003': 'password123'
    };
    
    fc.assert(
      fc.asyncProperty(
        fc.constantFrom('2401420048', '2021002', '2021003'),
        fc.boolean(),
        async (rollNumber, useValidPassword) => {
          const password = useValidPassword ? validCredentials[rollNumber] : 'wrongpassword123';
          
          const response = await request(app)
            .post('/api/login')
            .send({
              rollNumber: rollNumber,
              password: password
            });
          
          if (useValidPassword) {
            // Valid credentials: should succeed
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('success', true);
            expect(response.body).to.have.property('student');
            expect(response.body.student).to.have.property('rollNumber', rollNumber);
          } else {
            // Invalid credentials: should fail
            expect(response.status).to.equal(401);
            expect(response.body).to.have.property('success', false);
            expect(response.body).to.have.property('message');
          }
        }
      ),
      { numRuns: 100 }
    ).then(() => done()).catch(done);
  });

  /**
   * Property 10: Empty Credential Rejection
   * For any login attempt where roll number or password is empty or contains
   * only whitespace, the authentication should fail with a validation error message.
   * Validates: Requirements 1.4
   */
  it('should reject empty or whitespace-only credentials', function(done) {
    this.timeout(15000);
    
    fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc.constant('\t'),
          fc.constant('\n')
        ),
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc.constant('\t'),
          fc.constant('\n')
        ),
        async (rollNumber, password) => {
          const response = await request(app)
            .post('/api/login')
            .send({
              rollNumber: rollNumber,
              password: password
            });
          
          // Should reject with 400 Bad Request
          expect(response.status).to.equal(400);
          expect(response.body).to.have.property('success', false);
          expect(response.body).to.have.property('message');
          expect(response.body.message).to.include('required');
        }
      ),
      { numRuns: 100 }
    ).then(() => done()).catch(done);
  });

  /**
   * Property 3: Session Termination
   * For any authenticated session, when logout is triggered, the session should
   * be destroyed and subsequent requests should be treated as unauthenticated.
   * Validates: Requirements 2.2
   */
  it('should destroy session on logout', function(done) {
    this.timeout(15000);
    
    fc.assert(
      fc.asyncProperty(
        fc.constant('2401420048'),
        fc.constant('Simran@111'),
        async (rollNumber, password) => {
          // First, login
          const loginResponse = await request(app)
            .post('/api/login')
            .send({ rollNumber, password });
          
          expect(loginResponse.status).to.equal(200);
          
          // Extract session cookie
          const cookies = loginResponse.headers['set-cookie'];
          
          // Then, logout
          const logoutResponse = await request(app)
            .post('/api/logout')
            .set('Cookie', cookies);
          
          expect(logoutResponse.status).to.equal(200);
          expect(logoutResponse.body).to.have.property('success', true);
          
          // Verify session is destroyed by trying to access protected endpoint
          // (This will be tested more thoroughly when we add protected endpoints)
        }
      ),
      { numRuns: 100 }
    ).then(() => done()).catch(done);
  });
});
