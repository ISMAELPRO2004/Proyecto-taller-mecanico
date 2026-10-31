import { computed } from 'vue';
import { campoLabel, etiquetaOperacionFoto, formatVal, rolLabel } from './formatoLog.js';
import { useFotosLog } from './useFotosLog.js';

/** Datos ya armados para el modal de un log. La vista solo elige qué bloque mostrar. */
export function useDetalleLog(props) {
  const data = computed(() => {
    if (!props.log?.detalles) return null;
    try {
      return typeof props.log.detalles === 'string'
        ? JSON.parse(props.log.detalles)
        : props.log.detalles;
    } catch { return null; }
  });

  const { vistaAnterior, vistaNueva, vistaAmpliada, cargandoFotos } = useFotosLog(props, data);

  const tipoAccion = computed(() => {
    const a = props.log?.accion || '';
    if (a.includes('FOTO')) return 'foto';
    if (a.includes('MARCA')) return 'marca';
    if (a.includes('CLIENTE')) return 'cliente';
    if (a.includes('VEHICUL')) return 'vehiculo';
    if (a.includes('MATERIAL')) return 'material';
    if (a.includes('SERVICIO')) return 'servicio';
    if (a.includes('TERCERO')) return 'tercero';
    if (a.includes('ORDEN')) return 'orden';
    if (a.includes('USUARIO')) return 'usuario';
    return 'otro';
  });

  const labelTipo = computed(() => ({
    material: 'Material', servicio: 'Servicio', tercero: 'Tercero',
    orden: 'Orden', usuario: 'Usuario', foto: 'Foto',
    marca: 'Marca', cliente: 'Cliente', vehiculo: 'Vehículo', otro: 'Registro',
  })[tipoAccion.value]);

  const tituloItem = computed(() => {
    if (!data.value) return null;
    const d = data.value;

    if (d.tipo === 'GRUPO' && d.resumen) return d.resumen;
    if (d.tipo === 'DETALLE' && d.resumen) return d.resumen;
    if (d.tipo === 'FOTO' && d.imagen) return d.imagen;
    if (d.tipo === 'EDICION' && d.nombreItem) return d.nombreItem;
    if (d.tipo === 'CREACION' && props.log?.orden?.numeroOrden) return props.log.orden.numeroOrden;
    if (d.tipo === 'CREACION' && (d.datos?.nombre || d.datos?.nombreRazonSocial || d.datos?.placa)) {
      return d.datos.nombre || d.datos.nombreRazonSocial || d.datos.placa;
    }
    if (d.tipo === 'CREACION' && d.datos?.descripcion) return d.datos.descripcion;
    if (d.tipo === 'CREACION' && d.datos?.nombreCompleto) return d.datos.nombreCompleto;
    if (d.tipo === 'ELIMINACION' && (d.datos_borrados?.nombre || d.datos_borrados?.nombreRazonSocial || d.datos_borrados?.placa)) {
      return d.datos_borrados.nombre || d.datos_borrados.nombreRazonSocial || d.datos_borrados.placa;
    }
    if (d.tipo === 'ELIMINACION' && d.datos_borrados?.descripcion) return d.datos_borrados.descripcion;
    if (d.tipo === 'ELIMINACION' && d.datos_borrados?.clienteNombre) return `Orden de ${d.datos_borrados.clienteNombre}`;
    return null;
  });

  const CAMPOS_CATALOGO = ['descripcion', 'precioBase', 'actualizadoAt'];
  const CAMPOS_ORDEN = ['clienteNombre', 'clienteCelular', 'trabajoSolicitado',
    'placa', 'marca', 'modelo', 'horometro', 'kilometraje', 'estado', 'responsable'];
  const CAMPOS_USUARIO = ['nombreCompleto', 'username', 'rol'];
  const CAMPOS_MARCA = ['nombre'];
  const CAMPOS_CLIENTE = ['tipoCliente', 'tipoDocumento', 'numeroDocumento', 'nombreRazonSocial', 'representante', 'celular', 'correo'];
  const CAMPOS_VEHICULO = ['placa', 'marca', 'modelo', 'horometro', 'kilometraje'];

  const camposSegunTipo = (tipo) => ({
    orden: CAMPOS_ORDEN,
    usuario: CAMPOS_USUARIO,
    marca: CAMPOS_MARCA,
    cliente: CAMPOS_CLIENTE,
    vehiculo: CAMPOS_VEHICULO,
  }[tipo] || CAMPOS_CATALOGO);

  const filasDe = (datos, tipo, etiquetaFecha) => {
    const lista = camposSegunTipo(tipo);
    return lista
      .filter((k) => datos[k] !== undefined && datos[k] !== null && datos[k] !== '')
      .map((k) => {
        let label = campoLabel(k);
        if (k === 'descripcion') label = `Nombre del ${labelTipo.value}`;
        if (k === 'actualizadoAt') label = etiquetaFecha;
        return [label, formatVal(k, datos[k])];
      });
  };

  const datosCreacion = computed(() => {
    if (data.value?.tipo !== 'CREACION') {
      return { campos: [], materiales: [], servicios: [], terceros: [], total: null };
    }
    const datos = data.value.datos || {};
    const tipo = tipoAccion.value;
    const campos = filasDe(datos, tipo, 'Fecha de Registro');
    if (tipo !== 'orden') return { campos, materiales: [], servicios: [], terceros: [], total: null };

    const materiales = (datos.materiales || []).map((m) => ({
      descripcion: m.descripcion || '—',
      cantidad: m.cantidad,
      subtotal: parseFloat(m.cantidad || 0) * parseFloat(m.precioAlMomento ?? m.precioAplicado ?? 0),
    }));
    const servicios = (datos.servicios || []).map((s) => ({
      descripcion: s.descripcion || '—', monto: parseFloat(s.monto || 0),
    }));
    const terceros = (datos.terceros || []).map((t) => ({
      descripcion: t.descripcion || '—', monto: parseFloat(t.monto || 0),
    }));
    const total = parseFloat(datos.totalFinal || 0)
      || materiales.reduce((a, m) => a + m.subtotal, 0)
      + servicios.reduce((a, s) => a + s.monto, 0)
      + terceros.reduce((a, t) => a + t.monto, 0);
    return { campos, materiales, servicios, terceros, total };
  });

  const datosEliminacion = computed(() => {
    if (data.value?.tipo !== 'ELIMINACION') {
      return { campos: [], materiales: [], servicios: [], terceros: [], total: null };
    }
    const datos = data.value.datos_borrados || {};
    const tipo = tipoAccion.value;
    const campos = filasDe(datos, tipo, 'Última Modificación');
    if (tipo !== 'orden') return { campos, materiales: [], servicios: [], terceros: [], total: null };

    const materiales = (datos.materiales || []).map((m) => ({
      descripcion: m.material?.descripcion || m.descripcion || '—',
      cantidad: m.cantidad,
      subtotal: parseFloat(m.cantidad || 0) * parseFloat(m.precioAplicado || 0),
    }));
    const servicios = (datos.servicios || []).map((s) => ({
      descripcion: s.descripcion || '—', monto: parseFloat(s.monto || 0),
    }));
    const terceros = (datos.terceros || []).map((t) => ({
      descripcion: t.descripcion || '—', monto: parseFloat(t.monto || 0),
    }));
    return { campos, materiales, servicios, terceros, total: parseFloat(datos.totalFinal || 0) };
  });

  const camposCabecera = computed(() => {
    if (data.value?.tipo !== 'EDICION') return [];
    if (data.value.cambios?.cabecera) return Object.entries(data.value.cambios.cabecera);
    if (data.value.cambios) {
      return Object.entries(data.value.cambios)
        .filter(([, v]) => v && typeof v === 'object' && 'de' in v);
    }
    return [];
  });

  const listas = computed(() => {
    if (data.value?.tipo !== 'EDICION') return [];
    const c = data.value.cambios || {};
    const res = [];
    if (c.materiales?.length) res.push({ nombre: 'Repuestos', icono: 'package', items: c.materiales });
    if (c.servicios?.length) res.push({ nombre: 'Servicios', icono: 'wrench', items: c.servicios });
    if (c.terceros?.length) res.push({ nombre: 'Terceros', icono: 'external', items: c.terceros });
    return res;
  });

  return {
    data, tituloItem, rolLabel, etiquetaOperacionFoto,
    vistaAnterior, vistaNueva, vistaAmpliada, cargandoFotos,
    datosCreacion, datosEliminacion, camposCabecera, listas,
    campoLabel, formatVal,
  };
}
