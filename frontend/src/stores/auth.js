import { defineStore } from 'pinia';
import { authService } from '../services/authService.js';
import { limpiarBorradorLocal } from '../utils/borradorRecepcion.js';
import { limpiarBorradorTaller } from '../utils/borradorTaller.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    async login(nombreUsuario, contrasena) {
      try {
        const data = await authService.login({ nombreUsuario, contrasena });
        this.token = data.token;
        this.usuario = data.usuario;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        return true;
      } catch (error) {
        console.error('Error en login:', error.response?.data?.message);
        return false;
      }
    },
    logout() {
      this.token = null;
      this.usuario = null;
      localStorage.clear();
      limpiarBorradorLocal();
      limpiarBorradorTaller();
    }
  }
});
