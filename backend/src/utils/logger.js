import prisma from '../config/prisma.js';

const obtenerIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.ip ?? req.socket?.remoteAddress ?? null;
};

const normalizarItems = (lista = [], tipo) => {
  return lista.map(item => {
    if (tipo === 'materiales') {
      return {
        id:          item.materialId ?? item.id,
        descripcion: item.material?.descripcion ?? item.descripcion ?? 'Material',
        cantidad:    Number(item.cantidad  ?? 0),
        precio:      Number(item.precioAplicado ?? item.precioAlMomento ?? 0),
      };
    }
    if (tipo === 'servicios') {
      return {
        id:          item.servicioId ?? item.id,
        descripcion: item.descripcion ?? item.servicio?.descripcion ?? 'Servicio',
        monto:       Number(item.monto ?? 0),
      };
    }
    if (tipo === 'terceros') {
      return {
        id:          item.terceroId ?? item.id,
        descripcion: item.descripcion ?? item.tercero?.descripcion ?? 'Tercero',
        monto:       Number(item.monto ?? 0),
      };
    }
    return item;
  });
};

const compararListas = (anteriores = [], nuevos = [], tipo) => {
  const normAntes  = normalizarItems(anteriores, tipo);
  const normNuevos = normalizarItems(nuevos, tipo);
  const diffs = [];

  normNuevos.forEach(nuevo => {
    const anterior = normAntes.find(a => a.id === nuevo.id);
    if (!anterior) {
      diffs.push({ accion: 'AÑADIDO', descripcion: nuevo.descripcion, datos: nuevo });
      return;
    }
    const camposDistintos = Object.keys(nuevo).filter(key => {
      if (key === 'id' || key === 'descripcion') return false;
      return String(anterior[key] ?? '') !== String(nuevo[key] ?? '');
    });
    if (camposDistintos.length > 0) {
      const cambio = { accion: 'MODIFICADO', descripcion: nuevo.descripcion };
      camposDistintos.forEach(key => {
        cambio[key] = { de: anterior[key], a: nuevo[key] };
      });
      diffs.push(cambio);
    }
  });

  normAntes.forEach(anterior => {
    if (!normNuevos.some(n => n.id === anterior.id)) {
      diffs.push({ accion: 'ELIMINADO', descripcion: anterior.descripcion });
    }
  });

  return diffs.length > 0 ? diffs : null;
};

const compararCampos = (anteriores, nuevos, camposIgnorados = []) => {
  const IGNORAR_SIEMPRE = [
    'password', 'actualizadoAt', 'creadoAt', 'fechaCreacion',
    'creadorId', 'responsableId', 'estaCerrada', 'numeroOrden', 'id',
    '_nombreItem', // ← ignorar en comparación, se extrae por separado
  ];
  const ignorar = new Set([...IGNORAR_SIEMPRE, ...camposIgnorados]);
  const cambios = {};

  Object.keys(nuevos).forEach(key => {
    if (ignorar.has(key)) return;
    const valAnterior = anteriores[key] ?? null;
    const valNuevo    = nuevos[key]    ?? null;
    const strAnterior = valAnterior !== null ? String(valAnterior) : null;
    const strNuevo    = valNuevo    !== null ? String(valNuevo)    : null;
    if (strAnterior !== strNuevo) {
      cambios[key] = { de: valAnterior, a: valNuevo };
    }
  });

  return Object.keys(cambios).length > 0 ? cambios : null;
};

export const registrarLog = async (
  req,
  accion,
  nuevos     = null,
  anteriores = null,
  ordenId    = null
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return;

    req.logManualRealizado = true;

    let detallesFinales = null;

    // ── CASO 1: CREACIÓN ──────────────────────────────────────────────────────
    if (nuevos && !anteriores) {
      detallesFinales = {
        tipo:  'CREACION',
        datos: nuevos,
      };
    }

    // ── CASO 2: ELIMINACIÓN ───────────────────────────────────────────────────
    else if (anteriores && !nuevos) {
      detallesFinales = {
        tipo:           'ELIMINACION',
        datos_borrados: anteriores,
      };
    }

    // ── CASO 3: EDICIÓN ───────────────────────────────────────────────────────
    else if (anteriores && nuevos) {
      const cambios = {};

      // ← Extraer _nombreItem antes de comparar para no contaminarlo
      const nombreItem = nuevos._nombreItem ?? null;

      if (accion.includes('ORDEN')) {
        const camposCabecera = compararCampos(
          anteriores,
          nuevos,
          ['materiales', 'servicios', 'terceros']
        );
        if (camposCabecera) cambios.cabecera = camposCabecera;

        const diffMateriales = compararListas(anteriores.materiales, nuevos.materiales, 'materiales');
        const diffServicios  = compararListas(anteriores.servicios,  nuevos.servicios,  'servicios');
        const diffTerceros   = compararListas(anteriores.terceros,   nuevos.terceros,   'terceros');

        if (diffMateriales) cambios.materiales = diffMateriales;
        if (diffServicios)  cambios.servicios  = diffServicios;
        if (diffTerceros)   cambios.terceros   = diffTerceros;
      } else {
        const camposSimples = compararCampos(anteriores, nuevos);
        if (camposSimples) Object.assign(cambios, camposSimples);
      }

      if (Object.keys(cambios).length === 0) return;

      detallesFinales = {
        tipo:      'EDICION',
        nombreItem, // ← guardado en el JSON, visible para el frontend
        cambios,
      };
    }

    // ── INSERTAR EN BD ────────────────────────────────────────────────────────
    await prisma.logActividad.create({
      data: {
        usuarioId: userId,
        accion,
        detalles:  detallesFinales ?? undefined,
        ordenId:   ordenId ? parseInt(ordenId) : null,
        ipCliente: obtenerIp(req),
        userAgent: req.headers['user-agent'] ?? null,
      },
    });

  } catch (error) {
    console.error('❌ Error en auditoría:', error.message);
  }
};