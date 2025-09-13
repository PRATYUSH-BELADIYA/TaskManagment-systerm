# Task Management System

A comprehensive backend API for task management with admin user authentication, built using Node.js, Express.js, and MySQL.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Admin and regular user roles
  - User registration and login
  - Password encryption with bcrypt

- **Task Management**
  - Create, read, update, delete tasks
  - Task assignment to users
  - Task status tracking (pending, in_progress, completed, cancelled)
  - Priority levels (low, medium, high, urgent)
  - Due date management
  - Task filtering and search

- **Admin Features**
  - User management (CRUD operations)
  - Task assignment capabilities
  - System-wide statistics
  - User status management

- **Additional Features**
  - Task statistics and reporting
  - Pagination support
  - Advanced filtering options
  - Comprehensive error handling

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn package manager

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd D:\task
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Update the `.env` file with your MySQL credentials:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=task_management_db
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Admin Default Credentials
   ADMIN_EMAIL=admin@taskmanager.com
   ADMIN_PASSWORD=admin123
   ```

4. **Ensure MySQL is running and accessible with the credentials provided in the .env file.**

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your .env file).

## API Documentation

### Authentication

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "user"
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### User Management

#### Get User Profile (Authenticated)
```http
GET /api/users/profile
Authorization: Bearer <jwt_token>
```

#### Update Profile (Authenticated)
```http
PUT /api/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "email": "jane@example.com"
}
```

#### Change Password (Authenticated)
```http
PUT /api/users/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "current_password": "oldpassword",
  "new_password": "newpassword"
}
```

#### Get All Users (Admin Only)
```http
GET /api/users?page=1&limit=10&search=john
Authorization: Bearer <admin_jwt_token>
```

### Task Management

#### Create Task (Authenticated)
```http
POST /api/tasks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the project",
  "status": "pending",
  "priority": "high",
  "assigned_to": 2,
  "due_date": "2023-12-31"
}
```

#### Get All Tasks (Authenticated)
```http
GET /api/tasks?page=1&limit=10&status=pending&priority=high&search=documentation
Authorization: Bearer <jwt_token>
```

#### Get Task by ID (Authenticated)
```http
GET /api/tasks/1
Authorization: Bearer <jwt_token>
```

#### Update Task (Authenticated)
```http
PUT /api/tasks/1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated task title",
  "status": "in_progress",
  "priority": "medium"
}
```

#### Update Task Status (Authenticated)
```http
PATCH /api/tasks/1/status
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "completed"
}
```

#### Delete Task (Authenticated)
```http
DELETE /api/tasks/1
Authorization: Bearer <jwt_token>
```

#### Get My Tasks (Authenticated)
```http
GET /api/tasks/my-tasks?type=assigned&status=pending
Authorization: Bearer <jwt_token>
```

#### Get Task Statistics (Authenticated)
```http
GET /api/tasks/statistics
Authorization: Bearer <jwt_token>
```

### Admin-Only Endpoints

#### Assign Task to User (Admin Only)
```http
PATCH /api/tasks/1/assign
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "assigned_to": 3
}
```

#### Update User (Admin Only)
```http
PUT /api/users/2
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "full_name": "Updated Name",
  "email": "updated@example.com",
  "role": "user",
  "is_active": true
}
```

#### Toggle User Status (Admin Only)
```http
PATCH /api/users/2/toggle-status
Authorization: Bearer <admin_jwt_token>
```

## Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `full_name`
- `role` (admin/user)
- `is_active` (Boolean)
- `created_at`
- `updated_at`

### Tasks Table
- `id` (Primary Key)
- `title`
- `description`
- `status` (pending/in_progress/completed/cancelled)
- `priority` (low/medium/high/urgent)
- `assigned_to` (Foreign Key to Users)
- `created_by` (Foreign Key to Users)
- `due_date`
- `created_at`
- `updated_at`
- `completed_at`

### Additional Tables
- `task_comments` - For task comments/notes
- `task_attachments` - For file attachments (prepared for future use)

## Default Admin Account

When you first run the application, a default admin account is created:

- **Email:** admin@taskmanager.com
- **Password:** admin123

**Note:** Please change these credentials after the first login for security purposes.

## Error Handling

The API includes comprehensive error handling with appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based authorization
- Input validation
- SQL injection protection through parameterized queries

## Development

### Project Structure
```
task/
├── config/
│   ├── database.js     # Database connection
│   └── schema.js       # Database schema setup
├── controllers/
│   ├── taskController.js
│   └── userController.js
├── middleware/
│   └── auth.js         # Authentication middleware
├── models/
│   ├── Task.js
│   └── User.js
├── routes/
│   ├── taskRoutes.js
│   └── userRoutes.js
├── utils/
│   └── jwt.js          # JWT utilities
├── .env                # Environment variables
├── server.js           # Main server file
└── package.json
```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
