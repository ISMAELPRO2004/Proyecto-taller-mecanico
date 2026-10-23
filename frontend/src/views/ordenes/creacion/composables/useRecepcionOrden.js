import { watch, onMounted, onUnmounted } from 'vue';
import { crearEstadoRecepcion } from './estadoRecepcion.js';
import { useBorradorRecepcion } from './useBorradorRecepcion.js';
import { useCargaRecepcion } from './useCargaRecepcion.js';
import { usePasoVehiculo } from '../vehiculo/usePasoVehiculo.js';
import { usePasoCliente } from '../cliente/usePasoCliente.js';
import { usePasoRecepcion } from '../recepcion/usePasoRecepcion.js';
import { useNavegacionPasos } from '../pasos/useNavegacionPasos.js';

/** Junta el estado compartido con cada paso. La vista no cambia. */
export function useRecepcionOrden() {
  const ctx = crearEstadoRecepcion();
  const borrador = useBorradorRecepcion(ctx);
  Object.assign(ctx, borrador);

  const vehiculo = usePasoVehiculo(ctx);
  Object.assign(ctx, vehiculo);

  const cliente = usePasoCliente(ctx);
  const recepcion = usePasoRecepcion(ctx);
  Object.assign(ctx, recepcion);

  const { inicializar } = useCargaRecepcion(ctx);
  const { irAPaso } = useNavegacionPasos(ctx);

  watch(
    () => ({
      ordenId: ctx.ordenId.value,
      paso: ctx.paso.value,
      pasoRecepcion: ctx.pasoRecepcion.value,
      form: ctx.form.value,
      placaConsultada: ctx.placaConsultada.value,
      vehiculoEraNuevo: ctx.vehiculoEraNuevo.value,
      clienteConsultado: ctx.clienteConsultado.value,
      clienteEraNuevo: ctx.clienteEraNuevo.value,
      clienteConfirmado: ctx.clienteConfirmado.value,
      vehiculoEditable: ctx.vehiculoEditable.value,
      clienteEditable: ctx.clienteEditable.value,
      editandoVehiculo: ctx.editandoVehiculo.value,
      editandoCliente: ctx.editandoCliente.value,
    }),
    () => ctx.persistirLocal(),
    { deep: true },
  );

  onMounted(() => {
    window.addEventListener('pagehide', ctx.alOcultarPagina);
    window.addEventListener('beforeunload', ctx.alOcultarPagina);
    document.addEventListener('visibilitychange', ctx.alCambiarVisibilidad);
    inicializar();
  });
  onUnmounted(() => {
    window.removeEventListener('pagehide', ctx.alOcultarPagina);
    window.removeEventListener('beforeunload', ctx.alOcultarPagina);
    document.removeEventListener('visibilitychange', ctx.alCambiarVisibilidad);
    if (ctx.fotoSrc.value) URL.revokeObjectURL(ctx.fotoSrc.value);
  });

  return {
    router: ctx.router,
    ordenId: ctx.ordenId,
    pasoRecepcion: ctx.pasoRecepcion,
    paso: ctx.paso,
    pasoAlcanzado: ctx.pasoAlcanzado,
    cargando: ctx.cargando,
    vehiculoBloqueado: ctx.vehiculoBloqueado,
    placaConsultada: ctx.placaConsultada,
    form: ctx.form,
    historialOrdenes: ctx.historialOrdenes,
    errores: ctx.errores,
    onCambioPlaca: vehiculo.onCambioPlaca,
    buscarPlaca: vehiculo.buscarPlaca,
    marcas: ctx.marcas,
    puedeEditarVehiculoUI: ctx.puedeEditarVehiculoUI,
    onNuevaMarca: vehiculo.onNuevaMarca,
    empezarEditarVehiculoEnPaso: vehiculo.empezarEditarVehiculoEnPaso,
    editandoVehiculo: ctx.editandoVehiculo,
    cancelarEdicionVehiculo: vehiculo.cancelarEdicionVehiculo,
    guardandoPaso: ctx.guardandoPaso,
    guardarPasoVehiculo: vehiculo.guardarPasoVehiculo,
    pasoOrigenEdicion: ctx.pasoOrigenEdicion,
    resumenVehiculo: ctx.resumenVehiculo,
    irAEditarVehiculo: vehiculo.irAEditarVehiculo,
    cambiarVehiculo: vehiculo.cambiarVehiculo,
    clienteBloqueado: ctx.clienteBloqueado,
    clienteConsultado: ctx.clienteConsultado,
    clienteEraNuevo: ctx.clienteEraNuevo,
    nombreClienteBloqueado: ctx.nombreClienteBloqueado,
    onCambioNombre: cliente.onCambioNombre,
    onCambioBusqueda: cliente.onCambioBusqueda,
    consultarCliente: cliente.consultarCliente,
    consultandoDocumento: cliente.consultandoDocumento,
    puedeEditarClienteUI: ctx.puedeEditarClienteUI,
    aplicarCliente: cliente.aplicarCliente,
    empezarEditarClienteEnPaso: cliente.empezarEditarClienteEnPaso,
    cambiarCliente: cliente.cambiarCliente,
    editandoCliente: ctx.editandoCliente,
    clienteConfirmado: ctx.clienteConfirmado,
    cancelarEdicionCliente: cliente.cancelarEdicionCliente,
    irAPaso,
    guardarPasoCliente: cliente.guardarPasoCliente,
    resumenCliente: ctx.resumenCliente,
    recepcionCompleta: ctx.recepcionCompleta,
    irAEditarCliente: cliente.irAEditarCliente,
    fotoSrc: ctx.fotoSrc,
    puedeCambiarRegistro: ctx.puedeCambiarRegistro,
    puedeQuitarRegistro: ctx.puedeQuitarRegistro,
    subiendoFoto: ctx.subiendoFoto,
    archivoRegistro: ctx.archivoRegistro,
    alElegirFoto: recepcion.alElegirFoto,
    quitarRegistro: recepcion.quitarRegistro,
    guardando: ctx.guardando,
    completarBorrador: recepcion.completarBorrador,
  };
}
