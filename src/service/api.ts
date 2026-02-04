import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // ⭐ REQUIRED for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // optional: auto logout or redirect
      console.warn('Unauthorized');
    }
    return Promise.reject(error);
  }
);

export default api;
