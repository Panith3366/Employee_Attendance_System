import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getManagerDashboard } from '../../store/slices/dashboardSlice';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { managerData, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(getManagerDashboard());
  }, [dispatch]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!managerData) {
    return <div className="loading">No data available</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Manager Dashboard</h1>
        <p>Team attendance overview and analytics</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Employees</h3>
          <div className="value">{managerData.totalEmployees}</div>
          <div className="subtitle">Active team members</div>
        </div>
        <div className="dashboard-card present">
          <h3>Today - Present</h3>
          <div className="value">{managerData.today.present}</div>
          <div className="subtitle">Checked in today</div>
        </div>
        <div className="dashboard-card absent">
          <h3>Today - Absent</h3>
          <div className="value">{managerData.today.absent}</div>
          <div className="subtitle">Not present today</div>
        </div>
        <div className="dashboard-card late">
          <h3>Today - Late</h3>
          <div className="value">{managerData.today.late}</div>
          <div className="subtitle">Late arrivals</div>
        </div>
        <div className="dashboard-card">
          <h3>Attendance Rate</h3>
          <div className="value">
            {managerData.totalEmployees > 0
              ? ((managerData.today.present / managerData.totalEmployees) * 100).toFixed(1)
              : 0}%
          </div>
          <div className="subtitle">Today's rate</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Weekly Attendance Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={managerData.weeklyAttendance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#28a745" name="Present" />
            <Line type="monotone" dataKey="absent" stroke="#dc3545" name="Absent" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Department-wise Attendance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={managerData.departmentStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="presentCount" fill="#28a745" name="Present" />
            <Bar dataKey="totalEmployees" fill="#6c757d" name="Total Employees" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {managerData.absentEmployees.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Absent Employees Today</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {managerData.absentEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.employeeId}</td>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;

