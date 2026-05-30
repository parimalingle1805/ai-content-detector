import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Point to the Express backend
});

api.interceptors.request.use((config) => {
  // Add authentication token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
