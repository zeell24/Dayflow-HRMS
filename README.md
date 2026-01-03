# HRMS - Human Resource Management System

A complete Human Resource Management System built with Node.js, Express, MongoDB, and React.

## Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, Manager, Employee)
- 👥 **Employee Management**: Full CRUD operations for employee records
- ⏰ **Attendance Management**: Mark and track employee attendance
- 📅 **Leave Management**: Apply, approve/reject, and track employee leave applications
- 💰 **Payroll Management**: Generate and manage employee payroll records
- 📊 **Dashboard**: Comprehensive dashboard with charts and statistics
- 🎨 **Modern UI**: Responsive design with clean and intuitive interface

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose ODM)
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React.js
- React Router
- Axios for API calls
- Recharts for data visualization
- React Icons
- Vite as build tool

## Prerequisites

Before running the application, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher) - Local installation OR MongoDB Atlas account
- npm or yarn

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd mern-HRMS
```

### 2. Database Setup

**MongoDB will create the database automatically!** No need to create it manually.

1. **Start MongoDB:**
   - Make sure MongoDB is running on your machine, OR
   - Use MongoDB Atlas (cloud) and get your connection string

2. **Connection String Examples:**
   - Local: `mongodb://localhost:27017/hrms_db`
   - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/hrms_db`

**Note:** Collections (tables) are created automatically by Mongoose when you first use them. No SQL scripts needed!

### 3. Backend Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the `server` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hrms_db

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:3000
```

4. Start the backend server:

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### 4. Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Default Login Credentials

After importing sample data, you can login with:

- **Admin Account:**
  - Email: `admin@company.com`
  - Password: `password123`

- **Manager Account:**
  - Email: `john.doe@company.com`
  - Password: `password123`

- **Employee Account:**
  - Email: `mike.johnson@company.com`
  - Password: `password123`

**Note:** In production, make sure to change these default passwords!

## Project Structure

```
mern-HRMS/
├── server/                 # Backend code
│   ├── app.js             # Main server file
│   ├── config/            # Configuration files
│   │   └── db.js          # Database configuration
│   ├── controllers/       # Route controllers
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   └── payrollController.js
│   ├── models/            # Database models
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   ├── Payroll.js
│   │   └── index.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── employees.js
│   │   ├── attendance.js
│   │   ├── leave.js
│   │   └── payroll.js
│   ├── middleware/        # Custom middleware
│   │   └── auth.js        # Authentication middleware
│   ├── database/          # Database scripts
│   │   ├── schema.sql
│   │   └── sample-data.sql
│   └── package.json
│
├── frontend/              # Frontend code
│   ├── src/
│   │   ├── components/   # React components
│   │   │   └── Layout.jsx
│   │   ├── pages/        # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EmployeeManagement.jsx
│   │   │   ├── AttendanceManagement.jsx
│   │   │   ├── LeaveManagement.jsx
│   │   │   └── PayrollManagement.jsx
│   │   ├── utils/        # Utility functions
│   │   │   ├── api.js    # API calls
│   │   │   └── auth.js   # Auth utilities
│   │   ├── App.jsx       # Main App component
│   │   ├── main.jsx      # Entry point
│   │   └── index.css     # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Employees
- `GET /api/employees` - Get all employees (with search/filter)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee (Admin/Manager only)
- `PUT /api/employees/:id` - Update employee (Admin/Manager only)
- `DELETE /api/employees/:id` - Delete employee (Admin only)
- `GET /api/employees/stats/overview` - Get employee statistics

### Attendance
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/:id` - Get attendance by ID
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/:id` - Update attendance (Admin/Manager only)
- `DELETE /api/attendance/:id` - Delete attendance (Admin only)
- `GET /api/attendance/stats/summary` - Get attendance statistics

### Leave
- `GET /api/leave` - Get all leave applications
- `GET /api/leave/:id` - Get leave by ID
- `POST /api/leave` - Apply for leave
- `PUT /api/leave/:id/approve` - Approve/reject leave (Admin/Manager only)
- `PUT /api/leave/:id` - Update leave (if pending)
- `DELETE /api/leave/:id` - Cancel leave
- `GET /api/leave/stats/summary` - Get leave statistics

### Payroll
- `GET /api/payroll` - Get all payroll records
- `GET /api/payroll/:id` - Get payroll by ID
- `GET /api/payroll/employee/:employeeId` - Get employee's payroll history
- `POST /api/payroll` - Generate payroll (Admin/Manager only)
- `PUT /api/payroll/:id` - Update payroll (Admin/Manager only)
- `DELETE /api/payroll/:id` - Delete payroll (Admin only)
- `GET /api/payroll/stats/summary` - Get payroll statistics

## Role-Based Access Control

### Admin
- Full access to all features
- Can create, update, and delete employees
- Can approve/reject leave applications
- Can generate and manage payroll

### Manager
- Can view all employees and their data
- Can create and update employees
- Can approve/reject leave applications
- Can generate and manage payroll
- Cannot delete employees

### Employee
- Can view own profile and data
- Can apply for leave
- Can view own attendance and payroll records
- Limited access to other employees' data

## Features in Detail

### Employee Management
- Add, edit, and delete employee records
- Search employees by name or email
- Filter by department and role
- View employee statistics

### Attendance Management
- Mark daily attendance
- Track check-in and check-out times
- Filter by employee, date range, and status
- View attendance statistics and trends

### Leave Management
- Apply for leave with different types (sick, casual, annual, etc.)
- Approve or reject leave applications (managers/admins)
- Track leave history and statistics
- Automatic calculation of leave days

### Payroll Management
- Generate monthly payroll for employees
- Calculate net salary (basic + allowances + overtime + bonuses - deductions)
- Track payroll status (pending, processed, paid)
- Filter and view payroll history

### Dashboard
- Overview statistics (total employees, attendance, leaves, payroll)
- Interactive charts and graphs
- Department-wise employee distribution
- Attendance trends
- Leave status distribution

## Development

### Running in Development Mode

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Environment Variables

### Backend (.env)

```env
MONGO_URI=mongodb://localhost:27017/hrms_db
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Troubleshooting

### Database Connection Issues
- Ensure MongoDB is running (check services)
- Verify `MONGO_URI` in `.env` file is correct
- For MongoDB Atlas, check IP whitelist and connection string
- Test connection using MongoDB Compass or mongosh

### Port Already in Use
- Change the `PORT` in `.env` file for backend
- Change the port in `vite.config.js` for frontend

### Authentication Issues
- Ensure JWT_SECRET is set in `.env`
- Clear browser localStorage and try logging in again

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on the repository.

## Author

HRMS Development Team

---

**Note:** This is a complete HRMS system ready for deployment. Make sure to:
- Change default passwords in production
- Use a strong JWT_SECRET
- Configure proper CORS settings for production
- Set up proper database backups
- Use environment variables for sensitive data

