import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import './TeamSummary.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TeamSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadSummary();
  }, [filters]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/attendance/team-summary`, {
        params: { startDate: filters.startDate, endDate: filters.endDate },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error loading team summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="loading">Loading team summary...</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Team Attendance Summary</h1>
        <p>Overview of team attendance statistics</p>
      </div>

      <div className="filters-card">
        <h3>Date Range</h3>
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
        </div>
      </div>

      {summary && (
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Employees</h3>
            <div className="summary-value">{summary.totalEmployees}</div>
          </div>
          <div className="summary-card present">
            <h3>Present</h3>
            <div className="summary-value">{summary.present}</div>
          </div>
          <div className="summary-card absent">
            <h3>Absent</h3>
            <div className="summary-value">{summary.absent}</div>
          </div>
          <div className="summary-card late">
            <h3>Late</h3>
            <div className="summary-value">{summary.late}</div>
          </div>
          <div className="summary-card half-day">
            <h3>Half Day</h3>
            <div className="summary-value">{summary.halfDay}</div>
          </div>
          <div className="summary-card">
            <h3>Total Hours</h3>
            <div className="summary-value">{summary.totalHours.toFixed(1)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamSummary;

