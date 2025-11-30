import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Unauthorized = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="page" style={{ textAlign: 'center', padding: '50px 20px' }}>
      <h1 style={{ fontSize: '48px', color: '#dc3545', marginBottom: '20px' }}>403</h1>
      <h2>Access Denied</h2>
      <p style={{ fontSize: '18px', color: '#7f8c8d', marginBottom: '30px' }}>
        You don't have permission to access this page.
      </p>
      {user?.role === 'employee' ? (
        <Link to="/employee/dashboard" className="btn btn-primary">
          Go to Employee Dashboard
        </Link>
      ) : (
        <Link to="/manager/dashboard" className="btn btn-primary">
          Go to Manager Dashboard
        </Link>
      )}
    </div>
  );
};

export default Unauthorized;

