import api from '../api/axios.js';

export const usuarioService = {
  listar:       ()            => api.get('/usuarios').then(r => r.data),
  crear:        (payload)     => api.post('/usuarios', payload).then(r => r.data),
  editar:       (id, payload) => api.put(`/usuarios/${id}`, payload).then(r => r.data),
  toggleActivo: (id)          => api.patch(`/usuarios/${id}/toggle-activo`).then(r => r.data),
  eliminar:     (id)          => api.delete(`/usuarios/${id}`),
  listarLogs:   (params)      => api.get('/usuarios/logs', { params }).then(r => r.data),
};