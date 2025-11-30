import React from 'react';
import { useSelector } from 'react-redux';
import './Profile.css';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Your account information</p>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2>{user?.name}</h2>
        </div>

        <div className="profile-details">
          <div className="profile-item">
            <span className="profile-label">Employee ID:</span>
            <span className="profile-value">{user?.employeeId || 'N/A'}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Email:</span>
            <span className="profile-value">{user?.email}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Department:</span>
            <span className="profile-value">{user?.department || 'N/A'}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Role:</span>
            <span className="profile-value">{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

