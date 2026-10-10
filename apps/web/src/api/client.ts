import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('advocate_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      if (
        !window.location.pathname.includes('/login') &&
        window.location.pathname !== '/'
      ) {
        localStorage.removeItem('advocate_token');
        localStorage.removeItem('advocate_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
