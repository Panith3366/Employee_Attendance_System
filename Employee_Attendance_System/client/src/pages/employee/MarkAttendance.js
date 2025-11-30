import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkIn, checkOut, getTodayAttendance, clearError } from '../../store/slices/attendanceSlice';
import { format } from 'date-fns';
import './MarkAttendance.css';

const MarkAttendance = () => {
  const dispatch = useDispatch();
  const { todayAttendance, loading, error } = useSelector((state) => state.attendance);
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(getTodayAttendance());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleCheckIn = async () => {
    setMessage('');
    const result = await dispatch(checkIn());
    if (checkIn.fulfilled.match(result)) {
      setMessage('Checked in successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCheckOut = async () => {
    setMessage('');
    const result = await dispatch(checkOut());
    if (checkOut.fulfilled.match(result)) {
      setMessage('Checked out successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const isCheckedIn = todayAttendance?.check_in_time;
  const isCheckedOut = todayAttendance?.check_out_time;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Mark Attendance</h1>
        <p>Check in and check out for today</p>
      </div>

      <div className="attendance-card">
        <div className="attendance-date">
          <h2>{format(new Date(), 'EEEE, MMMM dd, yyyy')}</h2>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <div className="attendance-status">
          {todayAttendance ? (
            <>
              <div className="status-item">
                <span className="status-label">Status:</span>
                <span className={`status-badge ${todayAttendance.status}`}>
                  {todayAttendance.status}
                </span>
              </div>
              {isCheckedIn && (
                <div className="status-item">
                  <span className="status-label">Check-in Time:</span>
                  <span className="status-value">
                    {format(new Date(todayAttendance.check_in_time), 'HH:mm:ss')}
                  </span>
                </div>
              )}
              {isCheckedOut && (
                <div className="status-item">
                  <span className="status-label">Check-out Time:</span>
                  <span className="status-value">
                    {format(new Date(todayAttendance.check_out_time), 'HH:mm:ss')}
                  </span>
                </div>
              )}
              {todayAttendance.total_hours && (
                <div className="status-item">
                  <span className="status-label">Total Hours:</span>
                  <span className="status-value">{todayAttendance.total_hours} hours</span>
                </div>
              )}
            </>
          ) : (
            <p>No attendance record for today</p>
          )}
        </div>

        <div className="attendance-actions">
          {!isCheckedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="btn btn-success btn-large"
            >
              {loading ? 'Processing...' : 'Check In'}
            </button>
          ) : !isCheckedOut ? (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="btn btn-danger btn-large"
            >
              {loading ? 'Processing...' : 'Check Out'}
            </button>
          ) : (
            <div className="completed-message">
              <p>You have completed your attendance for today!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;

