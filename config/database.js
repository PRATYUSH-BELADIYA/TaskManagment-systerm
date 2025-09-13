const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create promisified version for async/await
const promisePool = pool.promise();

// Function to test database connection
const testConnection = async () => {
  try {
    const [rows] = await promisePool.execute('SELECT 1');
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

// Function to create database if it doesn't exist
const createDatabase = async () => {
  try {
    // Create connection without database selection
    const tempConnection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });

    const tempPromiseConnection = tempConnection.promise();
    
    // Create database if it doesn't exist
    await tempPromiseConnection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database '${process.env.DB_NAME}' created or already exists`);
    
    tempConnection.end();
  } catch (error) {
    console.error('Error creating database:', error.message);
    throw error;
  }
};

// Function to initialize database
const initializeDatabase = async () => {
  try {
    await createDatabase();
    await testConnection();
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

module.exports = {
  pool,
  promisePool,
  testConnection,
  initializeDatabase
};
