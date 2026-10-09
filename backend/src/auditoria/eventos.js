/**
 * Arma los cambios del borrador y de la orden en trabajo.
 * Si no hubo cambio real, la lista vuelve vacía y no se guarda nada.
 */

const texto = (valor) => {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
};

export const filasPresentes = (pares) => pares
  .map(([etiqueta, valor]) => {
    const limpio = texto(valor);
    if (!limpio) return null;
    return { etiqueta, valor: limpio };
  })
  .filter(Boolean);

export const cambiosDe = (pares) => pares
  .map(([etiqueta, antes, despues]) => {
    const de = texto(antes);
    const a = texto(despues);
    if (de === a) return null;
    return { etiqueta, de: de || '—', a: a || '—' };
  })
  .filter(Boolean);

export const eventoNuevo = (accion, resumen, filas) => (
  filas?.length ? { accion, modo: 'nuevo', resumen, filas } : null
);

export const eventoCambio = (accion, resumen, filas) => (
  filas?.length ? { accion, modo: 'cambio', resumen, filas } : null
);

export const eventoBorrado = (accion, resumen, filas) => (
  filas?.length ? { accion, modo: 'borrado', resumen, filas } : null
);

const etiquetaTipoCliente = (tipo) => (
  tipo === 'EMPRESA' ? 'Empresa' : tipo === 'PERSONA' ? 'Persona' : texto(tipo)
);

const etiquetaIngreso = (estado) => (
  estado === 'OBSERVADO' ? 'Observado' : estado === 'ACEPTADO' ? 'Aceptado' : texto(estado)
);

export const vistaVehiculo = (vehiculo) => ({
  placa: vehiculo?.placa || '',
  marca: vehiculo?.marca?.nombre || '',
  modelo: vehiculo?.modelo || '',
  horometro: vehiculo?.horometro ?? '',
  kilometraje: vehiculo?.kilometraje ?? '',
});

export const vistaCliente = (cliente) => ({
  tipo: etiquetaTipoCliente(cliente?.tipoCliente),
  documento: [cliente?.tipoDocumento, cliente?.numeroDocumento].filter(Boolean).join(' '),
  nombre: cliente?.nombreRazonSocial || '',
  representante: cliente?.representante || '',
  celular: cliente?.celular || '',
  correo: cliente?.correo || '',
});

const filasVehiculo = (vehiculo) => filasPresentes([
  ['Placa', vehiculo.placa],
  ['Marca', vehiculo.marca],
  ['Modelo', vehiculo.modelo],
  ['Horómetro', vehiculo.horometro],
  ['Kilometraje', vehiculo.kilometraje],
]);

const cambiosVehiculo = (antes, despues) => cambiosDe([
  ['Placa', antes.placa, despues.placa],
  ['Marca', antes.marca, despues.marca],
  ['Modelo', antes.modelo, despues.modelo],
  ['Horómetro', antes.horometro, despues.horometro],
  ['Kilometraje', antes.kilometraje, despues.kilometraje],
]);

const filasCliente = (cliente) => filasPresentes([
  ['Tipo', cliente.tipo],
  ['Documento', cliente.documento],
  ['Nombre', cliente.nombre],
  ['Representante', cliente.representante],
  ['Celular', cliente.celular],
  ['Correo', cliente.correo],
]);

const cambiosCliente = (antes, despues) => cambiosDe([
  ['Tipo', antes.tipo, despues.tipo],
  ['Documento', antes.documento, despues.documento],
  ['Nombre', antes.nombre, despues.nombre],
  ['Representante', antes.representante, despues.representante],
  ['Celular', antes.celular, despues.celular],
  ['Correo', antes.correo, despues.correo],
]);

/** Fichas listas para el log de Registros: marca, cliente y vehículo. */
export const filasDeVehiculo = (vehiculo) => filasVehiculo(vistaVehiculo(vehiculo));
export const cambiosDeVehiculo = (antes, despues) => cambiosVehiculo(vistaVehiculo(antes), vistaVehiculo(despues));
export const filasDeCliente = (cliente) => filasCliente(vistaCliente(cliente));
export const cambiosDeCliente = (antes, despues) => cambiosCliente(vistaCliente(antes), vistaCliente(despues));

