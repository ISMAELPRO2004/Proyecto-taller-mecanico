import api from '../api/axios.js';

export const vehiculoService = {
  buscarPorPlaca: (placa) => api.get(`/vehiculos/${encodeURIComponent(placa)}`).then((r) => r.data),
  upsert: (payload) => api.post('/vehiculos', payload).then((r) => r.data),
  listarMarcas: () => api.get('/vehiculos/marcas').then((r) => r.data),
  crearMarca: (nombre) => api.post('/vehiculos/marcas', { nombre }).then((r) => r.data),
};
