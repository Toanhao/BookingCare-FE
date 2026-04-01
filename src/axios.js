import axios from 'axios';
import reduxStore from './redux';
import actionTypes from './store/actions/actionTypes';
import { navigateTo } from './utils/navigationUtils';
import {
  clearAccessToken,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearAllTokens,
} from './utils/authToken';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  // withCredentials: true
});

// queue awaiting token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// add token to headers
instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      // logout when no token or token expired
      if (!getAccessToken()) {
        clearAllTokens();
        reduxStore.dispatch({ type: actionTypes.PROCESS_LOGOUT });
        navigateTo('/login', { replace: true });
        return Promise.reject(error.response.data || error);
      }

      // check refresh token
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAllTokens();
        reduxStore.dispatch({ type: actionTypes.PROCESS_LOGOUT });
        navigateTo('/login', { replace: true });
        return Promise.reject(error.response.data || error);
      }

      // refresh token
      if (!isRefreshing) {
        isRefreshing = true;

        //call API refresh token
        return axios
          .post(
            `${import.meta.env.VITE_BACKEND_URL}/api/users/refresh-token`,
            { refreshToken }
          )
          .then((res) => {
            if (res.data.errCode === 0) {
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data.data;

              // save new token
              setAccessToken(newAccessToken);
              setRefreshToken(newRefreshToken);

              // Process queue
              processQueue(null, newAccessToken);

              // Retry original request với token mới
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return instance(originalRequest);
            } else {
              // Refresh fail, logout
              clearAllTokens();
              reduxStore.dispatch({ type: actionTypes.PROCESS_LOGOUT });
              navigateTo('/login', { replace: true });
              processQueue(new Error('Refresh token failed'), null);
              return Promise.reject(res.data);
            }
          })
          .catch((err) => {
            clearAllTokens();
            reduxStore.dispatch({ type: actionTypes.PROCESS_LOGOUT });
            navigateTo('/login', { replace: true });
            processQueue(err, null);
            return Promise.reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      } else {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
    }

    if (error.response) {
      return Promise.reject(error.response.data || error);
    } else if (error.request) {
      return Promise.reject(error);
    } else {
      return Promise.reject(error);
    }
  }
);

export default instance;
