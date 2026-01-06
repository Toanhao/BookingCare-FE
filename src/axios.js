import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  // withCredentials: true
});

// Request interceptor để tự động thêm token vào header
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
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
    // Thrown error for request with OK status code
    // Use destructured data so eslint recognizes it as used.
    return response.data;
  },
  (error) => {
    // Error handler
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
