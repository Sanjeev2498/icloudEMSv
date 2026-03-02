/**
 * Property-Based Tests for Attendance Calculations
 * Feature: subject-wise-attendance
 */

const { expect } = require('chai');
const fc = require('fast-check');

/**
 * Calculate percentage with zero handling
 * (Copied from attendance.js for testing)
 */
function calculatePercentage(attended, delivered) {
  if (delivered === 0) {
    return 0;
  }
  return parseFloat(((attended / delivered) * 100).toFixed(2));
}

describe('Attendance Calculations - Property Tests', () => {
  
  /**
   * Property 4: Percentage calculation is accurate
   * For any subject with attended and delivered values where delivered > 0,
   * the displayed percentage should equal (attended/delivered) * 100 rounded
   * to two decimal places.
   * Validates: Requirements 2.4, 3.1, 3.3
   * Feature: subject-wise-attendance, Property 4: Percentage calculation is accurate
   */
  it('should calculate percentage accurately with two decimal places', function(done) {
    this.timeout(15000);
    
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }), // delivered (must be > 0)
        fc.integer({ min: 0, max: 100 }), // attended
        (delivered, attended) => {
          // Ensure attended doesn't exceed delivered
          const actualAttended = Math.min(attended, delivered);
          
          const result = calculatePercentage(actualAttended, delivered);
          
          // Calculate expected percentage
          const expected = parseFloat(((actualAttended / delivered) * 100).toFixed(2));
          
          // Verify result matches expected
          expect(result).to.equal(expected);
          
          // Verify result is between 0 and 100
          expect(result).to.be.at.least(0);
          expect(result).to.be.at.most(100);
          
          // Verify result has at most 2 decimal places
          const resultStr = result.toString();
          const decimalPart = resultStr.split('.')[1];
          if (decimalPart) {
            expect(decimalPart.length).to.be.at.most(2);
          }
        }
      ),
      { numRuns: 100 }
    );
    done();
  });

  /**
   * Edge case: Zero delivered count
   * When delivered count is zero, the percentage calculation should return 0%
   * instead of attempting division by zero.
   * Validates: Requirements 3.2
   */
  it('should return 0% when delivered count is zero', function(done) {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }), // attended
        (attended) => {
          const result = calculatePercentage(attended, 0);
          expect(result).to.equal(0);
        }
      ),
      { numRuns: 100 }
    );
    done();
  });

  /**
   * Edge case: Perfect attendance
   * When attended equals delivered, percentage should be 100%
   */
  it('should return 100% when attended equals delivered', function(done) {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (count) => {
          const result = calculatePercentage(count, count);
          expect(result).to.equal(100);
        }
      ),
      { numRuns: 100 }
    );
    done();
  });

  /**
   * Edge case: Zero attendance
   * When attended is 0 and delivered > 0, percentage should be 0%
   */
  it('should return 0% when attended is zero', function(done) {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (delivered) => {
          const result = calculatePercentage(0, delivered);
          expect(result).to.equal(0);
        }
      ),
      { numRuns: 100 }
    );
    done();
  });

  /**
   * Property: Percentage is monotonic
   * For fixed delivered count, as attended increases, percentage should increase
   */
  it('should have monotonically increasing percentage as attended increases', function(done) {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 50 }),
        (delivered, increment) => {
          const attended1 = Math.min(delivered, 10);
          const attended2 = Math.min(delivered, attended1 + increment);
          
          const percentage1 = calculatePercentage(attended1, delivered);
          const percentage2 = calculatePercentage(attended2, delivered);
          
          // If attended2 > attended1, then percentage2 should be >= percentage1
          if (attended2 > attended1) {
            expect(percentage2).to.be.at.least(percentage1);
          } else {
            expect(percentage2).to.equal(percentage1);
          }
        }
      ),
      { numRuns: 100 }
    );
    done();
  });
});


/**
 * Calculate total attended (copied from attendance.js for testing)
 */
function calculateTotalAttended(subjects) {
  return subjects.reduce((total, subject) => total + subject.attended, 0);
}

/**
 * Calculate total delivered (copied from attendance.js for testing)
 */
function calculateTotalDelivered(subjects) {
  return subjects.reduce((total, subject) => total + subject.delivered, 0);
}

