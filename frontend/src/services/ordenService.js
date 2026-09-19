import api from '../api/axios.js';

export const ordenService = {
  listar: () => api.get('/ordenes').then(r => r.data),
  obtener: (id) => api.get(`/ordenes/${id}`).then(r => r.data),
  crear: (payload) => api.post('/ordenes', payload).then(r => r.data),
  actualizar: (id, payload) => api.put(`/ordenes/${id}`, payload).then(r => r.data),
  aceptar: (id, payload = {}) => api.post(`/ordenes/${id}/aceptar`, payload).then(r => r.data),
  cambiarEstado: (id, payload) => api.put(`/ordenes/${id}/estado`, typeof payload === 'string' ? { estado: payload } : payload).then(r => r.data),
  cerrar: (id) => api.patch(`/ordenes/${id}/cerrar`).then(r => r.data),
  eliminar: (id) => api.delete(`/ordenes/${id}`),
  subirFoto: (id, tipo, file) => {
    const data = new FormData();
    data.append('foto', file);
    return api.post(`/ordenes/${id}/foto/${tipo}`, data).then(r => r.data);
  },
  quitarFoto: (id, tipo) => api.delete(`/ordenes/${id}/foto/${tipo}`).then(r => r.data),
  descargarFoto: (id, tipo) => api.get(`/ordenes/${id}/foto/${tipo}`, { responseType: 'blob' }).then(r => r.data),
  actualizarFactura: (id, payload) => api.patch(`/ordenes/${id}/factura`, payload).then(r => r.data),
  guardarPasoVehiculo: (payload, id = null) => (
    id
      ? api.put(`/ordenes/${id}/borrador/vehiculo`, payload).then(r => r.data)
      : api.post('/ordenes/borrador/vehiculo', payload).then(r => r.data)
  ),
  guardarPasoCliente: (id, payload) => api.put(`/ordenes/${id}/borrador/cliente`, payload).then(r => r.data),
  completarRecepcion: (id, payload) => api.put(`/ordenes/${id}/borrador/completar`, payload).then(r => r.data),
};
