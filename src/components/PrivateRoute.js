import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, admin = false }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const location = useLocation();

  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (admin && !userInfo.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;