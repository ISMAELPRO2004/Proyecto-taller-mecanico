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
  validar(form) {
    const e = {};
    if (!form.nombreRazonSocial?.trim() || form.nombreRazonSocial.trim().length < 2) {
      e.nombreRazonSocial = 'Nombre / razón social obligatorio';
    }
    const tipoDocumento = form.tipoCliente === 'EMPRESA' ? 'RUC' : form.tipoDocumento;
    if (form.tipoCliente === 'EMPRESA' && tipoDocumento !== 'RUC') {
      e.tipoDocumento = 'Una empresa solo puede usar RUC';
    }
    const doc = String(form.numeroDocumento || '').replace(/\D/g, '');
    if (!doc) e.numeroDocumento = tipoDocumento === 'RUC' ? 'RUC: 11 dígitos' : 'DNI: 8 dígitos';
    else if (tipoDocumento === 'DNI' && doc.length !== 8) e.numeroDocumento = 'DNI: 8 dígitos';
    else if (tipoDocumento === 'RUC' && doc.length !== 11) e.numeroDocumento = 'RUC: 11 dígitos';
    const cel = String(form.celular || '').replace(/\D/g, '');
    if (cel && cel.length !== 9) e.celular = 'Celular: 9 dígitos';
    if (form.correo?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
      e.correo = 'Correo inválido';
    }
    return e;
  },
  guardar(form) {
    return clienteService.actualizar(form.id, form);
  },
  eliminar(item) {
    return clienteService.eliminar(item.id);
  },
};
