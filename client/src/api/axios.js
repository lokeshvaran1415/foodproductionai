import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only clear session and redirect if this is not a login/auth attempt
    const isAuthRoute = err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/auth/register');
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
