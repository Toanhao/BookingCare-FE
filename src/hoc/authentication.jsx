import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { isBackofficeRole, path } from '../utils';

export const userIsAuthenticated = (Component) => {
  return (props) => {
    const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
    return isLoggedIn ? <Component {...props} /> : <Navigate to={path.LOGIN} replace />;
  };
};

export const userIsNotAuthenticated = (Component) => {
  return (props) => {
    const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
    return !isLoggedIn ? <Component {...props} /> : <Navigate to={path.HOME} replace />;
  };
};

// Chỉ cho phép admin/doctor vào system pages. Patient redirect về home.
export const userIsAdminOrDoctor = (Component) => {
  return (props) => {
    const { isLoggedIn, userInfo } = useSelector((state) => state.user);

    if (!isLoggedIn) {
      return <Navigate to={path.LOGIN} replace />;
    }

    if (!userInfo || !isBackofficeRole(userInfo.role)) {
      return <Navigate to={path.HOMEPAGE} replace />;
    }

    return <Component {...props} />;
  };
};
