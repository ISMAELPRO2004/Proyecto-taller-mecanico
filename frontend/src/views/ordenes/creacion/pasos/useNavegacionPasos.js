import { notify } from '../../../../utils/alerts.js';

export function useNavegacionPasos(ctx) {
  const {
    paso,
    pasoAlcanzado,
    pasoOrigenEdicion,
    editandoVehiculo,
    editandoCliente,
    placaConsultada,
    vehiculoGuardado,
    clienteGuardado,
    form,
    errores,
    vehiculoEraNuevo,
    vehiculoEditable,
    clienteConsultado,
    clienteEraNuevo,
    clienteConfirmado,
    clienteEditable,
  } = ctx;

  const cambioPendiente = () => {
    if (editandoVehiculo.value || editandoCliente.value) return true;
    if (
      paso.value === 1
      && placaConsultada.value
      && vehiculoGuardado.value
      && form.value.vehiculo.placa !== vehiculoGuardado.value.placa
    ) return true;
    if (paso.value === 2 && clienteConsultado.value && clienteEraNuevo.value && !clienteConfirmado.value) {
      return true;
    }
    return false;
  };

  const restaurarSeleccionGuardada = () => {
    if (vehiculoGuardado.value?.placa) {
      form.value.vehiculo = { ...vehiculoGuardado.value };
      placaConsultada.value = true;
      vehiculoEraNuevo.value = vehiculoEditable.value;
    }
    if (clienteGuardado.value?.id || clienteGuardado.value?.nombreRazonSocial) {
      form.value.cliente = { ...clienteGuardado.value };
      clienteConsultado.value = true;
      clienteEraNuevo.value = clienteEditable.value;
      clienteConfirmado.value = !!clienteGuardado.value.id;
    }
  };

  const irAPaso = (n) => {
    if (n < 1 || n > 3 || n === paso.value) return;
    if (n > pasoAlcanzado.value) return;
    if (cambioPendiente()) {
      notify.info('Hay cambios sin guardar', 'Termina este paso antes de saltar a otro.');
      return;
    }
    restaurarSeleccionGuardada();
    paso.value = n;
    errores.value = {};
    editandoVehiculo.value = false;
    editandoCliente.value = false;
    pasoOrigenEdicion.value = null;
  };

  return { irAPaso };
}
