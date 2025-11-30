const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { name, email, password, role, employeeId, department } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.query(
      `INSERT INTO users (name, email, password, role, employee_id, department)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, employee_id, department, created_at`,
      [name, email, hashedPassword, role, employeeId, department]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT id, name, email, role, employee_id, department, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await db.query(
      'SELECT id, name, email, role, employee_id, department, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async generateEmployeeId(role) {
    // Get the last employee ID for the role
    const result = await db.query(
      `SELECT employee_id FROM users 
       WHERE role = $1 AND employee_id IS NOT NULL 
       ORDER BY employee_id DESC 
       LIMIT 1`,
      [role]
    );

    let nextNumber = 1;
    const prefix = role === 'employee' ? 'EMP' : 'MAN';

    if (result.rows.length > 0) {
      const lastId = result.rows[0].employee_id;
      if (lastId && lastId.startsWith(prefix)) {
        const numberPart = lastId.replace(prefix, '');
        const lastNumber = parseInt(numberPart) || 0;
        nextNumber = lastNumber + 1;
      }
    }

    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
  }
}

module.exports = User;

