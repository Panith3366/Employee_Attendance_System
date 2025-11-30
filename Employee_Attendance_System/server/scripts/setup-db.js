const db = require('../config/database');

const setupDatabase = async () => {
  try {
    console.log('Setting up database...');
    await db.connect();
    console.log('Database setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
};

setupDatabase();

