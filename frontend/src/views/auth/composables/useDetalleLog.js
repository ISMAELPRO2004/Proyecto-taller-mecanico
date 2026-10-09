import { computed, ref, watch, onBeforeUnmount } from 'vue';
import { labelEstadoOrden } from '../../../constants/estadosOrden.js';
import { usuarioService } from '../../../services/usuarioService.js';

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

  const vistaAnterior = ref('');
  const vistaNueva = ref('');
  const vistaAmpliada = ref('');
  const cargandoFotos = ref(false);
  let cargaSeq = 0;

  const revocarVistas = () => {
    if (vistaAnterior.value) URL.revokeObjectURL(vistaAnterior.value);
    if (vistaNueva.value) URL.revokeObjectURL(vistaNueva.value);
    vistaAnterior.value = '';
    vistaNueva.value = '';
    vistaAmpliada.value = '';
  };

  const cargarVista = async (ruta) => {
    if (!ruta) return '';
    try {
      const blob = await usuarioService.descargarFotoLog(ruta);
      if (!blob || !(blob.type || '').startsWith('image/')) return '';
      return URL.createObjectURL(blob);
    } catch {
      return '';
    }
  };

  watch(
    () => [props.isOpen, props.log?.id],
    async ([abierto]) => {
      const seq = ++cargaSeq;
      revocarVistas();
      if (!abierto || data.value?.tipo !== 'FOTO') return;
      cargandoFotos.value = true;
      try {
        const [antes, despues] = await Promise.all([
          cargarVista(data.value.snapshotAnterior),
          cargarVista(data.value.snapshotNuevo),
        ]);
        if (seq !== cargaSeq) {
          if (antes) URL.revokeObjectURL(antes);
          if (despues) URL.revokeObjectURL(despues);
          return;
        }
        vistaAnterior.value = antes;
        vistaNueva.value = despues;
      } finally {
        if (seq === cargaSeq) cargandoFotos.value = false;
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(revocarVistas);

  const etiquetaOperacionFoto = (op) => {
    if (op === 'REEMPLAZAR') return 'Se reemplazó la imagen';
    if (op === 'QUITAR') return 'Se quitó la imagen';
    return 'Se subió la imagen';
  };

  const ROL_LABELS = {
    ADMIN: 'Administrador', SUPERVISOR: 'Supervisor', TECNICO: 'Técnico', RECEPCIONISTA: 'Recepcionista',
  };
  const rolLabel = (val) => ROL_LABELS[val] || val || '—';

  const CAMPO_LABELS = {
    clienteNombre: 'Cliente', clienteCelular: 'Celular',
    trabajoSolicitado: 'Trabajo Solicitado', placa: 'Placa',
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
  };
  const campoLabel = (key) => CAMPO_LABELS[key] || key;

  const formatFecha = (val) => {
    if (!val) return '—';
    try { return new Date(val).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return String(val); }
  };

  const formatVal = (key, val) => {
    if (val === null || val === undefined) return '—';
    if (key === 'marca' && typeof val === 'object') return val.nombre || '—';
    if (key === 'tipoCliente') return val === 'EMPRESA' ? 'Empresa' : val === 'PERSONA' ? 'Persona' : String(val);
    if (typeof val === 'object') return '—';
    if (key === 'estado') return labelEstadoOrden(val);
    if (key === 'rol') return rolLabel(val);
    if (key === 'activo') return val ? 'Activo' : 'Inactivo';
    if (['totalFinal', 'precioBase', 'monto'].includes(key)) return `S/ ${parseFloat(val).toFixed(2)}`;
    if (['actualizadoAt', 'fechaCreacion', 'creadoAt'].includes(key)) return formatFecha(val);
    return String(val);
  };

  const accionConfig = (accion) => {
    if (accion === 'AÑADIDO') return { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    if (accion === 'ELIMINADO') return { color: 'text-red-400', bg: 'bg-red-50', border: 'border-red-100' };
    return { color: 'text-amber-500', bg: 'bg-amber-50/60', border: 'border-amber-100' };
  };

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
    campoLabel, formatVal, accionConfig,
  };
}
