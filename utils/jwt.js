const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate JWT token
const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    return token;
  } catch (error) {
    throw new Error('Token generation failed: ' + error.message);
  }
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed: ' + error.message);
    }
  }
};

// Extract token from request headers
// Extract token from request headers
const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return null;

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return authHeader.trim();
};


module.exports = {
  generateToken,
  verifyToken,
  extractToken
};
