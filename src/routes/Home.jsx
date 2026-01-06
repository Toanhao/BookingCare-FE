import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
  const { isLoggedIn, userInfo } = useSelector((state) => state.user);

  // If not logged in -> public home
  if (!isLoggedIn) return <Navigate to="/home" replace />;

  // Nếu là patient → public home
  const role = userInfo && userInfo.role ? userInfo.role : null;
  if (role === 'PATIENT') return <Navigate to="/home" replace />;

  // Admin → system user redux; Doctor → doctor manage schedule
  if (role === 'ADMIN') return <Navigate to="/system/user-redux" replace />;
  if (role === 'DOCTOR') return <Navigate to="/doctor/manage-schedule" replace />;

  // Fallback
  return <Navigate to="/home" replace />;
};

export default Home;
