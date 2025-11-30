import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Calendar from 'react-calendar';
import { getAllAttendance } from '../../store/slices/attendanceSlice';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import 'react-calendar/dist/Calendar.css';
import './TeamCalendar.css';

const TeamCalendar = () => {
  const dispatch = useDispatch();
  const { allAttendance, loading } = useSelector((state) => state.attendance);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');
    dispatch(getAllAttendance({ startDate, endDate }));
  }, [dispatch, selectedMonth]);

  const getDateStats = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const records = allAttendance.filter((a) => a.date === dateStr);
    const present = records.filter((a) => a.status === 'present' || a.status === 'late' || a.status === 'half-day').length;
    const absent = records.filter((a) => a.status === 'absent').length;
    return { present, absent, total: records.length };
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const stats = getDateStats(date);
      if (stats.total > 0) {
        const presentRate = stats.present / stats.total;
        if (presentRate >= 0.8) return 'calendar-tile-good';
        if (presentRate >= 0.5) return 'calendar-tile-warning';
        return 'calendar-tile-bad';
      }
    }
    return null;
  };

  const getSelectedDateRecords = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return allAttendance.filter((a) => a.date === dateStr);
  };

  const handleMonthChange = (date) => {
    setSelectedMonth(date);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Team Calendar View</h1>
        <p>Visual overview of team attendance</p>
      </div>

      <div className="calendar-container">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={getTileClassName}
          onActiveStartDateChange={({ activeStartDate }) => handleMonthChange(activeStartDate)}
          className="team-calendar"
        />
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-color good"></span>
            <span>Good Attendance (≥80%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color warning"></span>
            <span>Moderate (50-79%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color bad"></span>
            <span>Poor (&lt;50%)</span>
          </div>
        </div>
      </div>

      <div className="date-details-card">
        <h3>Attendance Details for {format(selectedDate, 'MMMM dd, yyyy')}</h3>
        {loading ? (
          <p>Loading...</p>
        ) : getSelectedDateRecords().length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                </tr>
              </thead>
              <tbody>
                {getSelectedDateRecords().map((record) => (
                  <tr key={record.id}>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No attendance records for this date</p>
        )}
      </div>
    </div>
  );
};

export default TeamCalendar;

