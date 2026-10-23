import { clienteService } from '../../../services/clienteService.js';

export const categoriaClientes = {
  id: 'clientes',
  label: 'Clientes',
  filtrar(lista, q) {
    return lista.filter((c) =>
      !q || c.nombreRazonSocial.toLowerCase().includes(q) || (c.numeroDocumento || '').toLowerCase().includes(q)
    );
  },
  formDesde(item) {
    return {
      ...item,
      representante: item.representante || '',
      celular: item.celular || '',
      correo: item.correo || '',
    };
  },
  guardar(form) {
    return clienteService.actualizar(form.id, form);
  },
  eliminar(item) {
    return clienteService.eliminar(item.id);
  },
};
