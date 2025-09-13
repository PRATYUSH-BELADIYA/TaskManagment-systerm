require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/database');
const { initializeSchema } = require('./config/schema');

// Import routes
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Task Management System API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      tasks: '/api/tasks'
    },
    documentation: {
      users: {
        'POST /api/users/register': 'Register new user',
        'POST /api/users/login': 'User login',
        'GET /api/users/profile': 'Get user profile (authenticated)',
        'PUT /api/users/profile': 'Update user profile (authenticated)',
        'PUT /api/users/change-password': 'Change password (authenticated)',
        'GET /api/users': 'Get all users (admin only)',
        'GET /api/users/:id': 'Get user by ID (admin only)',
        'PUT /api/users/:id': 'Update user (admin only)',
        'DELETE /api/users/:id': 'Delete user (admin only)',
        'PATCH /api/users/:id/toggle-status': 'Toggle user status (admin only)'
      },
      tasks: {
        'POST /api/tasks': 'Create new task (authenticated)',
        'GET /api/tasks': 'Get all tasks with filters (authenticated)',
        'GET /api/tasks/statistics': 'Get task statistics (authenticated)',
        'GET /api/tasks/my-tasks': 'Get user\'s tasks (authenticated)',
        'GET /api/tasks/:id': 'Get task by ID (authenticated)',
        'PUT /api/tasks/:id': 'Update task (authenticated)',
        'DELETE /api/tasks/:id': 'Delete task (authenticated)',
        'PATCH /api/tasks/:id/status': 'Update task status (authenticated)',
        'PATCH /api/tasks/:id/assign': 'Assign task to user (admin only)'
      }
    }
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry error'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    available_routes: {
      health: 'GET /',
      users: '/api/users',
      tasks: '/api/tasks'
    }
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('Starting Task Management System...');
    
    // Initialize database connection
    console.log('Initializing database connection...');
    await initializeDatabase();
    
    // Initialize database schema
    console.log('Initializing database schema...');
    await initializeSchema();
    
    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 Task Management System started successfully!');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`📖 Documentation: http://localhost:${PORT}/`);
      console.log('');
      console.log('Default Admin Credentials:');
      console.log(`📧 Email: ${process.env.ADMIN_EMAIL}`);
      console.log(`🔐 Password: ${process.env.ADMIN_PASSWORD}`);
      console.log('');
      console.log('API Endpoints:');
      console.log('👥 Users: http://localhost:' + PORT + '/api/users');
      console.log('📋 Tasks: http://localhost:' + PORT + '/api/tasks');
      console.log('');
      console.log('Ready to accept requests! 🎉');
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down Task Management System...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down Task Management System...');
  process.exit(0);
});

// Start the server
startServer();
