# 📊 Employee Attendance System

> **A robust, full-stack workforce management solution built for modern teams.**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/frontend-React_18-61DAFB.svg)
![Node](https://img.shields.io/badge/backend-Node.js-339933.svg)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-336791.svg)

---

## 🔗 Live Demo & Links
**[🚀 View Live Demo](https://your-deployment-link.com)** | **[🎥 Video Walkthrough](https://your-video-link.com)**

---

## 📖 Overview

The **Employee Attendance System** is a comprehensive full-stack application designed to streamline the process of tracking employee hours, managing leave, and generating workforce insights. Built with the PERN stack (PostgreSQL, Express, React, Node.js), it offers distinct portals for **Employees** to manage their status and **Managers** to oversee team performance through data-driven dashboards.

## 🚀 Key Features

### 👤 For Employees
* **Secure Authentication:** User registration, login, and profile management with JWT security.
* **One-Click Actions:** Seamless Check-in and Check-out functionality.
* **Interactive History:**
    * **Calendar View:** Visual attendance tracking with color-coded indicators.
    * **Detailed Logs:** Drill down into specific dates to view entry/exit times.
* **Performance Metrics:** Dashboard displaying monthly summaries (Present, Absent, Late, Half-days).

### 🛡️ For Managers
* **Centralized Oversight:** View attendance records for the entire organization.
* **Advanced Filtering:** Sort data by employee, date range, department, or attendance status.
* **Team Analytics:**
    * **Department-wise Analytics:** Visual breakdown of attendance trends.
    * **Live Dashboard:** Real-time charts and team-wide metrics.
* **Export Capabilities:** Generate and download comprehensive CSV reports for payroll and HR.

---

## 📸 Feature Deep Dive

### 📅 Attendance History & Calendar
A powerful visual interface for tracking time.
* **Visual Status Indicators:**
    * 🟢 **Green:** Present
    * 🔴 **Red:** Absent
    * 🟡 **Yellow:** Late arrival
    * 🟠 **Orange:** Half-Day
* **Interactivity:** Click on any calendar date to reveal specific check-in/out timestamps and notes.
* **Navigation:** Easily toggle between months to track long-term consistency.

### 📊 Manager Reports & Analytics
Data-driven tools for better decision-making.
* **Custom Date Ranges:** Select specific periods for report generation.
* **Granular Control:** Filter reports by individual employee or view all.
* **Data Export:** One-click **Export to CSV** button for external processing.
* **Table View:** Comprehensive data grids showing calculated work hours and status.

---

## 🛠 Tech Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Redux Toolkit, React Router, Axios, Recharts, React Calendar, Date-fns |
| **Backend** | Node.js, Express.js, JWT, Bcryptjs, CSV Writer |
| **Database** | PostgreSQL |
| **DevOps/Tools** | Git, npm, Environment Variables (Dotenv) |

---

Demo Accounts

Manager Account:
Email: manager@example.com
Password: manager123

Employee Accounts:
Email: alice@example.com 
Password: employee123


## 📁 Project Structure


Employee-tracking-system/
├── server/                 # Backend (Node/Express)
│   ├── config/             # DB Configuration
│   ├── middleware/         # Auth & Error handling
│   ├── models/             # Sequelize/SQL Models
│   ├── routes/             # API Endpoints
│   ├── scripts/            # Seed & Setup scripts
│   └── index.js            # Entry point
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Employee & Manager Views
│   │   ├── store/          # Redux State Management
│   │   └── App.js          # Root Component
├── .env.example            # Environment variables template
└── README.md               # Documentation



Installation & Setup

Follow these steps to set up the project locally.

1. PrerequisitesEnsure you have the following installed:
Node.js (v14+)
PostgreSQL (v12+)
npm or yarn2.

Clone the Repository
git clone [https://github.com/Panith3366/Employee-tracking-system.git]
cd Employee-tracking-system


3. Backend SetupBash# Install dependencies
npm install

# Setup Environment Variables
# Create a .env file in the root directory based on .env.example
# DB_HOST=localhost
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=attendance_system
# JWT_SECRET=your_super_secret_key


4. Database InitializationBash# Create the database
createdb attendance_system

# Initialize tables
npm run setup-db

# Seed with sample data (Managers & Employees)
npm run seed


5. Frontend SetupBashcd client
npm install
cd ..


6. Run the ApplicationYou can run both servers concurrently:
npm run dev

Frontend: http://localhost:3000
Backend: http://localhost:5000


📝 Sample CredentialsUse these credentials to test the application after running
 npm run seed.
