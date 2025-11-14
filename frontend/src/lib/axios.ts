import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to handle user ID
axiosInstance.interceptors.request.use((config) => {
  // In a real app, we would get this from the store
  // For now, we'll use a default value
  const userId = 'dev-user-id';
  if (userId) {
    config.headers['x-user-id'] = userId;
  }
  return config;
});

export default axiosInstance;