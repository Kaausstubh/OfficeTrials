import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { handleMockRequest } from './mockBackend';

const isProductionStatic =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('netlify.app') ||
    (!window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1')));

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('advocate_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If running in production static mode (Netlify), handle directly with mock backend
  if (isProductionStatic) {
    const mock = handleMockRequest(
      config.url || '',
      config.method || 'get',
      config.data,
      config.params
    );
    if (mock) {
      config.adapter = () => {
        return Promise.resolve({
          data: mock.data,
          status: mock.status,
          statusText: 'OK',
          headers: {},
          config,
        } as AxiosResponse);
      };
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  response => {
    // If Netlify SPA rewrite returned HTML for an API call
    if (
      typeof response.data === 'string' &&
      response.data.includes('<!doctype html>')
    ) {
      const mock = handleMockRequest(
        response.config.url || '',
        response.config.method || 'get',
        response.config.data,
        response.config.params
      );
      if (mock) {
        return {
          ...response,
          data: mock.data,
          status: mock.status,
        };
      }
    }
    return response;
  },
  error => {
    // If request failed (e.g. 404, network failure, or offline)
    const mock = handleMockRequest(
      error.config?.url || '',
      error.config?.method || 'get',
      error.config?.data,
      error.config?.params
    );
    if (mock) {
      return Promise.resolve({
        data: mock.data,
        status: mock.status,
        statusText: 'OK',
        headers: {},
        config: error.config,
      });
    }

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
