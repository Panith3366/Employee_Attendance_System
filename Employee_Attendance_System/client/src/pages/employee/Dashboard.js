import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEmployeeDashboard } from '../../store/slices/dashboardSlice';
import { getTodayAttendance } from '../../store/slices/attendanceSlice';
import { format } from 'date-fns';
import './Dashboard.css';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { employeeData, loading } = useSelector((state) => state.dashboard);
  const { todayAttendance } = useSelector((state) => state.attendance);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getEmployeeDashboard());
    dispatch(getTodayAttendance());
  }, [dispatch]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!employeeData) {
    return <div className="loading">No data available</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome, {user?.name}!</h1>
        <p>Here's your attendance overview</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Today's Status</h3>
          <div className="value" style={{ color: employeeData.today.status === 'present' ? '#28a745' : '#dc3545' }}>
            {employeeData.today.status.toUpperCase()}
          </div>
          {employeeData.today.checkInTime && (
            <div className="subtitle">
              Check-in: {format(new Date(employeeData.today.checkInTime), 'HH:mm')}
            </div>
          )}
          {employeeData.today.checkOutTime && (
            <div className="subtitle">
              Check-out: {format(new Date(employeeData.today.checkOutTime), 'HH:mm')}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h3>This Month - Present</h3>
          <div className="value" style={{ color: '#28a745' }}>
            {employeeData.monthly.present}
          </div>
          <div className="subtitle">Days</div>
        </div>

        <div className="dashboard-card">
          <h3>This Month - Absent</h3>
          <div className="value" style={{ color: '#dc3545' }}>
            {employeeData.monthly.absent}
          </div>
          <div className="subtitle">Days</div>
        </div>

        <div className="dashboard-card">
          <h3>This Month - Late</h3>
          <div className="value" style={{ color: '#ffc107' }}>
            {employeeData.monthly.late}
          </div>
          <div className="subtitle">Days</div>
        </div>

        <div className="dashboard-card">
          <h3>Total Hours</h3>
          <div className="value" style={{ color: '#007bff' }}>
            {employeeData.monthly.totalHours.toFixed(1)}
          </div>
          <div className="subtitle">This Month</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Last 7 Days</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {employeeData.last7Days.length > 0 ? (
                employeeData.last7Days.map((day, index) => (
                  <tr key={index}>
                    <td>{format(new Date(day.date), 'MMM dd, yyyy')}</td>
                    <td>
                      <span className={`status-badge ${day.status}`}>
                        {day.status}
                      </span>
                    </td>
                    <td>
                      {day.checkInTime
                        ? format(new Date(day.checkInTime), 'HH:mm')
                        : '-'}
                    </td>
                    <td>
                      {day.checkOutTime
                        ? format(new Date(day.checkOutTime), 'HH:mm')
                        : '-'}
                    </td>
                    <td>{day.totalHours || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    No attendance records for the last 7 days
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

