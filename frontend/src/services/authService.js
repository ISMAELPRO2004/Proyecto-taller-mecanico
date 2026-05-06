import api from '../api/axios.js';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials).then(r => r.data),
};