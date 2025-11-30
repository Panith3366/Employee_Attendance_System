const db = require('../config/database');

class Attendance {
  static async create(attendanceData) {
    const { userId, date, checkInTime, checkOutTime, status, totalHours } = attendanceData;
    
    const result = await db.query(
      `INSERT INTO attendance (user_id, date, check_in_time, check_out_time, status, total_hours)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, date, checkInTime, checkOutTime, status, totalHours]
    );
    
    return result.rows[0];
  }

  static async update(attendanceId, updateData) {
    const { checkOutTime, status, totalHours } = updateData;
    
    const result = await db.query(
      `UPDATE attendance 
       SET check_out_time = $1, status = $2, total_hours = $3
       WHERE id = $4
       RETURNING *`,
      [checkOutTime, status, totalHours, attendanceId]
    );
    
    return result.rows[0];
  }

  static async findByUserAndDate(userId, date) {
    const result = await db.query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
    return result.rows[0];
  }

  static async findByUserId(userId, startDate, endDate) {
    const result = await db.query(
      `SELECT 
        DATE(date) AS date,
        status,
        check_in_time,
        check_out_time,
        total_hours,
        id
       FROM attendance 
       WHERE user_id = $1 
       AND DATE(date) >= $2 AND DATE(date) <= $3
       ORDER BY date DESC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }

  static async findAll(startDate, endDate, userId = null, status = null) {
    let query = `
      SELECT a.*, u.name, u.email, u.employee_id, u.department
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE a.date >= $1 AND a.date <= $2
      AND u.role = 'employee'
    `;
    const params = [startDate, endDate];
    let paramIndex = 3;
    
    if (userId) {
      query += ` AND a.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    query += ' ORDER BY a.date DESC, u.name';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  static async getSummary(userId, startDate, endDate) {
    const result = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'present') as present,
        COUNT(*) FILTER (WHERE status = 'absent') as absent,
        COUNT(*) FILTER (WHERE status = 'late') as late,
        COUNT(*) FILTER (WHERE status = 'half-day') as half_day,
        COALESCE(SUM(total_hours), 0) as total_hours
      FROM attendance
      WHERE user_id = $1 AND date >= $2 AND date <= $3`,
      [userId, startDate, endDate]
    );
    return result.rows[0];
  }

  static async getTodayStatus() {
    const today = new Date().toISOString().split('T')[0];
    const result = await db.query(
      `SELECT 
        COUNT(DISTINCT u.id) as total_employees,
        COUNT(DISTINCT a.user_id) FILTER (WHERE a.status = 'present' OR a.status = 'late' OR a.status = 'half-day') as present,
        COUNT(DISTINCT u.id) - COUNT(DISTINCT a.user_id) FILTER (WHERE a.status = 'present' OR a.status = 'late' OR a.status = 'half-day') as absent,
        COUNT(DISTINCT a.user_id) FILTER (WHERE a.status = 'late') as late
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id AND a.date = $1
      WHERE u.role = 'employee'`,
      [today]
    );
    return result.rows[0];
  }

  static async getDepartmentStats(startDate, endDate) {
    const result = await db.query(
      `SELECT 
        u.department,
        COUNT(DISTINCT a.user_id) FILTER (WHERE a.status = 'present' OR a.status = 'late' OR a.status = 'half-day') as present_count,
        COUNT(DISTINCT u.id) as total_employees
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id AND a.date >= $1 AND a.date <= $2
      WHERE u.role = 'employee'
      GROUP BY u.department
      ORDER BY u.department`,
      [startDate, endDate]
    );
    return result.rows;
  }
}

module.exports = Attendance;

