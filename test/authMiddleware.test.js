/**
 * Property-Based Tests for Authentication Middleware
 * Feature: student-portal-system, Property 2: Session Protection
 * Validates: Requirements 2.4
 */

const { expect } = require('chai');
const fc = require('fast-check');
const authMiddleware = require('../server/middleware/authMiddleware');

describe('Authentication Middleware - Property Tests', () => {
  
  /**
   * Property 2: Session Protection
   * For any API request to protected endpoints, if a valid session exists,
   * then the request should be processed; otherwise, the request should be
   * rejected with a 401 status code.
   */
  it('should allow requests with valid session and reject without session', () => {
    fc.assert(
      fc.property(
        fc.record({
          rollNumber: fc.string({ minLength: 1, maxLength: 20 }),
          name: fc.string({ minLength: 1, maxLength: 50 })
        }),
        fc.boolean(),
        (studentData, hasSession) => {
          // Mock request object
          const req = {
            session: hasSession ? { student: studentData } : {}
          };
          
          // Mock response object
          let statusCode = 200;
          let responseData = null;
          const res = {
            status: function(code) {
              statusCode = code;
              return this;
            },
            json: function(data) {
              responseData = data;
              return this;
            }
          };
          
          // Mock next function
          let nextCalled = false;
          const next = () => {
            nextCalled = true;
          };
          
          // Call middleware
          authMiddleware(req, res, next);
          
          // Verify behavior based on session existence
          if (hasSession) {
            // Valid session: next() should be called
            expect(nextCalled).to.be.true;
            expect(statusCode).to.equal(200);
          } else {
            // No session: should return 401
            expect(nextCalled).to.be.false;
            expect(statusCode).to.equal(401);
            expect(responseData).to.have.property('success', false);
            expect(responseData).to.have.property('message');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Session must contain student data
   * For any request, if session exists but doesn't contain student data,
   * the request should be rejected with 401
   */
  it('should reject requests with session but no student data', () => {
    fc.assert(
      fc.property(
        fc.anything(),
        (sessionData) => {
          // Mock request with session but no student property
          const req = {
            session: { someOtherData: sessionData }
          };
          
          // Mock response object
          let statusCode = 200;
          let responseData = null;
          const res = {
            status: function(code) {
              statusCode = code;
              return this;
            },
            json: function(data) {
              responseData = data;
              return this;
            }
          };
          
          // Mock next function
          let nextCalled = false;
          const next = () => {
            nextCalled = true;
          };
          
          // Call middleware
          authMiddleware(req, res, next);
          
          // Should reject (no student data in session)
          expect(nextCalled).to.be.false;
          expect(statusCode).to.equal(401);
          expect(responseData).to.have.property('success', false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
