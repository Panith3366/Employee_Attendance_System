const cron = require('node-cron');
const db = require('../config/database');

// Only initialize cron jobs if email is configured
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  const {
    sendLateArrivalEmail,
    sendEarlyCheckoutEmail,
    sendWeeklySummaryEmail,
    sendManagerAlertEmail,
  } = require('./emailService');

  // Check for late arrivals and send emails (runs every hour during work hours)
  cron.schedule('0 10-18 * * *', async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await db.query(
      `SELECT u.email, u.name, a.check_in_time
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       WHERE DATE(a.date) = $1
       AND a.check_in_time > '10:00'::time
       AND u.notifications_enabled = true
       AND (u.last_email_sent IS NULL OR DATE(u.last_email_sent) < $1)`,
      [today]
    );

    for (const row of result.rows) {
      await sendLateArrivalEmail(row.email, row.name, row.check_in_time);
      await db.query(
        'UPDATE users SET last_email_sent = CURRENT_TIMESTAMP WHERE email = $1',
        [row.email]
      );
    }
  } catch (error) {
    console.error('Cron job error (late arrivals):', error);
  }
});

// Check for early checkouts (runs every hour during work hours)
cron.schedule('0 12-17 * * *', async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await db.query(
      `SELECT u.email, u.name, a.check_out_time
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       WHERE DATE(a.date) = $1
       AND a.check_out_time < '14:00'::time
       AND a.check_out_time IS NOT NULL
       AND u.notifications_enabled = true
       AND (u.last_email_sent IS NULL OR DATE(u.last_email_sent) < $1)`,
      [today]
    );

    for (const row of result.rows) {
      await sendEarlyCheckoutEmail(row.email, row.name, row.check_out_time);
      await db.query(
        'UPDATE users SET last_email_sent = CURRENT_TIMESTAMP WHERE email = $1',
        [row.email]
      );
    }
  } catch (error) {
    console.error('Cron job error (early checkout):', error);
  }
});

// Weekly summary email (runs Monday at 9 AM)
cron.schedule('0 9 * * 1', async () => {
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = new Date().toISOString().split('T')[0];

    const users = await db.query(
      `SELECT id, email, name FROM users 
       WHERE role = 'employee' 
       AND notifications_enabled = true
       AND (weekly_summary_sent IS NULL OR weekly_summary_sent < CURRENT_DATE - INTERVAL '7 days')`
    );

    for (const user of users.rows) {
      const summary = await db.query(
        `SELECT 
          COUNT(*) FILTER (WHERE status = 'present') as present,
          COUNT(*) FILTER (WHERE status = 'absent') as absent,
          COUNT(*) FILTER (WHERE status = 'late') as late,
          COALESCE(SUM(total_hours), 0) as total_hours
         FROM attendance
         WHERE user_id = $1 AND date >= $2 AND date <= $3`,
        [user.id, weekStartStr, weekEndStr]
      );

      await sendWeeklySummaryEmail(user.email, user.name, summary.rows[0]);
      await db.query(
        'UPDATE users SET weekly_summary_sent = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
    }
  } catch (error) {
    console.error('Cron job error (weekly summary):', error);
  }
});

// Manager alerts (runs daily at 6 PM)
cron.schedule('0 18 * * *', async () => {
  try {
    // Get all managers
    const managers = await db.query(
      "SELECT email FROM users WHERE role = 'manager'"
    );

    // 1. Check for 3 consecutive absents
    const consecutiveAbsents = await db.query(
      `SELECT u.id, u.name, u.employee_id
       FROM users u
       WHERE u.role = 'employee'
       AND (
         SELECT COUNT(*)
         FROM attendance a
         WHERE a.user_id = u.id
         AND a.status = 'absent'
         AND a.date >= CURRENT_DATE - INTERVAL '3 days'
       ) = 3`
    );

    if (consecutiveAbsents.rows.length > 0) {
      for (const manager of managers.rows) {
        await sendManagerAlertEmail(manager.email, 'consecutive_absents', consecutiveAbsents.rows);
      }
    }

    // 2. Check for low punctuality (< 50%)
    const lowPunctuality = await db.query(
      `SELECT 
        u.id, u.name, u.employee_id,
        (COUNT(*) FILTER (WHERE a.check_in_time <= '10:00'::time)::float / 
         NULLIF(COUNT(*), 0) * 100) as punctuality
       FROM users u
       LEFT JOIN attendance a ON u.id = a.user_id
       WHERE u.role = 'employee'
       AND DATE_TRUNC('month', a.date) = DATE_TRUNC('month', CURRENT_DATE)
       GROUP BY u.id, u.name, u.employee_id
       HAVING (COUNT(*) FILTER (WHERE a.check_in_time <= '10:00'::time)::float / 
               NULLIF(COUNT(*), 0) * 100) < 50`
    );

    if (lowPunctuality.rows.length > 0) {
      for (const manager of managers.rows) {
        await sendManagerAlertEmail(manager.email, 'low_punctuality', lowPunctuality.rows);
      }
    }

    // 3. Check for multiple late arrivals today
    const today = new Date().toISOString().split('T')[0];
    const lateCount = await db.query(
      `SELECT COUNT(*) as count
       FROM attendance
       WHERE DATE(date) = $1
       AND check_in_time > '10:00'::time`,
      [today]
    );

    if (parseInt(lateCount.rows[0].count) > 5) {
      for (const manager of managers.rows) {
        await sendManagerAlertEmail(manager.email, 'multiple_late', {
          count: lateCount.rows[0].count,
        });
      }
    }
  } catch (error) {
    console.error('Cron job error (manager alerts):', error);
  }
});

  console.log('Cron jobs initialized');
} else {
  console.log('Email not configured. Cron jobs disabled. Set EMAIL_USER and EMAIL_PASS in .env to enable.');
}

