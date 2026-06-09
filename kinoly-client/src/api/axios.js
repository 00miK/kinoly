import axios from 'axios';

// Instance Axios pointant vers notre API locale
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Intercepteur de REQUÊTE : injecte le token JWT dans chaque appel
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de RÉPONSE : gère les tokens expirés (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Nettoyage de la session locale et redirection forcée
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
