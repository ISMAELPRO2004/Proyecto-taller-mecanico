import { nombreClienteOrden, marcaVehiculoOrden, modeloVehiculoOrden } from '../../../../utils/ordenDisplay.js';

export const PILLS = {
  EN_ESPERA: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  ACEPTADO: 'border-lyer-accent/40 bg-lyer-green/40 text-lyer-soft',
  EN_REPARACION: 'border-orange-500/40 bg-orange-500/15 text-orange-300',
  CAMBIO_ACEITE: 'border-sky-500/40 bg-sky-500/15 text-sky-300',
  ESPERANDO_REPUESTO: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200',
  TERMINADO: 'border-green-500/40 bg-green-500/15 text-green-300',
  CANCELADO: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
};

export const pillEstado = (estado) => PILLS[estado] || 'border-slate-600 bg-slate-800 text-slate-300';

export const etiquetaEstado = (estado) => ({
  EN_ESPERA: 'En espera',
  ACEPTADO: 'Aceptado',
  EN_REPARACION: 'En reparación',
  CAMBIO_ACEITE: 'Cambio de aceite',
  ESPERANDO_REPUESTO: 'Esperando repuesto',
  TERMINADO: 'Terminado',
  CANCELADO: 'Cancelado',
}[estado] || estado);

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

export const accionBtn = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#4a2870]/50 bg-[#2a1840] transition-colors disabled:opacity-40';
