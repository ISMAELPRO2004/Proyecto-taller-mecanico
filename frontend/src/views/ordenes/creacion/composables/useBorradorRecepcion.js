import {
  leerBorradorLocal,
  guardarBorradorLocal,
  marcarRecargaRecepcion,
  consumirRecargaRecepcion,
} from '../../../../utils/borradorRecepcion.js';
import { clienteVacio } from './estadoRecepcion.js';

/** Persistencia del wizard en el navegador (recarga / salir del paso). */
export function useBorradorRecepcion(ctx) {
  const {
    ordenId,
    paso,
    pasoRecepcion,
    form,
    placaConsultada,
    vehiculoEraNuevo,
    clienteConsultado,
    clienteEraNuevo,
    clienteConfirmado,
    vehiculoEditable,
    clienteEditable,
    editandoVehiculo,
    editandoCliente,
    restaurando,
  } = ctx;

  const snapshotLocal = () => ({
    ordenId: ordenId.value,
    paso: paso.value,
    pasoRecepcion: pasoRecepcion.value,
    form: form.value,
    placaConsultada: placaConsultada.value,
    vehiculoEraNuevo: vehiculoEraNuevo.value,
    clienteConsultado: clienteConsultado.value,
    clienteEraNuevo: clienteEraNuevo.value,
    clienteConfirmado: clienteConfirmado.value,
    vehiculoEditable: vehiculoEditable.value,
    clienteEditable: clienteEditable.value,
    editandoVehiculo: editandoVehiculo.value,
    editandoCliente: editandoCliente.value,
    ruta: window.location.pathname,
  });

  const snapshotUtil = (local) => {
    if (!local?.form) return false;
    return !!(
      local.ordenId
      || local.form.vehiculo?.placa
      || local.form.cliente?.nombreRazonSocial
      || local.form.descripcionInformal
      || local.form.observacionIngreso
    );
  };

  const persistirLocal = () => {
    if (restaurando.value) return;
    const previo = leerBorradorLocal();
    const placa = form.value.vehiculo.placa;
    const nombre = form.value.cliente.nombreRazonSocial?.trim();
    const solicitud = form.value.descripcionInformal?.trim();
    if (!ordenId.value && !placa && !nombre && !solicitud && snapshotUtil(previo)) return;
    if (!ordenId.value && previo?.ordenId && !placa) return;
    guardarBorradorLocal(snapshotLocal());
  };

  const esRecargaDeEstaPantalla = () => {
    const nav = performance.getEntriesByType('navigation')[0];
    const misma = !!nav?.name?.includes(window.location.pathname);
    if (misma && nav.type === 'reload') return true;
    if (misma && consumirRecargaRecepcion()) return true;
    return false;
  };

  const aplicarSnapshot = (local, conservarServidor = false) => {
    const fotoServidor = conservarServidor ? form.value.fotoRegistro : '';
    form.value = {
      ...local.form,
      cliente: { ...clienteVacio(), ...local.form.cliente },
      vehiculo: {
        placa: '',
        marcaId: '',
        modelo: '',
        horometro: null,
        kilometraje: null,
        ...local.form.vehiculo,
      },
      fotoRegistro: fotoServidor || local.form.fotoRegistro || '',
    };
    if (local.paso) paso.value = local.paso;
    placaConsultada.value = !!local.placaConsultada;
    vehiculoEraNuevo.value = !!local.vehiculoEraNuevo;
    clienteConsultado.value = !!local.clienteConsultado;
    clienteEraNuevo.value = local.clienteEraNuevo !== false;
    clienteConfirmado.value = !!local.clienteConfirmado;
    vehiculoEditable.value = !!local.vehiculoEditable;
    clienteEditable.value = !!local.clienteEditable;
    editandoVehiculo.value = !!local.editandoVehiculo;
    editandoCliente.value = !!local.editandoCliente;
    if (!conservarServidor) {
      ordenId.value = local.ordenId || null;
      pasoRecepcion.value = local.pasoRecepcion ?? null;
    }
  };

  const alOcultarPagina = () => {
    persistirLocal();
    marcarRecargaRecepcion();
  };

  const alCambiarVisibilidad = () => {
    if (document.visibilityState === 'hidden') persistirLocal();
  };

  return {
    snapshotLocal,
    snapshotUtil,
    persistirLocal,
    esRecargaDeEstaPantalla,
    aplicarSnapshot,
    alOcultarPagina,
    alCambiarVisibilidad,
  };
}
