import { labelEstadoOrden } from '../../../../constants/estadosOrden.js';

export const etiquetaOperacionFoto = (op) => {
  if (op === 'REEMPLAZAR') return 'Se reemplazó la imagen';
  if (op === 'QUITAR') return 'Se quitó la imagen';
  return 'Se subió la imagen';
};

const ROL_LABELS = {
  ADMIN: 'Administrador', SUPERVISOR: 'Supervisor', TECNICO: 'Técnico', RECEPCIONISTA: 'Recepcionista',
};

export const rolLabel = (val) => ROL_LABELS[val] || val || '—';

const CAMPO_LABELS = {
  clienteNombre: 'Cliente', clienteCelular: 'Celular',
  trabajoSolicitado: 'Trabajos a realizar',
  descripcionInformal: 'Solicitud del cliente',
  placa: 'Placa',
  marca: 'Marca', modelo: 'Modelo', horometro: 'Horómetro',
  kilometraje: 'Kilometraje', totalFinal: 'Total Final',
  estado: 'Estado', responsable: 'Responsable',
  nombreCompleto: 'Nombre Completo', username: 'Usuario',
  rol: 'Rol', activo: 'Estado de Cuenta',
  descripcion: 'Descripción', precioBase: 'Precio Base',
  nombre: 'Nombre', nombreRazonSocial: 'Nombre',
  tipoCliente: 'Tipo', tipoDocumento: 'Tipo de documento',
  numeroDocumento: 'Número de documento', representante: 'Representante',
  celular: 'Celular', correo: 'Correo',
  numeroFactura: 'Número de factura', montoFactura: 'Monto de factura',
  requiereFactura: 'Lleva factura',
};

export const campoLabel = (key) => CAMPO_LABELS[key] || String(key || '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');

export const formatFecha = (val) => {
  if (!val) return '—';
  try { return new Date(val).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return String(val); }
};

export const formatVal = (key, val) => {
  if (val === null || val === undefined || val === '') return '—';
  if (key === 'requiereFactura') return val ? 'Sí' : 'No';
  if (typeof val === 'boolean') return val ? 'Sí' : 'No';
  if (key === 'marca' && typeof val === 'object') return val.nombre || '—';
  if (key === 'tipoCliente') return val === 'EMPRESA' ? 'Empresa' : val === 'PERSONA' ? 'Persona' : String(val);
  if (typeof val === 'object') return '—';
  if (key === 'estado') return labelEstadoOrden(val);
  if (key === 'rol') return rolLabel(val);
  if (key === 'activo') return val ? 'Activo' : 'Inactivo';
  if (['totalFinal', 'precioBase', 'monto', 'montoFactura'].includes(key)) {
    const n = parseFloat(val);
    return Number.isFinite(n) ? `S/ ${n.toFixed(2)}` : '—';
  }
  if (['actualizadoAt', 'fechaCreacion', 'creadoAt'].includes(key)) return formatFecha(val);
  return String(val);
};
