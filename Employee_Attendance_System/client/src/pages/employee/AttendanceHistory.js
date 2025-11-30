import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Calendar from 'react-calendar';
import { getMyHistory } from '../../store/slices/attendanceSlice';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import 'react-calendar/dist/Calendar.css';
import './AttendanceHistory.css';

const AttendanceHistory = () => {
  const dispatch = useDispatch();
  const { history, loading } = useSelector((state) => state.attendance);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'

  useEffect(() => {
    const startDate = startOfMonth(selectedDate).toISOString().split('T')[0];
    const endDate = endOfMonth(selectedDate).toISOString().split('T')[0];
    dispatch(getMyHistory({ startDate, endDate }));
  }, [dispatch, selectedDate]);

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      // Normalize date to YYYY-MM-DD format for comparison
      const dateStr = format(date, 'yyyy-MM-dd');
      // Find record by comparing normalized date strings
      const record = history.find((h) => {
        const recordDate = h.date ? format(new Date(h.date), 'yyyy-MM-dd') : null;
        return recordDate === dateStr;
      });
      if (record) {
        return `calendar-tile-${record.status}`;
      }
    }
    return null;
  };

  const getSelectedDateRecord = () => {
    // Normalize selected date to YYYY-MM-DD
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    // Find record by comparing normalized date strings
    return history.find((h) => {
      const recordDate = h.date ? format(new Date(h.date), 'yyyy-MM-dd') : null;
      return recordDate === dateStr;
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Attendance History</h1>
        <p>View your attendance records</p>
      </div>

      <div className="view-toggle">
        <button
          className={viewMode === 'calendar' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setViewMode('calendar')}
        >
          Calendar View
        </button>
        <button
          className={viewMode === 'table' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setViewMode('table')}
        >
          Table View
        </button>
      </div>

      {viewMode === 'calendar' ? (
        <div className="history-container">
          <div className="calendar-wrapper">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={getTileClassName}
              className="attendance-calendar"
            />
            <div className="calendar-legend">
              <div className="legend-item">
                <span className="legend-color present"></span>
                <span>Present</span>
              </div>
              <div className="legend-item">
                <span className="legend-color absent"></span>
                <span>Absent</span>
              </div>
              <div className="legend-item">
                <span className="legend-color late"></span>
                <span>Late</span>
              </div>
              <div className="legend-item">
                <span className="legend-color half-day"></span>
                <span>Half Day</span>
              </div>
            </div>
          </div>

          <div className="date-details">
            <h3>Details for {format(selectedDate, 'MMMM dd, yyyy')}</h3>
            {loading ? (
              <p>Loading...</p>
            ) : getSelectedDateRecord() ? (
              <div className="details-card">
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${getSelectedDateRecord().status}`}>
                    {getSelectedDateRecord().status}
                  </span>
                </div>
                {getSelectedDateRecord().check_in_time && (
                  <div className="detail-item">
                    <span className="detail-label">Check-in:</span>
                    <span className="detail-value">
                      {format(new Date(getSelectedDateRecord().check_in_time), 'HH:mm:ss')}
                    </span>
                  </div>
                )}
                {getSelectedDateRecord().check_out_time && (
                  <div className="detail-item">
                    <span className="detail-label">Check-out:</span>
                    <span className="detail-value">
                      {format(new Date(getSelectedDateRecord().check_out_time), 'HH:mm:ss')}
                    </span>
                  </div>
                )}
                {getSelectedDateRecord().total_hours && (
                  <div className="detail-item">
                    <span className="detail-label">Total Hours:</span>
                    <span className="detail-value">
                      {getSelectedDateRecord().total_hours} hours
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p>No attendance record for this date</p>
            )}
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : history.length > 0 ? (
                history.map((record, index) => (
                  <tr key={index}>
                    <td>{format(new Date(record.date), 'MMM dd, yyyy')}</td>
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
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;

