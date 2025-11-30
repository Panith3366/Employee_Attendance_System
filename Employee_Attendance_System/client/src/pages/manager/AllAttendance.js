import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from '../../store/slices/attendanceSlice';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import './AllAttendance.css';

const AllAttendance = () => {
  const dispatch = useDispatch();
  const { allAttendance, loading } = useSelector((state) => state.attendance);
  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    employeeId: '',
    status: '', // Add status filter
  });

  useEffect(() => {
    dispatch(getAllAttendance({
      startDate: filters.startDate,
      endDate: filters.endDate,
      userId: filters.employeeId || null,
      status: filters.status || null,
    }));
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const uniqueEmployees = [...new Set(allAttendance.map(a => a.employee_id))].filter(Boolean);

  return (
    <div className="page">
      <div className="page-header">
        <h1>All Employees Attendance</h1>
        <p>View and filter attendance records</p>
      </div>

      <div className="filters-card">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>Employee ID</label>
            <select
              name="employeeId"
              value={filters.employeeId}
              onChange={handleFilterChange}
            >
              <option value="">All Employees</option>
              {uniqueEmployees.map((empId) => (
                <option key={empId} value={empId}>
                  {empId}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>Loading...</td>
              </tr>
            ) : allAttendance.length > 0 ? (
              allAttendance.map((record) => (
                <tr key={record.id}>
                  <td>{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                  <td>{record.employee_id || 'N/A'}</td>
                  <td>{record.name}</td>
                  <td>{record.department || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    {record.check_in_time
                      ? format(new Date(record.check_in_time), 'HH:mm')
                      : '-'}
                  </td>
                  <td>
                    {record.check_out_time
                      ? format(new Date(record.check_out_time), 'HH:mm')
                      : '-'}
                  </td>
                  <td>{record.total_hours || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllAttendance;