/** Paso 1. Puede salir CREAR/EDITAR VEHÍCULO y, aparte, CREAR o CAMBIAR el borrador. */
export const eventosPasoVehiculo = ({ ordenPrevia, orden, vehiculo, eraNuevo, seActualizo, anterior }) => {
  const eventos = [];
  const actual = vistaVehiculo(vehiculo);

  if (eraNuevo) {
    eventos.push(eventoNuevo('CREAR VEHÍCULO', actual.placa, filasVehiculo(actual)));
  } else if (seActualizo && anterior) {
    eventos.push(eventoCambio(
      'EDITAR VEHÍCULO',
      actual.placa,
      cambiosVehiculo(vistaVehiculo(anterior), actual)
    ));
  }

  if (!ordenPrevia) {
    eventos.push(eventoNuevo('CREAR BORRADOR', orden.numeroOrden, filasPresentes([
      ['Orden', orden.numeroOrden],
      ['Placa', actual.placa],
      ['Marca', actual.marca],
      ['Modelo', actual.modelo],
      ['Horómetro', actual.horometro],
      ['Kilometraje', actual.kilometraje],
    ])));
  } else if (ordenPrevia.placa !== orden.placa) {
    const previo = vistaVehiculo(ordenPrevia.vehiculo || { placa: ordenPrevia.placa });
    eventos.push(eventoCambio(
      'CAMBIAR VEHÍCULO DEL BORRADOR',
      orden.numeroOrden,
      cambiosVehiculo(previo, actual)
    ));
  }

  return eventos.filter(Boolean);
};

/** Paso 2. El alta o la edición del cliente va en un log; el vínculo con la orden, en otro. */
export const eventosPasoCliente = ({ ordenPrevia, orden, cliente, eraNuevo, seActualizo, anterior }) => {
  const eventos = [];
  const actual = vistaCliente(cliente);

  if (eraNuevo) {
    eventos.push(eventoNuevo('CREAR CLIENTE', actual.nombre, filasCliente(actual)));
  } else if (seActualizo && anterior) {
    eventos.push(eventoCambio(
      'EDITAR CLIENTE',
      actual.nombre,
      cambiosCliente(vistaCliente(anterior), actual)
    ));
  }

  if (ordenPrevia.clienteId !== cliente.id) {
    const previo = ordenPrevia.cliente ? vistaCliente(ordenPrevia.cliente) : null;
    eventos.push(previo
      ? eventoCambio('ASOCIAR CLIENTE AL BORRADOR', orden.numeroOrden, cambiosDe([
        ['Cliente', previo.nombre, actual.nombre],
        ['Documento', previo.documento, actual.documento],
      ]))
      : eventoNuevo('ASOCIAR CLIENTE AL BORRADOR', orden.numeroOrden, filasPresentes([
        ['Orden', orden.numeroOrden],
        ['Cliente', actual.nombre],
        ['Documento', actual.documento],
      ])));
  }

  return eventos.filter(Boolean);
};

/** Paso 3. La primera vez muestra lo registrado; un guardado posterior, solo lo que cambió. */
export const eventosTrabajoBorrador = ({ ordenPrevia, orden, data }) => {
  const descripcion = data.descripcionInformal?.trim() || null;
  const trabajo = data.trabajoSolicitado?.trim() || null;
  const ingreso = data.estadoIngreso || 'ACEPTADO';
  const observacion = data.observacionIngreso?.trim() || null;
  const campos = [
    ['Lo que indicó el cliente', ordenPrevia.descripcionInformal, descripcion],
    ['Trabajo solicitado', ordenPrevia.trabajoSolicitado, trabajo],
    ['Estado de ingreso', etiquetaIngreso(ordenPrevia.estadoIngreso), etiquetaIngreso(ingreso)],
    ['Observación de ingreso', ordenPrevia.observacionIngreso, observacion],
  ];

  if (ordenPrevia.pasoRecepcion != null) {
    return [eventoNuevo(
      'REGISTRAR TRABAJO DEL BORRADOR',
      orden.numeroOrden,
      filasPresentes(campos.map(([etiqueta, , despues]) => [etiqueta, despues]))
    )].filter(Boolean);
  }

  return [eventoCambio('EDITAR TRABAJO DEL BORRADOR', orden.numeroOrden, cambiosDe(campos))].filter(Boolean);
};