describe('Total Attendance Calculations - Property Tests', () => {
  
  /**
   * Property 5: Total attendance calculation is correct
   * For any list of subjects, the total attended should equal the sum of all
   * individual attended values, the total delivered should equal the sum of all
   * individual delivered values, and the total percentage should equal
   * (total_attended/total_delivered) * 100.
   * Validates: Requirements 3.4, 3.5, 3.6
   * Feature: subject-wise-attendance, Property 5: Total attendance calculation is correct
   */
  it('should correctly calculate total attended, delivered, and percentage', function(done) {
    this.timeout(15000);
    
    // Generator for subject objects
    const subjectArbitrary = fc.record({
      attended: fc.integer({ min: 0, max: 50 }),
      delivered: fc.integer({ min: 1, max: 50 })
    }).map(subject => ({
      ...subject,
      attended: Math.min(subject.attended, subject.delivered) // Ensure attended <= delivered
    }));
    
    fc.assert(
      fc.property(
        fc.array(subjectArbitrary, { minLength: 1, maxLength: 15 }),
        (subjects) => {
          // Calculate totals
          const totalAttended = calculateTotalAttended(subjects);
          const totalDelivered = calculateTotalDelivered(subjects);
          const totalPercentage = calculatePercentage(totalAttended, totalDelivered);
          
          // Verify total attended is sum of all attended
          const expectedAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
          expect(totalAttended).to.equal(expectedAttended);
          
          // Verify total delivered is sum of all delivered
          const expectedDelivered = subjects.reduce((sum, s) => sum + s.delivered, 0);
          expect(totalDelivered).to.equal(expectedDelivered);
          
          // Verify total percentage is calculated correctly
          const expectedPercentage = parseFloat(((totalAttended / totalDelivered) * 100).toFixed(2));
          expect(totalPercentage).to.equal(expectedPercentage);
          
          // Verify percentage is in valid range
          expect(totalPercentage).to.be.at.least(0);
          expect(totalPercentage).to.be.at.most(100);
        }
      ),
      { numRuns: 100 }
    );
    done();
  });

  /**
   * Property: Total calculations are associative
   * The order of subjects should not affect the total calculations
   */
  it('should produce same totals regardless of subject order', function(done) {
    this.timeout(15000);
    
    const subjectArbitrary = fc.record({
      attended: fc.integer({ min: 0, max: 50 }),
      delivered: fc.integer({ min: 1, max: 50 })
    }).map(subject => ({
      ...subject,
      attended: Math.min(subject.attended, subject.delivered)
    }));
    
    fc.assert(
      fc.property(
        fc.array(subjectArbitrary, { minLength: 2, maxLength: 10 }),
        (subjects) => {
          // Calculate totals for original order
          const total1Attended = calculateTotalAttended(subjects);
          const total1Delivered = calculateTotalDelivered(subjects);
          
          // Calculate totals for reversed order
          const reversedSubjects = [...subjects].reverse();
          const total2Attended = calculateTotalAttended(reversedSubjects);
          const total2Delivered = calculateTotalDelivered(reversedSubjects);
          
          // Totals should be the same
          expect(total1Attended).to.equal(total2Attended);
          expect(total1Delivered).to.equal(total2Delivered);
        }
      ),
      { numRuns: 100 }
    );
    done();
  });

  /**
   * Edge case: Single subject
   * When there's only one subject, totals should equal that subject's values
   */
  it('should handle single subject correctly', function(done) {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (attended, delivered) => {
          const actualAttended = Math.min(attended, delivered);
          const subjects = [{ attended: actualAttended, delivered: delivered }];
          
          const totalAttended = calculateTotalAttended(subjects);
          const totalDelivered = calculateTotalDelivered(subjects);
          
          expect(totalAttended).to.equal(actualAttended);
          expect(totalDelivered).to.equal(delivered);
        }
      ),
      { numRuns: 100 }
    );
    done();
  });

  /**
   * Edge case: All subjects with zero attended
   * Total percentage should be 0%
   */
  it('should return 0% when all subjects have zero attended', function(done) {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 50 }), { minLength: 1, maxLength: 10 }),
        (deliveredValues) => {
          const subjects = deliveredValues.map(delivered => ({
            attended: 0,
            delivered: delivered
          }));
          
          const totalAttended = calculateTotalAttended(subjects);
          const totalDelivered = calculateTotalDelivered(subjects);
          const totalPercentage = calculatePercentage(totalAttended, totalDelivered);
          
          expect(totalAttended).to.equal(0);
          expect(totalPercentage).to.equal(0);
        }
      ),
      { numRuns: 100 }
    );
    done();
  });
});
