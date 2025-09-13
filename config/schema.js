const { promisePool } = require('./database');

const createTables = async () => {
  try {
    // Create users table (for admin users)
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    // Create tasks table
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        assigned_to INT,
        created_by INT NOT NULL,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Create task_comments table for task comments/notes
    const createTaskCommentsTable = `
      CREATE TABLE IF NOT EXISTS task_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        user_id INT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Create task_attachments table for file attachments
    const createTaskAttachmentsTable = `
      CREATE TABLE IF NOT EXISTS task_attachments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT,
        uploaded_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Execute table creation
    await promisePool.execute(createUsersTable);
    console.log('Users table created successfully');

    await promisePool.execute(createTasksTable);
    console.log('Tasks table created successfully');

    await promisePool.execute(createTaskCommentsTable);
    console.log('Task comments table created successfully');

    await promisePool.execute(createTaskAttachmentsTable);
    console.log('Task attachments table created successfully');

    console.log('All database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error.message);
    throw error;
  }
};

// Function to create default admin user
const createDefaultAdmin = async () => {
  const bcrypt = require('bcryptjs');
  
  try {
    // Check if admin user already exists
    const [existingAdmin] = await promisePool.execute(
      'SELECT id FROM users WHERE email = ?',
      [process.env.ADMIN_EMAIL]
    );

    if (existingAdmin.length === 0) {
      // Hash the default admin password
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      // Create default admin user
      await promisePool.execute(
        'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
        [process.env.ADMIN_EMAIL, hashedPassword, 'System Administrator', 'admin']
      );

      console.log(`Default admin user created with email: ${process.env.ADMIN_EMAIL}`);
    } else {
      console.log('Default admin user already exists');
    }
  } catch (error) {
    console.error('Error creating default admin user:', error.message);
    throw error;
  }
};

// Function to initialize database schema
const initializeSchema = async () => {
  try {
    await createTables();
    await createDefaultAdmin();
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Schema initialization failed:', error);
    throw error;
  }
};

module.exports = {
  createTables,
  createDefaultAdmin,
  initializeSchema
};
