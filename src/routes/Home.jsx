import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDefaultRouteByRole, path, USER_ROLE } from '../utils';

const Home = () => {
  const { isLoggedIn, userInfo } = useSelector((state) => state.user);

  // If not logged in -> public home
  if (!isLoggedIn) return <Navigate to={path.HOMEPAGE} replace />;

  // Nếu là patient → public home
  const role = userInfo && userInfo.role ? userInfo.role : null;
  if (role === USER_ROLE.PATIENT) return <Navigate to={path.HOMEPAGE} replace />;

  if (role === USER_ROLE.ADMIN || role === USER_ROLE.DOCTOR) {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  // Fallback
  return <Navigate to={path.HOMEPAGE} replace />;
};

export default Home;
