const express = require('express');
const router = express.Router();
const { auth, isManager } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const db = require('../config/database');

// @route   GET /api/dashboard/employee
// @desc    Get employee dashboard data
// @access  Private (Employee)
router.get('/employee', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayDate = new Date();
    const monthStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = todayDate.toISOString().split('T')[0];
    
    // Get today's attendance
    const todayAttendance = await Attendance.findByUserAndDate(req.user.id, today);
    
    // Get monthly summary
    const monthlySummary = await Attendance.getSummary(req.user.id, monthStart, monthEnd);
    
    // Get last 7 days attendance
    const sevenDaysAgo = new Date(todayDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7Days = await Attendance.findByUserId(
      req.user.id,
      sevenDaysAgo.toISOString().split('T')[0],
      monthEnd
    );
    
    // Calculate total hours this month
    const totalHours = monthlySummary.total_hours || 0;

    res.json({
      today: {
        checkedIn: !!todayAttendance?.check_in_time,
        checkedOut: !!todayAttendance?.check_out_time,
        checkInTime: todayAttendance?.check_in_time,
        checkOutTime: todayAttendance?.check_out_time,
        status: todayAttendance?.status || 'absent',
      },
      monthly: {
        present: parseInt(monthlySummary.present) || 0,
        absent: parseInt(monthlySummary.absent) || 0,
        late: parseInt(monthlySummary.late) || 0,
        halfDay: parseInt(monthlySummary.half_day) || 0,
        totalHours: parseFloat(totalHours),
      },
      last7Days: last7Days.slice(0, 7).map(a => ({
        date: a.date,
        status: a.status,
        checkInTime: a.check_in_time,
        checkOutTime: a.check_out_time,
        totalHours: a.total_hours,
      })),
    });
  } catch (error) {
    console.error('Get employee dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/manager
// @desc    Get manager dashboard data
// @access  Private (Manager)
router.get('/manager', auth, isManager, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayDate = new Date();
    const weekStart = new Date(todayDate);
    weekStart.setDate(weekStart.getDate() - 7);
    
    // Get total employees
    const employees = await User.findAll();
    const totalEmployees = employees.filter(e => e.role === 'employee').length;
    
    // Get today's status
    const todayStatus = await Attendance.getTodayStatus();
    
    // Get weekly attendance for chart
    const weeklyAttendance = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAttendance = await Attendance.findAll(dateStr, dateStr);
      weeklyAttendance.push({
        date: dateStr,
        present: dayAttendance.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'half-day').length,
        absent: totalEmployees - dayAttendance.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'half-day').length,
      });
    }
    
    // Get department-wise stats
    const departmentStats = await Attendance.getDepartmentStats(
      weekStart.toISOString().split('T')[0],
      today
    );
    
    // Get absent employees today
    const allEmployees = employees.filter(e => e.role === 'employee');
    const presentToday = await Attendance.findAll(today, today);
    const presentEmployeeIds = new Set(presentToday.map(a => a.user_id));
    const absentEmployees = allEmployees
      .filter(e => !presentEmployeeIds.has(e.id))
      .map(e => ({
        id: e.id,
        name: e.name,
        email: e.email,
        employeeId: e.employee_id,
        department: e.department,
      }));

    res.json({
      totalEmployees,
      today: {
        present: parseInt(todayStatus.present) || 0,
        absent: parseInt(todayStatus.absent) || 0,
        late: parseInt(todayStatus.late) || 0,
      },
      weeklyAttendance,
      departmentStats: departmentStats.map(d => ({
        department: d.department || 'N/A',
        presentCount: parseInt(d.present_count) || 0,
        totalEmployees: parseInt(d.total_employees) || 0,
        attendanceRate: d.total_employees > 0 
          ? ((d.present_count / d.total_employees) * 100).toFixed(1) 
          : 0,
      })),
      absentEmployees,
    });
  } catch (error) {
    console.error('Get manager dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