/** Borrar un borrador: la orden en un log y, si se limpiaron, el vehículo y el cliente en otros. */
export const eventosEliminarBorrador = ({ orden, eliminoVehiculo, eliminoCliente }) => {
  const eventos = [
    eventoBorrado('ELIMINAR BORRADOR', orden.numeroOrden, filasPresentes([
      ['Orden', orden.numeroOrden],
      ['Placa', orden.placa],
      ['Cliente', orden.cliente?.nombreRazonSocial],
      ['Estado', orden.estado],
    ])),
  ];

  if (eliminoVehiculo) {
    eventos.push(eventoBorrado(
      'ELIMINAR VEHÍCULO',
      orden.placa,
      filasVehiculo(vistaVehiculo(orden.vehiculo || { placa: orden.placa }))
    ));
  }

  if (eliminoCliente && orden.cliente) {
    eventos.push(eventoBorrado(
      'ELIMINAR CLIENTE',
      orden.cliente.nombreRazonSocial,
      filasCliente(vistaCliente(orden.cliente))
    ));
  }

  return eventos.filter(Boolean);
};

const ESTADOS_ORDEN = {
  EN_ESPERA: 'En Espera',
  ACEPTADO: 'Aceptado',
  EN_REPARACION: 'En Reparación',
  CAMBIO_ACEITE: 'Cambio de Aceite',
  ESPERANDO_REPUESTO: 'Esperando Repuesto',
  TERMINADO: 'Terminado',
  CANCELADO: 'Cancelado',
};

const etiquetaEstado = (estado) => ESTADOS_ORDEN[estado] || texto(estado);

const centimos = (valor) => Math.round(Number(valor || 0) * 100);

const dinero = (valor) => `S/ ${(centimos(valor) / 100).toFixed(2)}`;

const cantidadTexto = (valor) => {
  const numero = Number(valor || 0);
  if (!Number.isFinite(numero)) return '';
  return String(Math.round(numero * 1000) / 1000);
};

const lineasInsumo = (orden) => (orden.materiales || []).map((linea) => {
  const cantidad = Number(linea.cantidad || 0);
  const precio = Number(linea.precioAplicado || 0);
  return {
    id: linea.materialId,
    nombre: linea.material?.descripcion || 'Insumo',
    cantidad,
    precio,
    subtotal: centimos(cantidad * precio) / 100,
  };
});

const lineasMonto = (lista, idKey, nombreDe) => (lista || []).map((linea) => ({
  id: linea[idKey],
  nombre: nombreDe(linea),
  monto: Number(linea.monto || 0),
}));

const sumaInsumos = (lineas) => lineas.reduce((acc, linea) => acc + centimos(linea.subtotal), 0) / 100;
const sumaMontos = (lineas) => lineas.reduce((acc, linea) => acc + centimos(linea.monto), 0) / 100;

const eventosInsumos = (antes, despues) => {
  const previos = new Map(antes.map((linea) => [linea.id, linea]));
  const actuales = new Map(despues.map((linea) => [linea.id, linea]));
  const eventos = [];

  despues.forEach((linea) => {
    const previa = previos.get(linea.id);
    if (!previa) {
      eventos.push(eventoNuevo('AÑADIR INSUMO', linea.nombre, filasPresentes([
        ['Insumo', linea.nombre],
        ['Cantidad', cantidadTexto(linea.cantidad)],
        ['Precio unitario', dinero(linea.precio)],
        ['Subtotal', dinero(linea.subtotal)],
      ])));
      return;
    }
    eventos.push(eventoCambio('MODIFICAR INSUMO', linea.nombre, cambiosDe([
      ['Cantidad', cantidadTexto(previa.cantidad), cantidadTexto(linea.cantidad)],
      ['Precio unitario', dinero(previa.precio), dinero(linea.precio)],
      ['Subtotal', dinero(previa.subtotal), dinero(linea.subtotal)],
    ])));
  });

  antes.forEach((linea) => {
    if (actuales.has(linea.id)) return;
    eventos.push(eventoBorrado('QUITAR INSUMO', linea.nombre, filasPresentes([
      ['Insumo', linea.nombre],
      ['Cantidad', cantidadTexto(linea.cantidad)],
      ['Precio unitario', dinero(linea.precio)],
      ['Subtotal', dinero(linea.subtotal)],
    ])));
  });

  return eventos.filter(Boolean);
};

