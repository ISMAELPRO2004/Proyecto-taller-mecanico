import api from '../api/axios.js';

export const vehiculoService = {
  listar: () => api.get('/vehiculos').then((r) => r.data),
  buscarPorPlaca: (placa) => api.get(`/vehiculos/${encodeURIComponent(placa)}`).then((r) => r.data),
  upsert: (payload) => api.post('/vehiculos', payload).then((r) => r.data),
  actualizar: (placa, payload) => api.put(`/vehiculos/${encodeURIComponent(placa)}`, payload).then((r) => r.data),
  eliminar: (placa) => api.delete(`/vehiculos/${encodeURIComponent(placa)}`).then((r) => r.data),
  listarMarcas: () => api.get('/vehiculos/marcas').then((r) => r.data),
  crearMarca: (nombre) => api.post('/vehiculos/marcas', { nombre }).then((r) => r.data),
  actualizarMarca: (id, nombre) => api.put(`/vehiculos/marcas/${id}`, { nombre }).then((r) => r.data),
  eliminarMarca: (id) => api.delete(`/vehiculos/marcas/${id}`).then((r) => r.data),
};
