import api from '../api/axios.js';

export const catalogoService = {
  listarMateriales: () => api.get('/inventario').then(r => r.data),
  listarServicios: () => api.get('/servicios').then(r => r.data),
  listarTerceros: () => api.get('/terceros').then(r => r.data),
  crear: (tipo, payload) => api.post(tipo, payload).then(r => r.data),
  actualizar: (tipo, id, payload) => api.put(`${tipo}/${id}`, payload).then(r => r.data),
  eliminar: (tipo, id) => api.delete(`${tipo}/${id}`),
};

export const endpoints = {
  materiales: '/inventario',
  servicios: '/servicios',
  terceros: '/terceros',
};
