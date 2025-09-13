const { verifyToken, extractToken } = require('../utils/jwt');
const { promisePool } = require('../config/database');

// Middleware to authenticate user
const authenticateToken = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database to ensure user still exists and is active
    const [users] = await promisePool.execute(
      'SELECT id, email, full_name, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated.'
      });
    }

    // Add user info to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Middleware to check if user is admin or the resource owner
const requireAdminOrOwner = (userIdField = 'id') => {
  return (req, res, next) => {
    const requestedUserId = req.params[userIdField] || req.body[userIdField];
    
    if (req.user.role === 'admin' || req.user.id == requestedUserId) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient privileges.'
      });
    }
  };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = verifyToken(token);
      
      const [users] = await promisePool.execute(
        'SELECT id, email, full_name, role, is_active FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (users.length > 0 && users[0].is_active) {
        req.user = users[0];
      }
    }
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAdminOrOwner,
  optionalAuth
};
