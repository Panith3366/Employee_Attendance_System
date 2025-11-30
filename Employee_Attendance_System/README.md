# Employee Attendance System

A full-stack employee attendance tracking system built with React, Redux Toolkit, Node.js, Express, and PostgreSQL.

## 🚀 Features

### For Employees
- ✅ User registration and login
- ✅ Check-in / Check-out functionality
- ✅ View personal attendance history (Calendar & Table views)
- ✅ Monthly attendance summary (Present / Absent / Late)
- ✅ Dashboard with daily and monthly statistics
- ✅ Profile management

### For Managers
- ✅ Manager login
- ✅ View all employees' attendance
- ✅ Filter by employee, date range, or status
- ✅ Team summary and daily statistics
- ✅ Export attendance reports to CSV
- ✅ Dashboard with charts and team-wide metrics
- ✅ Team calendar view with color-coded attendance
- ✅ Department-wise attendance analytics

## 🛠️ Tech Stack

### Frontend
- React 18
- Redux Toolkit (State Management)
- React Router (Routing)
- Axios (HTTP Client)
- Recharts (Charts)
- React Calendar (Calendar Component)
- Date-fns (Date Utilities)

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT (Authentication)
- Bcryptjs (Password Hashing)
- CSV Writer (Report Export)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Employee-tracking-system
```

### 2. Backend Setup

```bash
# Install backend dependencies
npm install

# .env file is already created in the root directory
# Edit .env with your database credentials if needed:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=attendance_system
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your-secret-key
# PORT=5000
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb attendance_system

# Or using psql
psql -U postgres
CREATE DATABASE attendance_system;
\q

# Initialize database tables (runs automatically on server start)
npm run setup-db

# Seed database with sample data
npm run seed
```

### 4. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install

# Return to root directory
cd ..
```

### 5. Environment Variables

The `.env` files are already created:
- Root directory `.env` - Backend configuration
- `client/.env` - Frontend configuration (REACT_APP_API_URL)

Edit these files if you need to change the default values.

## 🚀 Running the Application

### Development Mode

Run both backend and frontend concurrently:

```bash
# From root directory
npm run dev
```

Or run them separately in different terminals:

```bash
# Terminal 1 - Backend (from root directory)
npm run server

# Terminal 2 - Frontend (from root directory)
npm run client
```

**Note**: Make sure your PostgreSQL database is running and the database credentials in `.env` are correct before starting the server.

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📝 Sample Credentials

After running the seed script, you can use these credentials:

### Manager
- Email: `manager@example.com`
- Password: `manager123`

### Employees
- Email: `alice@example.com` / Password: `employee123`
- Email: `bob@example.com` / Password: `employee123`
- Email: `charlie@example.com` / Password: `employee123`
- Email: `diana@example.com` / Password: `employee123`
- Email: `eve@example.com` / Password: `employee123`

## 📁 Project Structure

```
Employee-tracking-system/
├── server/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   └── Attendance.js        # Attendance model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── attendance.js        # Attendance routes
│   │   └── dashboard.js         # Dashboard routes
│   ├── scripts/
│   │   ├── seed.js              # Database seed script
│   │   └── setup-db.js         # Database setup script
│   └── index.js                 # Server entry point
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/
│   │   │   ├── employee/        # Employee pages
│   │   │   └── manager/         # Manager pages
│   │   ├── store/
│   │   │   ├── slices/          # Redux slices
│   │   │   └── store.js         # Redux store
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── package.json
├── .env.example
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Employee Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/my-history` - Get attendance history
- `GET /api/attendance/my-summary` - Get attendance summary
- `GET /api/attendance/today` - Get today's attendance

### Manager Attendance
- `GET /api/attendance/all` - Get all employees' attendance
- `GET /api/attendance/employee/:id` - Get specific employee's attendance
- `GET /api/attendance/summary` - Get attendance summary
- `GET /api/attendance/export` - Export attendance to CSV
- `GET /api/attendance/today-status` - Get today's status

### Dashboard
- `GET /api/dashboard/employee` - Get employee dashboard data
- `GET /api/dashboard/manager` - Get manager dashboard data

## 🎨 Features Overview

### Calendar View
- Color-coded attendance status:
  - 🟢 Green: Present
  - 🔴 Red: Absent
  - 🟡 Yellow: Late
  - 🟠 Orange: Half-Day

### Reports
- Filter by date range
- Filter by employee
- Export to CSV format
- Summary statistics

### Dashboard Analytics
- Daily attendance statistics
- Monthly summaries
- Weekly trends
- Department-wise breakdowns

## 🧪 Testing

To test the application:

1. Start the server and client
2. Register a new employee or use seed data
3. Login as employee and check in/out
4. Login as manager to view team attendance

## 📦 Building for Production

```bash
# Build frontend
cd client
npm run build

# The build folder will contain the production-ready files
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes with role-based access control
- Input validation and sanitization

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using the port

### CORS Issues
- Ensure backend CORS is configured
- Check API URL in frontend `.env`

## 📄 License

This project is open source and available under the MIT License.

## 👥 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, please open an issue in the repository.

---

**Note**: Remember to change the JWT_SECRET and database credentials in production!

