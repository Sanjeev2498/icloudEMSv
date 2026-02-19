/**
 * Authentication Middleware
 * Validates if user session exists and contains student data
 * Returns 401 for unauthenticated requests
 */

function authMiddleware(req, res, next) {
  // Check if session exists and contains student data
  if (req.session && req.session.student) {
    // Session is valid, proceed to next middleware/route
    next();
  } else {
    // No valid session, return 401 Unauthorized
    res.status(401).json({
      success: false,
      message: 'Unauthorized. Please login first.'
    });
  }
}

module.exports = authMiddleware;
