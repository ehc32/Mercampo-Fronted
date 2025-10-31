// axiosConfig.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
});

// Interceptor para agregar el token en cada request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access'); // Asegúrate de que el token se guarda con la key 'access'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