const eventosMontos = (antes, despues, etiquetas) => {
  const previos = new Map(antes.map((linea) => [linea.id, linea]));
  const actuales = new Map(despues.map((linea) => [linea.id, linea]));
  const eventos = [];

  despues.forEach((linea) => {
    const previa = previos.get(linea.id);
    if (!previa) {
      eventos.push(eventoNuevo(etiquetas.nuevo, linea.nombre, filasPresentes([
        [etiquetas.campo, linea.nombre],
        ['Monto', dinero(linea.monto)],
      ])));
      return;
    }
    eventos.push(eventoCambio(etiquetas.cambio, linea.nombre, cambiosDe([
      ['Monto', dinero(previa.monto), dinero(linea.monto)],
    ])));
  });

  antes.forEach((linea) => {
    if (actuales.has(linea.id)) return;
    eventos.push(eventoBorrado(etiquetas.borrado, linea.nombre, filasPresentes([
      [etiquetas.campo, linea.nombre],
      ['Monto', dinero(linea.monto)],
    ])));
  });

  return eventos.filter(Boolean);
};

const eventoSubtotal = (accion, resumen, antes, despues) => {
  if (centimos(antes) === centimos(despues)) return null;
  return eventoCambio(accion, resumen, cambiosDe([
    ['Subtotal', dinero(antes), dinero(despues)],
  ]));
};

const eventoResponsable = (antes, despues) => {
  const idAntes = antes.responsableId ? String(antes.responsableId) : '';
  const idDespues = despues.responsableId ? String(despues.responsableId) : '';
  if (idAntes === idDespues) return null;

  const nombreAntes = antes.responsable?.nombreCompleto || '';
  const nombreDespues = despues.responsable?.nombreCompleto || '';

  if (!idAntes) {
    return eventoNuevo('ASIGNAR RESPONSABLE', nombreDespues, filasPresentes([
      ['Responsable', nombreDespues],
    ]));
  }
  if (!idDespues) {
    return eventoBorrado('QUITAR RESPONSABLE', nombreAntes, filasPresentes([
      ['Responsable', nombreAntes],
    ]));
  }
  return eventoCambio('CAMBIAR RESPONSABLE', nombreDespues, cambiosDe([
    ['Responsable', nombreAntes, nombreDespues],
  ]));
};

export const eventoEstado = (antes, despues) => {
  if (!antes || antes === despues) return null;
  return eventoCambio('CAMBIAR ESTADO', etiquetaEstado(despues), [{
    etiqueta: 'Estado',
    de: etiquetaEstado(antes) || '—',
    a: etiquetaEstado(despues) || '—',
  }]);
};

/**
 * Cambios del taller: responsable, cada insumo, mano de obra, trabajos externos,
 * el subtotal de cada parte, el total y el estado. Un log por cada cosa distinta.
 */
