const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, isManager } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const db = require('../config/database');

// Helper function to determine status using SQL logic
const determineStatus = async (db, userId, date, checkInTime, checkOutTime = null) => {
  // IF no check-in → ABSENT
  if (!checkInTime) {
    return 'absent';
  }

  // Check if check-in is after 10:01 AM → LATE
  const checkInDate = new Date(checkInTime);
  const checkInHour = checkInDate.getHours();
  const checkInMinute = checkInDate.getMinutes();
  const isLate = checkInHour > 10 || (checkInHour === 10 && checkInMinute > 1);

  // If no check-out yet, return late or present based on check-in time
  if (!checkOutTime) {
    return isLate ? 'late' : 'present';
  }

  // Calculate total hours using SQL
  // Convert Date objects to ISO strings for PostgreSQL
  const checkOutStr = checkOutTime instanceof Date ? checkOutTime.toISOString() : checkOutTime;
  const checkInStr = checkInTime instanceof Date ? checkInTime.toISOString() : checkInTime;
  
  const hoursResult = await db.query(
    `SELECT EXTRACT(EPOCH FROM ($1::timestamp - $2::timestamp))/3600 AS total_hours`,
    [checkOutStr, checkInStr]
  );
  const totalHours = parseFloat(hoursResult.rows[0]?.total_hours || 0);

  // Check check-out time
  const checkOutDate = new Date(checkOutTime);
  const checkOutHour = checkOutDate.getHours();
  const checkOutMinute = checkOutDate.getMinutes();
  const isEarlyCheckout = checkOutHour < 14 || (checkOutHour === 14 && checkOutMinute === 0);

  // IF check-out < 2 PM → HALF-DAY
  if (isEarlyCheckout) {
    return 'half-day';
  }

  // IF totalHours < 4 → HALF-DAY
  if (totalHours < 4) {
    return 'half-day';
  }

  // IF totalHours >= 4 → PRESENT (or LATE if check-in was late)
  return isLate ? 'late' : 'present';
};

