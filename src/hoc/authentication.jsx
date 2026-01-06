import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export const userIsAuthenticated = (Component) => {
  return (props) => {
    const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
    return isLoggedIn ? <Component {...props} /> : <Navigate to="/login" replace />;
  };
};

export const userIsNotAuthenticated = (Component) => {
  return (props) => {
    const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
    return !isLoggedIn ? <Component {...props} /> : <Navigate to="/" replace />;
  };
};

// Chỉ cho phép admin/doctor vào system pages. Patient redirect về home.
export const userIsAdminOrDoctor = (Component) => {
  return (props) => {
    const { isLoggedIn, userInfo } = useSelector((state) => state.user);
    
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    
    if (!userInfo || userInfo.role === 'PATIENT') {
      return <Navigate to="/home" replace />;
    }
    
    return <Component {...props} />;
  };
};
