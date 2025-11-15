import axios from 'axios';
import { useStore } from '@/store/useStore';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to handle user ID
axiosInstance.interceptors.request.use((config) => {
  const state = useStore.getState();
  const userId = state.userId;
  if (userId) {
    config.headers['x-user-id'] = userId;
  }
  return config;
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;