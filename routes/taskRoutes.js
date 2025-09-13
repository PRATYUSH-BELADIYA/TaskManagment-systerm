const express = require('express');
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getMyTasks,
  getTaskStatistics,
  assignTask,
  updateTaskStatus
} = require('../controllers/taskController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All task routes require authentication
router.use(authenticateToken);

// Task statistics
router.get('/statistics', getTaskStatistics);

// My tasks (user's own tasks)
router.get('/my-tasks', getMyTasks);

// CRUD operations
router.post('/', createTask);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// Task status update
router.patch('/:id/status', updateTaskStatus);

// Admin only routes
router.patch('/:id/assign', requireAdmin, assignTask);

module.exports = router;
