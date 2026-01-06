import actionTypes from './actionTypes';
import { navigateTo } from '../../utils/navigationUtils';

export const userLoginSuccess = (userInfo) => ({
  type: actionTypes.USER_LOGIN_SUCCESS,
  userInfo: userInfo,
});

export const userLoginFail = () => ({
  type: actionTypes.USER_LOGIN_FAIL,
});

export const processLogout = () => {
  return (dispatch, getState) => {
    localStorage.removeItem('access_token');
    dispatch({ type: actionTypes.PROCESS_LOGOUT });
    navigateTo('/login', { replace: true });
  };
};
