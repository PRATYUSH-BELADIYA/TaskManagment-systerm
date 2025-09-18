const notify = require('../models/notification');
const Task = require('../models/Task');
const User = require('../models/User');

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assigned_to, due_date } = req.body;
    const created_by = req.user.id;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    // Validate assigned_to user exists (if provided)
    if (assigned_to) {
      const assignee = await User.findById(assigned_to);
      if (!assignee) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found'
        });
      }
    }

    // Create task
    const taskId = await Task.create({
      title,
      description,
      status,
      priority,
      assigned_to,
      created_by,
      due_date
    });

    // Get created task with user details
    const task = await Task.findById(taskId);

    const notification = await notify.createNotification({
      user_id: created_by,
      message: `${created_by} has created a new task: ${task.title}`,
      type: 'task'
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all tasks with filtering and pagination
const getAllTasks = async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      priority: req.query.priority,
      assigned_to: req.query.assigned_to,
      created_by: req.query.created_by,
      search: req.query.search,
      due_date_from: req.query.due_date_from,
      due_date_to: req.query.due_date_to,
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order
    };

    const result = await Task.findAll(options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to this task (admin, creator, or assignee)
    if (req.user.role !== 'admin' && 
        task.created_by !== req.user.id && 
        task.assigned_to !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigned_to, due_date } = req.body;

    // Check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has permission to update (admin, creator, or assignee)
    if (req.user.role !== 'admin' && 
        existingTask.created_by !== req.user.id && 
        existingTask.assigned_to !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate assigned_to user exists (if provided)
    if (assigned_to && assigned_to !== existingTask.assigned_to) {
      const assignee = await User.findById(assigned_to);
      if (!assignee) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found'
        });
      }
    }

    if (due_date) {
    const dueDateObj = new Date(due_date);
      if (dueDateObj < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Due date cannot be in the past'
        });
      }
    }


    // Update task
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (due_date !== undefined) updateData.due_date = due_date;

    const updated = await Task.update(id, updateData);

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Update failed'
      });
    }

    // Get updated task
    const task = await Task.findById(id);

    const notification = await notify.createNotification({
      user_id: req.user.id || req.user.role === 'admin',
      message: `Task "${task.title}" has been updated by ${req.user.full_name}.`,
      type: 'task_update'
    });
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has permission to delete (admin or creator only)
    if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only task creator or admin can delete tasks.'
      });
    }

    // Delete task
    const deleted = await Task.delete(id);

    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Delete failed'
      });
    }

    const notification = await notify.createNotification({
      user_id: req.user.id || req.user.role === 'admin',
      message: `Task "${task.title}" has been deleted by ${req.user.full_name}.`,
      type: 'task_delete'
    });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's tasks
const getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      priority: req.query.priority,
      type: req.query.type || 'all' // 'created', 'assigned', 'all'
    };

    const result = await Task.findByUser(userId, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get task statistics
const getTaskStatistics = async (req, res) => {
  try {
    // Admin can see all statistics, users see only their own
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const statistics = await Task.getStatistics(userId);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Get task statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Assign task to user (Admin only)
const assignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    // Check if task exists
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Validate assigned_to user exists
    if (assigned_to) {
      const assignee = await User.findById(assigned_to);
      if (!assignee) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found'
        });
      }
    }

    // Update task assignment
    const updated = await Task.update(id, { assigned_to });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Assignment failed'
      });
    }

    // Get updated task
    const updatedTask = await Task.findById(id);

    res.json({
      success: true,
      message: assigned_to ? 'Task assigned successfully' : 'Task unassigned successfully',
      data: { task: updatedTask }
    });
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validation
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
      });
    }

    // Check if task exists
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has permission (admin, creator, or assignee)
    if (req.user.role !== 'admin' && 
        task.created_by !== req.user.id && 
        task.assigned_to !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied : you not have permission to update this task'
      });
    }

    // Update task status
    const updated = await Task.update(id, { status });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Status update failed'
      });
    }

    // Get updated task
    const updatedTask = await Task.findById(id);

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: { task: updatedTask }
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getMyTasks,
  getTaskStatistics,
  assignTask,
  updateTaskStatus
};
