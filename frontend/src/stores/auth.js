import { defineStore } from 'pinia';
import api from '../api/axios.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    async login(username, password) {
      try {
        const { data } = await api.post('/auth/login', { username, password });
        this.token = data.token;
        this.usuario = data.usuario;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        return true;
      } catch (error) {
        console.error("Error en login:", error.response?.data?.message);
        return false;
      }
    },
    logout() {
      this.token = null;
      this.usuario = null;
      localStorage.clear();
    }
  }
});