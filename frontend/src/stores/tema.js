import { defineStore } from 'pinia';
import { aplicarTema, temaGuardado } from '../utils/tema.js';

export const useTemaStore = defineStore('tema', {
  state: () => ({ actual: temaGuardado() }),
  getters: {
    esClaro: (state) => state.actual === 'claro',
  },
  actions: {
    aplicar(tema) {
      this.actual = tema === 'claro' ? 'claro' : 'oscuro';
      aplicarTema(this.actual);
    },
    alternar() {
      this.aplicar(this.actual === 'claro' ? 'oscuro' : 'claro');
    },
  },
});