export const eventosActualizarTaller = ({ antes, despues }) => {
  const insumosAntes = lineasInsumo(antes);
  const insumosDespues = lineasInsumo(despues);
  const manoAntes = lineasMonto(antes.servicios, 'servicioId', (linea) => (
    linea.descripcion || linea.servicio?.descripcion || 'Mano de obra'
  ));
  const manoDespues = lineasMonto(despues.servicios, 'servicioId', (linea) => (
    linea.descripcion || linea.servicio?.descripcion || 'Mano de obra'
  ));
  const externosAntes = lineasMonto(antes.terceros, 'terceroId', (linea) => (
    linea.descripcion || linea.tercero?.descripcion || 'Trabajo externo'
  ));
  const externosDespues = lineasMonto(despues.terceros, 'terceroId', (linea) => (
    linea.descripcion || linea.tercero?.descripcion || 'Trabajo externo'
  ));

  const subtotalInsumosAntes = sumaInsumos(insumosAntes);
  const subtotalInsumosDespues = sumaInsumos(insumosDespues);
  const subtotalManoAntes = sumaMontos(manoAntes);
  const subtotalManoDespues = sumaMontos(manoDespues);
  const subtotalExternosAntes = sumaMontos(externosAntes);
  const subtotalExternosDespues = sumaMontos(externosDespues);

  return [
    eventoEstado(antes.estado, despues.estado),
    eventoResponsable(antes, despues),
    ...eventosInsumos(insumosAntes, insumosDespues),
    ...eventosMontos(manoAntes, manoDespues, {
      nuevo: 'AÑADIR MANO DE OBRA',
      cambio: 'MODIFICAR MANO DE OBRA',
      borrado: 'QUITAR MANO DE OBRA',
      campo: 'Trabajo',
    }),
    ...eventosMontos(externosAntes, externosDespues, {
      nuevo: 'AÑADIR TRABAJO EXTERNO',
      cambio: 'MODIFICAR TRABAJO EXTERNO',
      borrado: 'QUITAR TRABAJO EXTERNO',
      campo: 'Trabajo',
    }),
    eventoSubtotal('SUBTOTAL INSUMOS', dinero(subtotalInsumosDespues), subtotalInsumosAntes, subtotalInsumosDespues),
    eventoSubtotal('SUBTOTAL MANO DE OBRA', dinero(subtotalManoDespues), subtotalManoAntes, subtotalManoDespues),
    eventoSubtotal('SUBTOTAL TRABAJOS EXTERNOS', dinero(subtotalExternosDespues), subtotalExternosAntes, subtotalExternosDespues),
    centimos(antes.totalFinal) === centimos(despues.totalFinal)
      ? null
      : eventoCambio('TOTAL DE LA ORDEN', dinero(despues.totalFinal), cambiosDe([
        ['Total', dinero(antes.totalFinal), dinero(despues.totalFinal)],
      ])),
  ].filter(Boolean);
};

const tituloSeccion = (accion = '') => {
  if (accion.includes('ESTADO')) return 'Estado';
  if (accion.includes('RESPONSABLE')) return 'Responsable';
  if (accion.includes('SUBTOTAL') || accion.includes('TOTAL')) return 'Totales';
  if (accion.includes('INSUMO')) return 'Insumos';
  if (accion.includes('MANO DE OBRA')) return 'Mano de obra';
  if (accion.includes('TRABAJO EXTERNO')) return 'Trabajos externos';
  if (accion.includes('VEHICUL')) return 'Vehículo';
  if (accion.includes('CLIENTE')) return 'Cliente';
  if (accion.includes('TRABAJO')) return 'Trabajo';
  if (accion.includes('BORRADOR')) return 'Borrador';
  if (accion.includes('FOTO')) return 'Foto';
  return 'Detalle';
};

/** Varios cambios de un mismo guardado, listos para un solo log con secciones. */
export const grupoDeEventos = (eventos = [], { contexto, resumen } = {}) => {
  const secciones = [];
  const indice = new Map();

  eventos.filter(Boolean).forEach((evento) => {
    const titulo = tituloSeccion(evento.accion);
    if (!indice.has(titulo)) {
      const seccion = { titulo, items: [] };
      indice.set(titulo, seccion);
      secciones.push(seccion);
    }
    indice.get(titulo).items.push({
      modo: evento.modo,
      resumen: evento.resumen || null,
      filas: evento.filas || [],
    });
  });

  return {
    accion: contexto === 'ORDEN' ? 'ORDEN EN TRABAJO' : 'BORRADOR',
    contexto: contexto === 'ORDEN' ? 'ORDEN' : 'BORRADOR',
    resumen: resumen || null,
    secciones,
  };
};
