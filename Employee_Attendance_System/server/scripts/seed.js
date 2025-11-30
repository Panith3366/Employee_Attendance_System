const db = require('../config/database');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('Starting database seed...');

    // Clear existing data
    await db.query('DELETE FROM attendance');
    await db.query('DELETE FROM users');

    // Create manager
    const managerPassword = await bcrypt.hash('manager123', 10);
    const managerResult = await db.query(
      `INSERT INTO users (name, email, password, role, employee_id, department)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      ['John Manager', 'manager@example.com', managerPassword, 'manager', 'MGR001', 'Management']
    );
    const manager = managerResult.rows[0];
    console.log('Created manager:', manager.email);

    // Create employees
    const employees = [
      { name: 'Alice Johnson', email: 'alice@example.com', department: 'Engineering', employeeId: 'EMP001' },
      { name: 'Bob Smith', email: 'bob@example.com', department: 'Engineering', employeeId: 'EMP002' },
      { name: 'Charlie Brown', email: 'charlie@example.com', department: 'Marketing', employeeId: 'EMP003' },
      { name: 'Diana Prince', email: 'diana@example.com', department: 'Sales', employeeId: 'EMP004' },
      { name: 'Eve Wilson', email: 'eve@example.com', department: 'HR', employeeId: 'EMP005' },
    ];

    const createdEmployees = [];
    const employeePassword = await bcrypt.hash('employee123', 10);

    for (const emp of employees) {
      const result = await db.query(
        `INSERT INTO users (name, email, password, role, employee_id, department)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [emp.name, emp.email, employeePassword, 'employee', emp.employeeId, emp.department]
      );
      createdEmployees.push(result.rows[0]);
      console.log('Created employee:', emp.email);
    }

    // Create sample attendance records for the last 6 months (180 days)
    const today = new Date();
    for (let i = 0; i < 180; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Include weekends for complete data
      for (const employee of createdEmployees) {
        // Always present, no absences
        const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
        const checkInMinute = Math.floor(Math.random() * 60);
        const checkInTime = new Date(date);
        checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

        let status = 'present';
        if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 15)) {
          status = 'late';
        }

        // Always check out
        const workHours = 7 + Math.random() * 2; // 7-9 hours
        const checkOutTime = new Date(checkInTime);
        checkOutTime.setHours(checkOutTime.getHours() + workHours);
        const totalHours = parseFloat(workHours.toFixed(2));

        if (workHours < 4) {
          status = 'half-day';
        }

        await db.query(
          `INSERT INTO attendance (user_id, date, check_in_time, check_out_time, status, total_hours)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [employee.id, dateStr, checkInTime, checkOutTime, status, totalHours]
        );
      }
    }

    console.log('Database seeded successfully!');
    console.log('\nSample credentials:');
    console.log('Manager: manager@example.com / manager123');
    console.log('Employee: alice@example.com / employee123');
    console.log('Employee: bob@example.com / employee123');
    console.log('Employee: charlie@example.com / employee123');
    console.log('Employee: diana@example.com / employee123');
    console.log('Employee: eve@example.com / employee123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
db.connect()
  .then(() => seedDatabase())
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });

