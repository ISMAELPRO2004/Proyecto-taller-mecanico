import api from '../api/axios.js';

export const clienteService = {
  listar: (q) => api.get('/clientes', { params: q ? { q } : {} }).then((r) => r.data),
  buscarDocumento: (documento) => api.get(`/clientes/documento/${documento}`).then((r) => r.data),
  upsert: (payload) => api.post('/clientes', payload).then((r) => r.data),
};
