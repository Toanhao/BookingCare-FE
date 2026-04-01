import actionTypes from './actionTypes';
import { navigateTo } from '../../utils/navigationUtils';
import { getUserProfileApi } from '../../services/userService';
import {
  clearAccessToken,
  getAccessToken,
  clearRefreshToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearAllTokens,
} from '../../utils/authToken';

export const userLoginSuccess = (userInfo) => ({
  type: actionTypes.USER_LOGIN_SUCCESS,
  userInfo: userInfo,
});

export const userLoginFail = () => ({
  type: actionTypes.USER_LOGIN_FAIL,
});

// Gọi khi access token hết hạn, tự động lấy token mới
export const refreshAccessTokenAction = () => {
  return async (dispatch, getState) => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Gọi API refresh-token
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/refresh-token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!response.ok) {
        throw new Error('Refresh token failed');
      }

      const result = await response.json();

      if (result.errCode === 0) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          result.data;

        // Lưu tokens mới vào localStorage
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);

        return newAccessToken;
      } else {
        throw new Error(result.message || 'Refresh token failed');
      }
    } catch (error) {
      // Nếu refresh token fail, logout
      clearAllTokens();
      dispatch({ type: actionTypes.PROCESS_LOGOUT });
      navigateTo('/login', { replace: true });
      throw error;
    }
  };
};

export const processLogout = () => {
  return (dispatch,getState) => {
    clearAllTokens();
    dispatch({ type: actionTypes.PROCESS_LOGOUT });
    navigateTo('/login', { replace: true });
  };
};

export const initializeAuthSession = () => {
  return async (dispatch, getState) => {
    const token = getAccessToken();
    if (!token) return;

    const state = getState();
    if (state?.user?.isLoggedIn && state?.user?.userInfo?.id) return;

    try {
      const res = await getUserProfileApi();
      const rawUser = res?.data;
      const profile =
        rawUser && rawUser.dataValues ? { ...rawUser.dataValues } : rawUser;

      if (profile?.id) {
        dispatch(userLoginSuccess(profile));
      } else {
        throw new Error('Invalid profile payload');
      }
    } catch (error) {
      clearAllTokens();
      dispatch({ type: actionTypes.PROCESS_LOGOUT });
    }
  };
};
