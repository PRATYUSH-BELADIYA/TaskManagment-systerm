const { promisePool } = require('../config/database');

class User {
  // Create new user
  static async create(userData) {
    try {
      const { email, password, full_name, role = 'user' } = userData;
      
      const [result] = await promisePool.execute(
        'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
        [email, password, full_name, role]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const [users] = await promisePool.execute(
        'SELECT id, email, full_name, role, is_active, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );

      return users.length > 0 ? users[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const [users] = await promisePool.execute(
        'SELECT id, email, password, full_name, role, is_active FROM users WHERE email = ?',
        [email]
      );

      return users.length > 0 ? users[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all users with pagination
static async findAll(page = 1, limit = 10, search = '') {
  try {
    // force numbers
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    const offset = (page - 1) * limit;

    let query = `
      SELECT id, email, full_name, role, is_active, created_at 
      FROM users
    `;
    let params = [];

    if (search) {
      query += ' WHERE full_name LIKE ? OR email LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }

    query += ` ORDER BY created_at LIMIT ${limit} OFFSET ${offset}`;

    console.log("DEBUG params:", params);

    const [users] = await promisePool.execute(query, params);

    // Count query for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    let countParams = [];

    if (search) {
      countQuery += ' WHERE full_name LIKE ? OR email LIKE ?';
      countParams = [`%${search}%`, `%${search}%`];
    }

    const [countResult] = await promisePool.execute(countQuery, countParams);
    const total = countResult[0].total;

    return {
      users,
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

  // Update user
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

      values.push(id);

      const [result] = await promisePool.execute(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete user (soft delete by deactivating)
  static async delete(id) {
    try {
      const [result] = await promisePool.execute(
        'UPDATE users SET is_active = false WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Hard delete user
  static async hardDelete(id) {
    try {
      const [result] = await promisePool.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Check if email exists
  static async emailExists(email, excludeId = null) {
    try {
      let query = 'SELECT id FROM users WHERE email = ?';
      let params = [email];

      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }

      const [users] = await promisePool.execute(query, params);
      return users.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Activate/Deactivate user
  static async toggleStatus(id) {
    try {
      const [result] = await promisePool.execute(
        'UPDATE users SET is_active = NOT is_active WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
