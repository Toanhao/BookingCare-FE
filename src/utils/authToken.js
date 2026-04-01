const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// ========== ACCESS TOKEN ==========
export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token) => {
  if (!token) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token) => {
  if (!token) return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const clearAllTokens = () => {
  clearAccessToken();
  clearRefreshToken();
};
