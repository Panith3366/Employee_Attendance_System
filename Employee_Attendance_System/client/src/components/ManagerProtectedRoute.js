import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ManagerProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/manager/login" />;
  }

  if (user?.role !== 'manager') {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ManagerProtectedRoute;

