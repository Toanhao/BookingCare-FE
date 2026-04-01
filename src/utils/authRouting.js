import { path, USER_ROLE } from './constant';

export const getDefaultRouteByRole = (role) => {
  if (role === USER_ROLE.ADMIN) return '/system/user-redux';
  if (role === USER_ROLE.DOCTOR) return '/doctor/manage-schedule';
  return path.HOMEPAGE;
};

export const isBackofficeRole = (role) => {
  return role === USER_ROLE.ADMIN || role === USER_ROLE.DOCTOR;
};
