const ORDEN = ['creado', 'modificado', 'eliminado'];

export const MOVIMIENTO = {
  creado: {
    label: 'Creado',
    tono: 'border-green-500/40 bg-green-500/15 text-green-300',
  },
  modificado: {
    label: 'Modificado',
    tono: 'border-amber-500/40 bg-amber-500/15 text-amber-200',
  },
  eliminado: {
    label: 'Eliminado',
    tono: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
  },
};

/** Clasifica una acción o un modo interno en creado, modificado o eliminado. */
export const claveMovimiento = (accion = '', modo) => {
  const modoTexto = String(modo || '').toLowerCase();
  if (modoTexto === 'borrado' || modoTexto === 'eliminado') return 'eliminado';
  if (modoTexto === 'nuevo' || modoTexto === 'creado' || modoTexto === 'añadido' || modoTexto === 'anadido') return 'creado';
  if (modoTexto === 'cambio' || modoTexto === 'modificado') return 'modificado';

  const texto = String(accion || '').toUpperCase();
  if (/(ELIMIN|QUITAR|BORRAD)/.test(texto)) return 'eliminado';
  if (/(CREAR|NUEVO|REGISTRAR|AÑADID|ANADID|SUBIR)/.test(texto)) return 'creado';
  return 'modificado';
};

const detallesDe = (detalles) => {
  if (!detalles) return null;
  if (typeof detalles === 'string') {
    try { return JSON.parse(detalles); } catch { return null; }
  }
  return detalles;
};

/** Una o más marcas, en el orden creado → modificado → eliminado. */
export const movimientosDeLog = (log) => {
  const detalles = detallesDe(log?.detalles);
  const claves = new Set();

  if (detalles?.tipo === 'GRUPO') {
    for (const seccion of detalles.secciones || []) {
      for (const item of seccion.items || []) claves.add(claveMovimiento('', item.modo));
    }
  } else if (detalles?.tipo === 'FOTO') {
    if (detalles.operacion === 'QUITAR') claves.add('eliminado');
    else if (detalles.operacion === 'REEMPLAZAR') claves.add('modificado');
    else claves.add('creado');
  } else if (detalles?.tipo === 'CREACION') claves.add('creado');
  else if (detalles?.tipo === 'ELIMINACION') claves.add('eliminado');
  else if (detalles?.tipo === 'EDICION') claves.add('modificado');
  else if (detalles?.modo) claves.add(claveMovimiento(log?.accion, detalles.modo));
  else claves.add(claveMovimiento(log?.accion));

  return ORDEN.filter((clave) => claves.has(clave));
};
