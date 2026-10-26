import { nombreClienteOrden, marcaVehiculoOrden, modeloVehiculoOrden } from '../../../../utils/ordenDisplay.js';
import { ESTADO, labelEstadoOrden } from '../../../../constants/estadosOrden.js';

export const PILLS = {
  [ESTADO.EN_ESPERA]: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  [ESTADO.ACEPTADO]: 'border-lyer-accent/40 bg-lyer-green/40 text-lyer-soft',
  [ESTADO.EN_REPARACION]: 'border-orange-500/40 bg-orange-500/15 text-orange-300',
  [ESTADO.CAMBIO_ACEITE]: 'border-sky-500/40 bg-sky-500/15 text-sky-300',
  [ESTADO.ESPERANDO_REPUESTO]: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200',
  [ESTADO.TERMINADO]: 'border-green-500/40 bg-green-500/15 text-green-300',
  [ESTADO.CANCELADO]: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
};

export const pillEstado = (estado) => PILLS[estado] || 'border-slate-600 bg-slate-800 text-lyer-muted';

export const etiquetaEstado = labelEstadoOrden;

export const fechaOrden = (orden) => {
  const valor = orden?.fechaCreacion;
  if (!valor) return '—';
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? '—' : fecha.toLocaleDateString('es-PE');
};

export const montoOrden = (orden) => Number(orden?.totalFinal || 0).toLocaleString('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const vehiculoOrden = (orden) =>
  [marcaVehiculoOrden(orden), modeloVehiculoOrden(orden)].filter(Boolean).join(' ');

export { nombreClienteOrden };

export const accionBtn = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-lyer-linea/50 bg-lyer-hover transition-colors disabled:opacity-40';