// @route   POST /api/attendance/checkin
// @desc    Check in for today
// @access  Private (Employee)
router.post('/checkin', auth, async (req, res) => {
  try {
    // Use DATE() to normalize to local date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const checkInTime = new Date();

    // Check if already checked in today using normalized date
    const existing = await Attendance.findByUserAndDate(req.user.id, todayStr);
    if (existing && existing.check_in_time) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // Determine status using SQL logic
    const status = await determineStatus(db, req.user.id, todayStr, checkInTime, null);
    
    let attendance;
    if (existing) {
      // Update existing record
      const updateResult = await db.query(
        `UPDATE attendance 
         SET check_in_time = $1, status = $2, check_out_time = NULL, total_hours = NULL
         WHERE id = $3
         RETURNING *`,
        [checkInTime, status, existing.id]
      );
      attendance = updateResult.rows[0];
    } else {
      // Create new record
      attendance = await Attendance.create({
        userId: req.user.id,
        date: todayStr,
        checkInTime,
        checkOutTime: null,
        status,
        totalHours: null,
      });
    }

    res.json({
      message: 'Checked in successfully',
      attendance: {
        id: attendance.id,
        date: attendance.date,
        checkInTime: attendance.check_in_time,
        status: attendance.status,
      },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error during check-in' });
  }
});

// @route   POST /api/attendance/checkout
// @desc    Check out for today
// @access  Private (Employee)
router.post('/checkout', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const checkOutTime = new Date();

    // Find today's attendance using normalized date
    const attendance = await Attendance.findByUserAndDate(req.user.id, today);
    if (!attendance || !attendance.check_in_time) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (attendance.check_out_time) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    // Calculate total hours using SQL
    const hoursResult = await db.query(
      `SELECT EXTRACT(EPOCH FROM ($1::timestamp - $2::timestamp))/3600 AS total_hours`,
      [
        checkOutTime instanceof Date ? checkOutTime.toISOString() : checkOutTime,
        attendance.check_in_time instanceof Date ? attendance.check_in_time.toISOString() : attendance.check_in_time
      ]
    );
    const totalHours = parseFloat(hoursResult.rows[0]?.total_hours || 0).toFixed(2);

    // Determine status using proper logic
    const status = await determineStatus(
      db,
      req.user.id,
      today,
      attendance.check_in_time,
      checkOutTime
    );

    const updated = await Attendance.update(attendance.id, {
      checkOutTime,
      status,
      totalHours: parseFloat(totalHours),
    });

    res.json({
      message: 'Checked out successfully',
      attendance: {
        id: updated.id,
        date: updated.date,
        checkInTime: updated.check_in_time,
        checkOutTime: updated.check_out_time,
        status: updated.status,
        totalHours: updated.total_hours,
      },
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error during check-out' });
  }
});

// @route   GET /api/attendance/my-history
// @desc    Get current user's attendance history
// @access  Private (Employee)
router.get('/my-history', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const defaultEndDate = today.toISOString().split('T')[0];

    const start = startDate || defaultStartDate;
    const end = endDate || defaultEndDate;

    const history = await Attendance.findByUserId(req.user.id, start, end);

    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/my-summary
// @desc    Get current user's attendance summary
// @access  Private (Employee)
router.get('/my-summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const defaultEndDate = today.toISOString().split('T')[0];

    const start = startDate || defaultStartDate;
    const end = endDate || defaultEndDate;

    const summary = await Attendance.getSummary(req.user.id, start, end);

    res.json({ summary });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance for current user
// @access  Private (Employee)
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findByUserAndDate(req.user.id, today);

    res.json({ attendance: attendance || null });
  } catch (error) {
    console.error('Get today error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/all
// @desc    Get all employees' attendance
// @access  Private (Manager)
router.get('/all', auth, isManager, async (req, res) => {
  try {
    const { startDate, endDate, userId, status } = req.query;
    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const defaultEndDate = today.toISOString().split('T')[0];

    const start = startDate || defaultStartDate;
    const end = endDate || defaultEndDate;

    const attendance = await Attendance.findAll(start, end, userId || null, status || null);

    res.json({ attendance });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/employee/:id
// @desc    Get specific employee's attendance
// @access  Private (Manager)
router.get('/employee/:id', auth, isManager, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const defaultEndDate = today.toISOString().split('T')[0];

    const start = startDate || defaultStartDate;
    const end = endDate || defaultEndDate;

    const history = await Attendance.findByUserId(req.params.id, start, end);

    res.json({ history });
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/summary
// @desc    Get attendance summary for all employees
// @access  Private (Manager)
router.get('/summary', auth, isManager, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const defaultEndDate = today.toISOString().split('T')[0];

    const start = startDate || defaultStartDate;
    const end = endDate || defaultEndDate;

    const attendance = await Attendance.findAll(start, end);
    
    // Calculate summary
    const summary = {
      totalRecords: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      halfDay: attendance.filter(a => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + (parseFloat(a.total_hours) || 0), 0),
    };

    res.json({ summary });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/team-summary
// @desc    Get team attendance summary
// @access  Private (Manager)
router.get('/team-summary', auth, isManager, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const defaultEndDate = today.toISOString().split('T')[0];

    const start = startDate || defaultStartDate;
    const end = endDate || defaultEndDate;

    // Get team summary using SQL
    const summaryResult = await db.query(
      `SELECT 
        COUNT(DISTINCT a.user_id) FILTER (WHERE a.status = 'present') as present_count,
        COUNT(DISTINCT a.user_id) FILTER (WHERE a.status = 'absent') as absent_count,
        COUNT(DISTINCT a.user_id) FILTER (WHERE a.status = 'late') as late_count,
        COUNT(DISTINCT a.user_id) FILTER (WHERE a.status = 'half-day') as half_day_count,
        COUNT(DISTINCT u.id) as total_employees,
        COALESCE(SUM(a.total_hours), 0) as total_hours
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id AND a.date >= $1 AND a.date <= $2
      WHERE u.role = 'employee'`,
      [start, end]
    );

    const summary = summaryResult.rows[0];

    res.json({
      summary: {
        present: parseInt(summary.present_count) || 0,
        absent: parseInt(summary.absent_count) || 0,
        late: parseInt(summary.late_count) || 0,
        halfDay: parseInt(summary.half_day_count) || 0,
        totalEmployees: parseInt(summary.total_employees) || 0,
        totalHours: parseFloat(summary.total_hours) || 0,
      },
    });
  } catch (error) {
    console.error('Get team summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/export
// @desc    Export attendance to CSV
// @access  Private (Manager)
router.get('/export', auth, isManager, async (req, res) => {
  try {
    const { startDate, endDate, userId, status } = req.query;
    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const defaultEndDate = today.toISOString().split('T')[0];

    const start = startDate || defaultStartDate;
    const end = endDate || defaultEndDate;

    const attendance = await Attendance.findAll(start, end, userId || null, status || null);

    // Generate CSV in memory
    const escapeCSV = (field) => {
      if (field === null || field === undefined) return 'N/A';
      const str = String(field);
      // If field contains comma, newline, or quote, wrap in quotes and escape quotes
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['Date', 'Employee ID', 'Name', 'Email', 'Department', 'Check In', 'Check Out', 'Status', 'Total Hours'];
    const csvRows = [headers.map(escapeCSV).join(',')];

    attendance.forEach(a => {
      const row = [
        a.date,
        a.employee_id || 'N/A',
        a.name,
        a.email,
        a.department || 'N/A',
        a.check_in_time ? new Date(a.check_in_time).toLocaleString() : 'N/A',
        a.check_out_time ? new Date(a.check_out_time).toLocaleString() : 'N/A',
        a.status,
        a.total_hours || '0',
      ];
      csvRows.push(row.map(escapeCSV).join(','));
    });

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-${start}-to-${end}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error during export' });
  }
});

// @route   GET /api/attendance/today-status
// @desc    Get today's attendance status for all employees
// @access  Private (Manager)
router.get('/today-status', auth, isManager, async (req, res) => {
  try {
    const status = await Attendance.getTodayStatus();
    res.json({ status });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
