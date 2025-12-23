import axios from 'axios';

// Assuming you have a way to get the token, e.g., from localStorage or AuthContext
const getToken = () => localStorage.getItem('token'); // Adjust based on your storage

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include Authorization header
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
