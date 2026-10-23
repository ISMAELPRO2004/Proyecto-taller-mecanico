import { ordenService } from '../../../../services/ordenService.js';
import { notify } from '../../../../utils/alerts.js';
import { leerBorradorLocal } from '../../../../utils/borradorRecepcion.js';
import { mapCliente } from './estadoRecepcion.js';

/** Carga inicial: servidor, recarga del navegador y redirección si ya no es borrador. */
export function useCargaRecepcion(ctx) {
  const {
    route,
    router,
    auth,
    esEdicion,
    ordenId,
    paso,
    pasoRecepcion,
    form,
    historialOrdenes,
    placaConsultada,
    vehiculoEditable,
    clienteEditable,
    vehiculoEraNuevo,
    clienteEraNuevo,
    clienteConfirmado,
    clienteConsultado,
    editandoVehiculo,
    editandoCliente,
    restaurando,
    cargando,
    archivoRegistro,
    recordarGuardado,
  } = ctx;

  const mapOrdenAForm = async (orden) => {
    form.value = {
      cliente: mapCliente(orden.cliente || {}),
      vehiculo: {
        placa: orden.placa || '',
        marcaId: orden.vehiculo?.marcaId || '',
        modelo: orden.vehiculo?.modelo || '',
        horometro: orden.vehiculo?.horometro ?? null,
        kilometraje: orden.vehiculo?.kilometraje ?? null,
      },
      descripcionInformal: orden.descripcionInformal || '',
      trabajoSolicitado: orden.trabajoSolicitado || '',
      estadoIngreso: orden.estadoIngreso || 'ACEPTADO',
      observacionIngreso: orden.observacionIngreso || '',
      fotoRegistro: orden.fotoRegistro || '',
    };
    ordenId.value = orden.id;
    pasoRecepcion.value = orden.pasoRecepcion;
    vehiculoEditable.value = !!orden.vehiculoEditableEnBorrador;
    clienteEditable.value = !!orden.clienteEditableEnBorrador;
    vehiculoEraNuevo.value = !!orden.vehiculoEditableEnBorrador;
    clienteEraNuevo.value = !!orden.clienteEditableEnBorrador;
    clienteConfirmado.value = !!orden.clienteId;
    clienteConsultado.value = !!orden.clienteId;
    placaConsultada.value = true;
    editandoVehiculo.value = false;
    editandoCliente.value = false;

    if (orden.pasoRecepcion === 1) paso.value = 2;
    else if (orden.pasoRecepcion === 2) paso.value = 3;
    else paso.value = 3;

    await ctx.cargarFotoRegistro(orden.id, orden.fotoRegistro);
    recordarGuardado();
  };

  const redirigirSiYaNoEsBorrador = (orden) => {
    if (orden.estado === 'EN_ESPERA') return false;
    const puedeTaller = ['ADMIN', 'SUPERVISOR', 'TECNICO'].includes(auth.usuario?.rol);
    if (puedeTaller) router.replace(`/ordenes/taller/${orden.id}`);
    else {
      notify.info('Orden aceptada', 'La recepción ya no edita esta orden.');
      router.replace('/ordenes');
    }
    return true;
  };

  const recuperarEncima = async (orden, local, recarga) => {
    await mapOrdenAForm(orden);
    historialOrdenes.value = [];
    const hayLocal = local && Number(local.ordenId) === Number(orden.id) && ctx.snapshotUtil(local);
    if (hayLocal) ctx.aplicarSnapshot(local, true);
    await ctx.restaurarFotoPendiente();
    if (recarga && (hayLocal || archivoRegistro.value)) {
      notify.info('Borrador recuperado', 'Sigues en el mismo paso.');
    }
  };

  const inicializar = async () => {
    restaurando.value = true;
    cargando.value = true;
    const recarga = ctx.esRecargaDeEstaPantalla();
    const local = leerBorradorLocal();
    try {
      await ctx.cargarMarcas();
      if (esEdicion.value) {
        const orden = await ordenService.obtener(route.params.id);
        if (redirigirSiYaNoEsBorrador(orden)) return;
        await recuperarEncima(orden, local, recarga);
        return;
      }

      if (recarga && local?.ordenId && local.ruta === '/ordenes/nueva') {
        await router.replace(`/ordenes/editar/${local.ordenId}`);
        const orden = await ordenService.obtener(local.ordenId);
        if (redirigirSiYaNoEsBorrador(orden)) return;
        await recuperarEncima(orden, local, true);
        return;
      }

      if (recarga && ctx.snapshotUtil(local)) {
        ctx.aplicarSnapshot(local);
        await ctx.restaurarFotoPendiente();
        notify.info('Borrador recuperado', 'Sigues en el mismo paso.');
      }
    } catch {
      notify.error('Error', 'No se pudo cargar la orden.');
    } finally {
      restaurando.value = false;
      cargando.value = false;
    }
  };

  return { inicializar };
}
