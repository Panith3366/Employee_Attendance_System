const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured');
  }
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send late arrival email
const sendLateArrivalEmail = async (userEmail, userName, checkInTime) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Late Arrival Notification',
      html: `
        <h2>Late Arrival Alert</h2>
        <p>Hello ${userName},</p>
        <p>You checked in late today at ${new Date(checkInTime).toLocaleTimeString()}.</p>
        <p>Please ensure you arrive on time in the future.</p>
      `,
    });
    console.log(`Late arrival email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending late arrival email:', error);
  }
};

// Send early checkout email
const sendEarlyCheckoutEmail = async (userEmail, userName, checkOutTime) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Early Checkout Notification',
      html: `
        <h2>Early Checkout Alert</h2>
        <p>Hello ${userName},</p>
        <p>You checked out early today at ${new Date(checkOutTime).toLocaleTimeString()}.</p>
        <p>Please ensure you complete your full working hours.</p>
      `,
    });
    console.log(`Early checkout email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending early checkout email:', error);
  }
};

// Send weekly summary email
const sendWeeklySummaryEmail = async (userEmail, userName, summary) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Weekly Attendance Summary',
      html: `
        <h2>Weekly Attendance Summary</h2>
        <p>Hello ${userName},</p>
        <p>Here's your attendance summary for this week:</p>
        <ul>
          <li>Present: ${summary.present} days</li>
          <li>Absent: ${summary.absent} days</li>
          <li>Late: ${summary.late} days</li>
          <li>Total Hours: ${summary.totalHours} hours</li>
        </ul>
      `,
    });
    console.log(`Weekly summary email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending weekly summary email:', error);
  }
};

// Send manager alert email
const sendManagerAlertEmail = async (managerEmail, alertType, data) => {
  try {
    const transporter = createTransporter();
    let subject = '';
    let html = '';

    switch (alertType) {
      case 'consecutive_absents':
        subject = 'Alert: Employee with 3 Consecutive Absences';
        html = `
          <h2>Consecutive Absence Alert</h2>
          <p>The following employee(s) have been absent for 3 consecutive days:</p>
          <ul>
            ${data.map(emp => `<li>${emp.name} (${emp.employeeId})</li>`).join('')}
          </ul>
        `;
        break;
      case 'low_punctuality':
        subject = 'Alert: Low Punctuality Rate';
        html = `
          <h2>Low Punctuality Alert</h2>
          <p>The following employee(s) have punctuality below 50%:</p>
          <ul>
            ${data.map(emp => `<li>${emp.name} (${emp.employeeId}) - ${emp.punctuality}%</li>`).join('')}
          </ul>
        `;
        break;
      case 'multiple_late':
        subject = 'Alert: Multiple Late Arrivals Today';
        html = `
          <h2>Multiple Late Arrivals Alert</h2>
          <p>There are ${data.count} late arrivals today.</p>
        `;
        break;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: managerEmail,
      subject,
      html,
    });
    console.log(`Manager alert email sent to ${managerEmail}`);
  } catch (error) {
    console.error('Error sending manager alert email:', error);
  }
};

module.exports = {
  sendLateArrivalEmail,
  sendEarlyCheckoutEmail,
  sendWeeklySummaryEmail,
  sendManagerAlertEmail,
};

