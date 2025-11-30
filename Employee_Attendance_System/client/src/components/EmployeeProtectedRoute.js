import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const EmployeeProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'employee') {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default EmployeeProtectedRoute;

