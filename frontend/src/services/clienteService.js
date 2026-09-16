import api from '../api/axios.js';

export const clienteService = {
  listar: (q, todos = false) => api.get('/clientes', {
    params: { ...(q ? { q } : {}), ...(todos ? { todos: 1 } : {}) },
  }).then((r) => r.data),
  buscarDocumento: (documento) => api.get(`/clientes/documento/${documento}`).then((r) => r.data),
  upsert: (payload) => api.post('/clientes', payload).then((r) => r.data),
  actualizar: (id, payload) => api.put(`/clientes/${id}`, payload).then((r) => r.data),
  eliminar: (id) => api.delete(`/clientes/${id}`).then((r) => r.data),
};

