const { promisePool } = require('../config/database');

class Task {
  // Create new task
  static async create(taskData) {
    try {
      const { title, description, status, priority, assigned_to, created_by, due_date } = taskData;
      
      const [result] = await promisePool.execute(
        'INSERT INTO tasks (title, description, status, priority, assigned_to, created_by, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, description, status || 'pending', priority || 'medium', assigned_to || null, created_by, due_date || null]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Find task by ID with user details
  static async findById(id) {
    try {
      const [tasks] = await promisePool.execute(`
        SELECT 
          t.*,
          creator.full_name as creator_name,
          creator.email as creator_email,
          assignee.full_name as assignee_name,
          assignee.email as assignee_email
        FROM tasks t
        LEFT JOIN users creator ON t.created_by = creator.id
        LEFT JOIN users assignee ON t.assigned_to = assignee.id
        WHERE t.id = ?
      `, [id]);

      return tasks.length > 0 ? tasks[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all tasks with pagination and filters
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        priority,
        assigned_to,
        created_by,
        search,
        due_date_from,
        due_date_to,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      let query = `
        SELECT 
          t.*,
          creator.full_name as creator_name,
          creator.email as creator_email,
          assignee.full_name as assignee_name,
          assignee.email as assignee_email
        FROM tasks t
        LEFT JOIN users creator ON t.created_by = creator.id
        LEFT JOIN users assignee ON t.assigned_to = assignee.id
        WHERE 1=1
      `;
      let params = [];

      // Apply filters
      if (status) {
        query += ' AND t.status = ?';
        params.push(status);
      }

      if (priority) {
        query += ' AND t.priority = ?';
        params.push(priority);
      }

      if (assigned_to) {
        query += ' AND t.assigned_to = ?';
        params.push(assigned_to);
      }

      if (created_by) {
        query += ' AND t.created_by = ?';
        params.push(created_by);
      }

      if (search) {
        query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      if (due_date_from) {
        query += ' AND t.due_date >= ?';
        params.push(due_date_from);
      }

      if (due_date_to) {
        query += ' AND t.due_date <= ?';
        params.push(due_date_to);
      }

      // Add sorting
      const validSortColumns = ['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title'];
      const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      query += ` ORDER BY t.${sortColumn} ${sortDirection}`;
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [tasks] = await promisePool.execute(query, params);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM tasks t
        WHERE 1=1
      `;
      let countParams = [];

      // Apply same filters for count
      if (status) {
        countQuery += ' AND t.status = ?';
        countParams.push(status);
      }

      if (priority) {
        countQuery += ' AND t.priority = ?';
        countParams.push(priority);
      }

      if (assigned_to) {
        countQuery += ' AND t.assigned_to = ?';
        countParams.push(assigned_to);
      }

      if (created_by) {
        countQuery += ' AND t.created_by = ?';
        countParams.push(created_by);
      }

      if (search) {
        countQuery += ' AND (t.title LIKE ? OR t.description LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`);
      }

      if (due_date_from) {
        countQuery += ' AND t.due_date >= ?';
        countParams.push(due_date_from);
      }

      if (due_date_to) {
        countQuery += ' AND t.due_date <= ?';
        countParams.push(due_date_to);
      }

      const [countResult] = await promisePool.execute(countQuery, countParams);
      const total = countResult[0].total;

      return {
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update task
  static async update(id, updateData) {
    try {
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      // If status is being updated to 'completed', set completed_at
      if (updateData.status === 'completed' && !updateData.completed_at) {
        fields.push('completed_at = ?');
        values.push(new Date());
      } else if (updateData.status && updateData.status !== 'completed') {
        fields.push('completed_at = ?');
        values.push(null);
      }

      values.push(id);

      const [result] = await promisePool.execute(
        `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete task
  static async delete(id) {
    try {
      const [result] = await promisePool.execute(
        'DELETE FROM tasks WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get tasks by user (assigned or created by)
  static async findByUser(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        priority,
        type = 'all' // 'created', 'assigned', 'all'
      } = options;

      const offset = (page - 1) * limit;
      let query = `
        SELECT 
          t.*,
          creator.full_name as creator_name,
          creator.email as creator_email,
          assignee.full_name as assignee_name,
          assignee.email as assignee_email
        FROM tasks t
        LEFT JOIN users creator ON t.created_by = creator.id
        LEFT JOIN users assignee ON t.assigned_to = assignee.id
        WHERE 
      `;
      let params = [];

      // Filter by user relationship
      if (type === 'created') {
        query += 't.created_by = ?';
        params.push(userId);
      } else if (type === 'assigned') {
        query += 't.assigned_to = ?';
        params.push(userId);
      } else {
        query += '(t.created_by = ? OR t.assigned_to = ?)';
        params.push(userId, userId);
      }

      // Apply additional filters
      if (status) {
        query += ' AND t.status = ?';
        params.push(status);
      }

      if (priority) {
        query += ' AND t.priority = ?';
        params.push(priority);
      }

      query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [tasks] = await promisePool.execute(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM tasks WHERE ';
      let countParams = [];

      if (type === 'created') {
        countQuery += 'created_by = ?';
        countParams.push(userId);
      } else if (type === 'assigned') {
        countQuery += 'assigned_to = ?';
        countParams.push(userId);
      } else {
        countQuery += '(created_by = ? OR assigned_to = ?)';
        countParams.push(userId, userId);
      }

      if (status) {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }

      if (priority) {
        countQuery += ' AND priority = ?';
        countParams.push(priority);
      }

      const [countResult] = await promisePool.execute(countQuery, countParams);
      const total = countResult[0].total;

      return {
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get task statistics
  static async getStatistics(userId = null) {
    try {
      let baseQuery = 'SELECT status, COUNT(*) as count FROM tasks';
      let params = [];

      if (userId) {
        baseQuery += ' WHERE (created_by = ? OR assigned_to = ?)';
        params.push(userId, userId);
      }

      baseQuery += ' GROUP BY status';

      const [statusStats] = await promisePool.execute(baseQuery, params);

      // Get priority stats
      let priorityQuery = 'SELECT priority, COUNT(*) as count FROM tasks';
      let priorityParams = [];

      if (userId) {
        priorityQuery += ' WHERE (created_by = ? OR assigned_to = ?)';
        priorityParams.push(userId, userId);
      }

      priorityQuery += ' GROUP BY priority';

      const [priorityStats] = await promisePool.execute(priorityQuery, priorityParams);

      // Get overdue tasks count
      let overdueQuery = 'SELECT COUNT(*) as count FROM tasks WHERE due_date < CURDATE() AND status NOT IN ("completed", "cancelled")';
      let overdueParams = [];

      if (userId) {
        overdueQuery += ' AND (created_by = ? OR assigned_to = ?)';
        overdueParams.push(userId, userId);
      }

      const [overdueResult] = await promisePool.execute(overdueQuery, overdueParams);

      return {
        status: statusStats,
        priority: priorityStats,
        overdue: overdueResult[0].count
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Task;
