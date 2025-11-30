import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './store/slices/authSlice';
import PrivateRoute from './components/PrivateRoute';
import EmployeeProtectedRoute from './components/EmployeeProtectedRoute';
import ManagerProtectedRoute from './components/ManagerProtectedRoute';
import Navbar from './components/Navbar';

// Employee Pages
import EmployeeLogin from './pages/employee/Login';
import EmployeeRegister from './pages/employee/Register';
import EmployeeDashboard from './pages/employee/Dashboard';
import MarkAttendance from './pages/employee/MarkAttendance';
import AttendanceHistory from './pages/employee/AttendanceHistory';
import Profile from './pages/employee/Profile';

// Manager Pages
import ManagerLogin from './pages/manager/Login';
import ManagerDashboard from './pages/manager/Dashboard';
import AllAttendance from './pages/manager/AllAttendance';
import TeamCalendar from './pages/manager/TeamCalendar';
import Reports from './pages/manager/Reports';
import TeamSummary from './pages/manager/TeamSummary';
import Unauthorized from './pages/Unauthorized';

import './App.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} />
            ) : (
              <EmployeeLogin />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/employee/dashboard" />
            ) : (
              <EmployeeRegister />
            )
          }
        />
        <Route
          path="/manager/login"
          element={
            isAuthenticated && user?.role === 'manager' ? (
              <Navigate to="/manager/dashboard" />
            ) : (
              <ManagerLogin />
            )
          }
        />

        {/* Employee Routes */}
        <Route
          path="/employee/dashboard"
          element={
            <EmployeeProtectedRoute>
              <EmployeeDashboard />
            </EmployeeProtectedRoute>
          }
        />
        <Route
          path="/employee/attendance"
          element={
            <EmployeeProtectedRoute>
              <MarkAttendance />
            </EmployeeProtectedRoute>
          }
        />
        <Route
          path="/employee/history"
          element={
            <EmployeeProtectedRoute>
              <AttendanceHistory />
            </EmployeeProtectedRoute>
          }
        />
        <Route
          path="/employee/profile"
          element={
            <EmployeeProtectedRoute>
              <Profile />
            </EmployeeProtectedRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/manager/dashboard"
          element={
            <ManagerProtectedRoute>
              <ManagerDashboard />
            </ManagerProtectedRoute>
          }
        />
        <Route
          path="/manager/attendance"
          element={
            <ManagerProtectedRoute>
              <AllAttendance />
            </ManagerProtectedRoute>
          }
        />
        <Route
          path="/manager/calendar"
          element={
            <ManagerProtectedRoute>
              <TeamCalendar />
            </ManagerProtectedRoute>
          }
        />
        <Route
          path="/manager/reports"
          element={
            <ManagerProtectedRoute>
              <Reports />
            </ManagerProtectedRoute>
          }
        />
        <Route
          path="/manager/summary"
          element={
            <ManagerProtectedRoute>
              <TeamSummary />
            </ManagerProtectedRoute>
          }
        />

        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Default Route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;

