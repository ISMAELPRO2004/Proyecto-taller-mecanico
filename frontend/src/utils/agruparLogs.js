const detallesDe = (log) => {
  if (!log?.detalles) return null;
  if (typeof log.detalles === 'string') {
    try { return JSON.parse(log.detalles); } catch { return null; }
  }
  return log.detalles;
};

const segundo = (fecha) => {
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return '';
  return [
    valor.getFullYear(), valor.getMonth(), valor.getDate(),
    valor.getHours(), valor.getMinutes(), valor.getSeconds(),
  ].join('-');
};

const tituloSeccion = (accion = '') => {
  if (accion.includes('ESTADO')) return 'Estado';
  if (accion.includes('RESPONSABLE')) return 'Responsable';
  if (accion.includes('SUBTOTAL') || accion.includes('TOTAL')) return 'Totales';
  if (accion.includes('INSUMO')) return 'Insumos';
  if (accion.includes('MANO DE OBRA')) return 'Mano de obra';
  if (accion.includes('TRABAJO EXTERNO')) return 'Trabajos externos';
  if (accion.includes('FOTO')) return 'Foto';
  if (accion.includes('VEHICUL')) return 'Vehículo';
  if (accion.includes('CLIENTE')) return 'Cliente';
  if (accion.includes('TRABAJO')) return 'Trabajo';
  if (accion.includes('BORRADOR')) return 'Borrador';
  return 'Detalle';
};

const esDeOrden = (accion = '') => (
  accion.includes('INSUMO')
  || accion.includes('RESPONSABLE')
  || accion.includes('MANO DE OBRA')
  || accion.includes('TRABAJO EXTERNO')
  || accion.includes('SUBTOTAL')
  || accion.includes('TOTAL')
  || accion.includes('ESTADO')
);

const sintetizar = (logs) => {
  const primero = logs[0];
  const eventos = logs.map((log) => {
    const detalles = detallesDe(log) || {};
    return {
      accion: log.accion,
      modo: detalles.modo,
      resumen: detalles.resumen,
      filas: detalles.filas || [],
    };
  });
  const contexto = eventos.some((evento) => esDeOrden(evento.accion)) ? 'ORDEN' : 'BORRADOR';
  const secciones = [];
  const indice = new Map();
  eventos.forEach((evento) => {
    const titulo = tituloSeccion(evento.accion);
    if (!indice.has(titulo)) {
      const seccion = { titulo, items: [] };
      indice.set(titulo, seccion);
      secciones.push(seccion);
    }
    indice.get(titulo).items.push({
      modo: evento.modo,
      resumen: evento.resumen,
      filas: evento.filas,
    });
  });

  return {
    ...primero,
    accion: contexto === 'ORDEN' ? 'ORDEN EN TRABAJO' : 'BORRADOR',
    detalles: {
      tipo: 'GRUPO',
      contexto,
      resumen: primero.orden?.numeroOrden || detallesDe(primero)?.resumen || null,
      secciones,
    },
  };
};

/** Junta los logs sueltos del mismo segundo, la misma orden y el mismo usuario. */
export const agruparLogs = (logs = []) => {
  const salida = [];
  const grupos = new Map();

  logs.forEach((log) => {
    const detalles = detallesDe(log);
    const agrupable = detalles?.tipo === 'DETALLE' && log.ordenId;
    if (!agrupable) {
      salida.push(log);
      return;
    }
    const clave = `${log.usuarioId}|${log.ordenId}|${segundo(log.fecha)}`;
    const existente = grupos.get(clave);
    if (!existente) {
      const marca = { clave, logs: [log] };
      grupos.set(clave, marca);
      salida.push(marca);
      return;
    }
    existente.logs.push(log);
  });

  return salida.map((item) => {
    if (!item?.logs) return item;
    if (item.logs.length === 1) return item.logs[0];
    return sintetizar(item.logs);
  });
};
