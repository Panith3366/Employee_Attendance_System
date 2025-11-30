const express = require('express');
const router = express.Router();
const { auth, isManager } = require('../middleware/auth');
const db = require('../config/database');

// @route   GET /api/analytics/employee/monthly
// @desc    Get monthly attendance bar chart data
// @access  Private (Employee)
router.get('/employee/monthly', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        DATE(date) AS day,
        total_hours,
        status
      FROM attendance
      WHERE user_id = $1
      AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
      ORDER BY date`,
      [req.user.id]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Monthly analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/employee/weekly-checkin
// @desc    Get weekly check-in time line graph data
// @access  Private (Employee)
router.get('/employee/weekly-checkin', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        DATE(date) AS day,
        EXTRACT(HOUR FROM check_in_time) +
        EXTRACT(MINUTE FROM check_in_time)/60.0 as check_in_decimal
      FROM attendance
      WHERE user_id = $1
      AND date >= CURRENT_DATE - INTERVAL '7 days'
      AND check_in_time IS NOT NULL
      ORDER BY date`,
      [req.user.id]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Weekly check-in analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/employee/trend-score
// @desc    Get attendance trend score
// @access  Private (Employee)
router.get('/employee/trend-score', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        COUNT(*) FILTER (WHERE check_in_time <= '10:00'::time) AS on_time_days,
        COUNT(*) AS total_working_days
      FROM attendance
      WHERE user_id = $1
      AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
      AND status != 'absent'`,
      [req.user.id]
    );
    
    const row = result.rows[0];
    const score = row.total_working_days > 0 
      ? ((row.on_time_days / row.total_working_days) * 100).toFixed(1)
      : 0;
    
    res.json({ 
      onTimeDays: parseInt(row.on_time_days) || 0,
      totalWorkingDays: parseInt(row.total_working_days) || 0,
      score: parseFloat(score)
    });
  } catch (error) {
    console.error('Trend score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/manager/department-pie
// @desc    Get department-wise pie chart data
// @access  Private (Manager)
router.get('/manager/department-pie', auth, isManager, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        u.department, 
        COUNT(*) FILTER (WHERE a.status = 'present' OR a.status = 'late' OR a.status = 'half-day') AS present_count
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id AND a.date = CURRENT_DATE
      WHERE u.role = 'employee'
      GROUP BY u.department`,
      []
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Department pie chart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/manager/weekly-department
// @desc    Get weekly department performance bar chart
// @access  Private (Manager)
router.get('/manager/weekly-department', auth, isManager, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        u.department, 
        AVG(a.total_hours) AS avg_hours
      FROM users u
      JOIN attendance a ON u.id = a.user_id
      WHERE a.date >= CURRENT_DATE - INTERVAL '7 days'
      AND a.total_hours IS NOT NULL
      GROUP BY u.department
      ORDER BY u.department`,
      []
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Weekly department performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/manager/late-arrivals
// @desc    Get late arrival table
// @access  Private (Manager)
router.get('/manager/late-arrivals', auth, isManager, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        u.name, 
        u.department, 
        DATE(a.date) AS date, 
        a.check_in_time
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE a.check_in_time > '10:00'::time
      AND a.date >= CURRENT_DATE - INTERVAL '14 days'
      ORDER BY a.date DESC, a.check_in_time DESC`,
      []
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Late arrivals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

