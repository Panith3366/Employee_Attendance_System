import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isManager = user?.role === 'manager';

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <Link to={isManager ? '/manager/dashboard' : '/employee/dashboard'}>
            Attendance System
          </Link>
        </div>
        <div className="navbar-links">
          {isManager ? (
            <>
              <Link to="/manager/dashboard">Dashboard</Link>
              <Link to="/manager/attendance">All Attendance</Link>
              <Link to="/manager/calendar">Calendar</Link>
              <Link to="/manager/summary">Team Summary</Link>
              <Link to="/manager/reports">Reports</Link>
            </>
          ) : (
            <>
              <Link to="/employee/dashboard">Dashboard</Link>
              <Link to="/employee/attendance">Mark Attendance</Link>
              <Link to="/employee/history">History</Link>
              <Link to="/employee/profile">Profile</Link>
            </>
          )}
          <div className="navbar-user">
            <span>{user?.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

