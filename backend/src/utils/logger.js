import prisma from '../config/prisma.js';

/**
 * Extrae la IP real del cliente considerando proxies.
 */
const obtenerIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.ip ?? req.socket?.remoteAddress ?? null;
};

/**
 * Normaliza los items de una lista de la OT a un formato
 * uniforme para poder comparar correctamente anterior vs nuevo.
 * Resuelve el problema de precioAlMomento (frontend) vs precioAplicado (DB).
 */
const normalizarItems = (lista = [], tipo) => {
  return lista.map(item => {
    if (tipo === 'materiales') {
      return {
        id: item.materialId ?? item.id,
        descripcion: item.material?.descripcion ?? item.descripcion ?? 'Material',
        cantidad: Number(item.cantidad ?? 0),
        precio: Number(item.precioAplicado ?? item.precioAlMomento ?? 0),
      };
    }
    if (tipo === 'servicios') {
      return {
        id: item.servicioId ?? item.id,
        descripcion: item.descripcion ?? item.servicio?.descripcion ?? 'Servicio',
        monto: Number(item.monto ?? 0),
      };
    }
    if (tipo === 'terceros') {
      return {
        id: item.terceroId ?? item.id,
        descripcion: item.descripcion ?? item.tercero?.descripcion ?? 'Tercero',
        monto: Number(item.monto ?? 0),
      };
    }
    return item;
  });
};


/**
 * Compara dos listas normalizadas y devuelve solo las diferencias.
 * Retorna null si no hubo ningún cambio.
 */
const compararListas = (anteriores = [], nuevos = [], tipo) => {
  const normAntes = normalizarItems(anteriores, tipo);
  const normNuevos = normalizarItems(nuevos, tipo);
  const diffs = [];

  // Items añadidos o modificados
  normNuevos.forEach(nuevo => {
    const anterior = normAntes.find(a => a.id === nuevo.id);

    if (!anterior) {
      diffs.push({ accion: 'AÑADIDO', descripcion: nuevo.descripcion, datos: nuevo });
      return;
    }

    // Comparar campos según tipo
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

  // Items eliminados
  normAntes.forEach(anterior => {
    if (!normNuevos.some(n => n.id === anterior.id)) {
      diffs.push({ accion: 'ELIMINADO', descripcion: anterior.descripcion });
    }
  });

  return diffs.length > 0 ? diffs : null;
};

/**
 * Limpia un snapshot de OrdenTrabajo eliminando los campos relacionales
 * que Prisma incluye con los `include` — solo dejamos los escalares
 * comparables contra el body del frontend.
 */
const limpiarSnapshotOrden = (orden) => {
  if (!orden) return orden;
  const {
    // Extraemos las relaciones para descartarlas
    creador, responsable, vehiculo,
    // Guardamos todo lo demás
    ...campos
  } = orden;
  // Devolvemos solo los escalares más los arrays de listas
  return {
    ...campos,
    responsable: responsable?.nombreCompleto ?? null,
    materiales: orden.materiales,
    servicios: orden.servicios,
    terceros: orden.terceros,
  };
};

/**
 * Compara campos simples de cabecera entre dos objetos.
 * Retorna solo los campos que cambiaron, o null si no cambió nada.
 */
const compararCampos = (anteriores, nuevos, camposIgnorados = []) => {
  const IGNORAR_SIEMPRE = ['password', 'actualizadoAt', 'creadoAt', 'fechaCreacion', 'creadorId', 'responsableId', 'estaCerrada', 'numeroOrden', 'id'];
  const ignorar = new Set([...IGNORAR_SIEMPRE, ...camposIgnorados]);
  const cambios = {};

  Object.keys(nuevos).forEach(key => {
    if (ignorar.has(key)) return;

    const valAnterior = anteriores[key] ?? null;
    const valNuevo = nuevos[key] ?? null;

    // Normalizar a string para comparar de forma segura (evita null vs "null")
    const strAnterior = valAnterior !== null ? String(valAnterior) : null;
    const strNuevo = valNuevo !== null ? String(valNuevo) : null;

    if (strAnterior !== strNuevo) {
      cambios[key] = { de: valAnterior, a: valNuevo };
    }
  });

  return Object.keys(cambios).length > 0 ? cambios : null;
};

/**
 * Registra actividad en la base de datos.
 *
 * @param {Object}  req        - Request de Express (para usuario, IP y userAgent).
 * @param {String}  accion     - Título de la acción. Ej: 'CREAR ORDEN'.
 * @param {Object}  nuevos     - Datos nuevos (snapshot en creación, body en edición).
 * @param {Object}  anteriores - Datos previos de la DB (solo en edición/eliminación).
 * @param {Number}  ordenId    - ID de la orden si aplica.
 */
export const registrarLog = async (
  req,
  accion,
  nuevos = null,
  anteriores = null,
  ordenId = null
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return;

    // Marca para que audit.js no duplique este log
    req.logManualRealizado = true;

    let detallesFinales = null;

    // ── CASO 1: CREACIÓN ──────────────────────────────────────────────────────
    if (nuevos && !anteriores) {
      detallesFinales = {
        tipo: 'CREACION',
        datos: nuevos,
      };
    }

    // ── CASO 2: ELIMINACIÓN ───────────────────────────────────────────────────
    else if (anteriores && !nuevos) {
      detallesFinales = {
        tipo: 'ELIMINACION',
        datos_borrados: anteriores,
      };
    }

    // ── CASO 3: EDICIÓN ───────────────────────────────────────────────────────
    else if (anteriores && nuevos) {
      const cambios = {};

      if (accion.includes('ORDEN')) {
        // ← Ya no llamamos a limpiarSnapshotOrden porque el controller
        //   manda anteriorNormalizado y nuevoNormalizado ya limpios
        const camposCabecera = compararCampos(
          anteriores,  // ← directo, sin limpiar
          nuevos,
          ['materiales', 'servicios', 'terceros']
        );
        if (camposCabecera) cambios.cabecera = camposCabecera;

        const diffMateriales = compararListas(anteriores.materiales, nuevos.materiales, 'materiales');
        const diffServicios = compararListas(anteriores.servicios, nuevos.servicios, 'servicios');
        const diffTerceros = compararListas(anteriores.terceros, nuevos.terceros, 'terceros');

        if (diffMateriales) cambios.materiales = diffMateriales;
        if (diffServicios) cambios.servicios = diffServicios;
        if (diffTerceros) cambios.terceros = diffTerceros;
      } else {
        const camposSimples = compararCampos(anteriores, nuevos);
        if (camposSimples) Object.assign(cambios, camposSimples);
      }

      if (Object.keys(cambios).length === 0) return;
      detallesFinales = { tipo: 'EDICION', cambios };
    }

    // ── INSERTAR EN BD ────────────────────────────────────────────────────────
    await prisma.logActividad.create({
      data: {
        usuarioId: userId,
        accion,
        detalles: detallesFinales ?? undefined,  // Json? acepta objeto directo
        ordenId: ordenId ? parseInt(ordenId) : null,
        ipCliente: obtenerIp(req),
        userAgent: req.headers['user-agent'] ?? null,
      },
    });

  } catch (error) {
    // El log nunca debe romper el flujo principal
    console.error('❌ Error en auditoría:', error.message);
  }
};