import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAttendanceSummary, exportAttendance } from '../../store/slices/attendanceSlice';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import './Reports.css';

const Reports = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.attendance);
  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    employeeId: '',
    status: '',
  });
  const [summary, setSummary] = useState(null);
  const [exporting, setExporting] = useState(false);

  const loadSummary = async () => {
    const result = await dispatch(getAttendanceSummary({
      startDate: filters.startDate,
      endDate: filters.endDate,
    }));
    if (getAttendanceSummary.fulfilled.match(result)) {
      setSummary(result.payload);
    }
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await dispatch(exportAttendance({
        startDate: filters.startDate,
        endDate: filters.endDate,
        userId: filters.employeeId || null,
        status: filters.status || null,
      }));
      if (exportAttendance.fulfilled.match(result)) {
        // Download is handled in the thunk
      } else if (exportAttendance.rejected.match(result)) {
        alert('Export failed: ' + result.payload);
      }
    } catch (error) {
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Attendance Reports</h1>
        <p>Generate and export attendance reports</p>
      </div>

      <div className="filters-card">
        <h3>Report Filters</h3>
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
            <label>Employee ID (Optional)</label>
            <input
              type="text"
              name="employeeId"
              value={filters.employeeId}
              onChange={handleFilterChange}
              placeholder="Leave empty for all employees"
            />
          </div>
          <div className="form-group">
            <label>Status (Optional)</label>
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
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn btn-success"
          style={{ marginTop: '15px' }}
        >
          {exporting ? 'Exporting...' : 'Export to CSV'}
        </button>
      </div>

      {summary && (
        <div className="summary-card">
          <h3>Summary Report</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Total Records</span>
              <span className="summary-value">{summary.totalRecords}</span>
            </div>
            <div className="summary-item present">
              <span className="summary-label">Present</span>
              <span className="summary-value">{summary.present}</span>
            </div>
            <div className="summary-item absent">
              <span className="summary-label">Absent</span>
              <span className="summary-value">{summary.absent}</span>
            </div>
            <div className="summary-item late">
              <span className="summary-label">Late</span>
              <span className="summary-value">{summary.late}</span>
            </div>
            <div className="summary-item half-day">
              <span className="summary-label">Half Day</span>
              <span className="summary-value">{summary.halfDay}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Hours</span>
              <span className="summary-value">{summary.totalHours.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="loading">Loading summary...</div>}
    </div>
  );
};

export default Reports;

