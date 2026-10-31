import { MOVIMIENTO, movimientosDeLog } from '../../../../utils/movimientoLog.js';

export const accionBtn = 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-lyer-linea/50 bg-lyer-hover text-lyer-cyan transition-colors hover:border-lyer-cyan/50 hover:bg-lyer-cyan/10';

export const resumenLog = (log) => {
  const detalles = typeof log?.detalles === 'string'
    ? (() => { try { return JSON.parse(log.detalles); } catch { return null; } })()
    : log?.detalles;
  return detalles?.resumen || '';
};

export const marcas = (log) => movimientosDeLog(log).map((clave) => ({ clave, ...MOVIMIENTO[clave] }));
