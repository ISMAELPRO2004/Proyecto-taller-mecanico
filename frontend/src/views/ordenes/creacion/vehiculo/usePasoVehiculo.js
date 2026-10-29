import { ref } from 'vue';
import { ordenService } from '../../../../services/ordenService.js';
import { vehiculoService } from '../../../../services/vehiculoService.js';
import { notify } from '../../../../utils/alerts.js';
import { FORMATO_PLACA, MENSAJE_FORMATO_PLACA, errorPlacaEnCurso } from '../../../../utils/placa.js';
import { esDispositivoMovil } from '../../../../utils/dispositivo.js';
import { mapCliente } from '../composables/estadoRecepcion.js';

export function usePasoVehiculo(ctx) {
  const {
    form,
    errores,
    marcas,
    historialOrdenes,
    placaConsultada,
    vehiculoEraNuevo,
    editandoVehiculo,
    vehiculoEditable,
    ordenId,
    paso,
    pasoRecepcion,
    pasoOrigenEdicion,
    clienteConfirmado,
    clienteEraNuevo,
    clienteConsultado,
    guardandoPaso,
    esEdicion,
    router,
    recordarGuardado,
  } = ctx;

  const modoPorDispositivo = () => (esDispositivoMovil() ? 'escanear' : 'manual');
  const modoEntrada = ref(esEdicion.value ? 'manual' : modoPorDispositivo());

  const elegirModoEntrada = (modo) => {
    modoEntrada.value = modo;
  };

  const cargarMarcas = async () => {
    try {
      marcas.value = await vehiculoService.listarMarcas();
    } catch {
      notify.error('Error', 'No se pudieron cargar las marcas.');
    }
  };

  const normalizarPlaca = (placa) =>
    (placa || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');

  const buscarPlaca = async (placa) => {
    const limpia = normalizarPlaca(placa);
    if (!limpia) {
      errores.value = { ...errores.value, placa: MENSAJE_FORMATO_PLACA };
      placaConsultada.value = false;
      return;
    }

    const formatoOk = FORMATO_PLACA.test(limpia);
    form.value.vehiculo.placa = limpia;
    errores.value = { ...errores.value, placa: '' };
    try {
      const data = await vehiculoService.buscarPorPlaca(limpia);
      form.value.vehiculo = {
        placa: data.placa,
        marcaId: data.marcaId,
        modelo: data.modelo,
        horometro: data.horometro,
        kilometraje: data.kilometraje,
      };
      historialOrdenes.value = data.ordenes || [];
      placaConsultada.value = true;
      vehiculoEraNuevo.value = false;
      editandoVehiculo.value = false;

      const ultima = data.ordenes?.[0]?.cliente;
      if (ultima?.id) {
        form.value.cliente = mapCliente(ultima);
        clienteEraNuevo.value = false;
        clienteConsultado.value = true;
      }

      notify.success('Vehículo encontrado', `${data.marca?.nombre || ''} ${data.modelo}`);
    } catch {
      if (!formatoOk) {
        historialOrdenes.value = [];
        placaConsultada.value = false;
        errores.value = { ...errores.value, placa: MENSAJE_FORMATO_PLACA };
        return;
      }
      historialOrdenes.value = [];
      placaConsultada.value = true;
      vehiculoEraNuevo.value = true;
      editandoVehiculo.value = true;
      form.value.vehiculo = {
        placa: limpia,
        marcaId: '',
        modelo: '',
        horometro: null,
        kilometraje: null,
      };
      notify.info('Placa nueva', 'Completa marca y modelo para registrarla.');
    }
  };

  const onCambioPlaca = (valor) => {
    form.value.vehiculo.placa = valor;
    const aviso = errorPlacaEnCurso(valor);
    if (placaConsultada.value) {
      placaConsultada.value = false;
      historialOrdenes.value = [];
      errores.value = { ...errores.value, placa: aviso, marcaId: '', modelo: '' };
      return;
    }
    errores.value = { ...errores.value, placa: aviso };
  };

  const onNuevaMarca = async (nombre) => {
    try {
      const marca = await vehiculoService.crearMarca(nombre);
      marcas.value = [...marcas.value, marca].sort((a, b) => a.nombre.localeCompare(b.nombre));
      form.value.vehiculo.marcaId = marca.id;
      notify.success('Marca creada', marca.nombre);
    } catch (e) {
      notify.error('Error', e.response?.data?.message || 'No se pudo crear la marca.');
    }
  };

  const validarVehiculo = () => {
    const e = {};
    const { vehiculo } = form.value;
    if (!FORMATO_PLACA.test(normalizarPlaca(vehiculo.placa))) {
      e.placa = MENSAJE_FORMATO_PLACA;
    }
    if (!vehiculo.marcaId) e.marcaId = 'Marca obligatoria';
    if (!vehiculo.modelo?.trim()) e.modelo = 'Modelo obligatorio';
    errores.value = e;
    return Object.keys(e).length === 0;
  };

  const payloadVehiculo = () => ({
    placa: form.value.vehiculo.placa,
    marcaId: Number(form.value.vehiculo.marcaId),
    modelo: form.value.vehiculo.modelo,
    horometro: form.value.vehiculo.horometro === '' ? null : form.value.vehiculo.horometro,
    kilometraje: form.value.vehiculo.kilometraje === '' ? null : form.value.vehiculo.kilometraje,
  });

  const guardarPasoVehiculo = async () => {
    if (!validarVehiculo()) {
      return notify.error('Completa el vehículo', 'Placa, marca y modelo son obligatorios.');
    }

    const origen = pasoOrigenEdicion.value;
    const eraEdicion = editandoVehiculo.value && !!ordenId.value;

    guardandoPaso.value = true;
    try {
      const actualizarDatos = editandoVehiculo.value && vehiculoEditable.value;
      const orden = await ordenService.guardarPasoVehiculo({
        vehiculo: payloadVehiculo(),
        actualizarDatos,
      }, ordenId.value);

      ordenId.value = orden.id;
      pasoRecepcion.value = orden.pasoRecepcion;
      vehiculoEditable.value = !!orden.vehiculoEditableEnBorrador;
      editandoVehiculo.value = false;
      placaConsultada.value = true;
      pasoOrigenEdicion.value = null;
      recordarGuardado();

      if (!esEdicion.value) {
        await router.replace(`/ordenes/editar/${orden.id}`);
      }

      if (eraEdicion && origen != null) {
        if (origen >= 3 && clienteConfirmado.value) {
          paso.value = 3;
          notify.success('Vehículo actualizado', 'Volviste al detalle del trabajo.');
        } else if (origen >= 2) {
          paso.value = 2;
          notify.success('Vehículo actualizado', 'Puedes seguir con el cliente.');
        } else {
          paso.value = clienteConfirmado.value ? 3 : 2;
          notify.success('Vehículo actualizado');
        }
      } else {
        paso.value = 2;
        notify.success('Vehículo guardado', 'Puedes continuar con el cliente. Si sales, el borrador queda pendiente.');
      }
    } catch (e) {
      notify.error('Error', e.response?.data?.message || 'No se pudo guardar el vehículo.');
    } finally {
      guardandoPaso.value = false;
    }
  };

  const cambiarVehiculo = () => {
    pasoOrigenEdicion.value = null;
    paso.value = 1;
    editandoVehiculo.value = false;
    placaConsultada.value = false;
    historialOrdenes.value = [];
    errores.value = {};
    modoEntrada.value = modoPorDispositivo();
  };

  const irAEditarVehiculo = () => {
    pasoOrigenEdicion.value = paso.value;
    paso.value = 1;
    editandoVehiculo.value = true;
    placaConsultada.value = true;
  };

  const empezarEditarVehiculoEnPaso = () => {
    if (pasoOrigenEdicion.value == null) {
      pasoOrigenEdicion.value = clienteConfirmado.value ? 3 : (ordenId.value ? 2 : 1);
    }
    editandoVehiculo.value = true;
  };

  const cancelarEdicionVehiculo = () => {
    const origen = pasoOrigenEdicion.value;
    editandoVehiculo.value = false;
    pasoOrigenEdicion.value = null;
    if (origen != null && origen > 1) {
      if (origen >= 3 && clienteConfirmado.value) paso.value = 3;
      else if (origen >= 2) paso.value = 2;
    }
  };

  return {
    modoEntrada,
    elegirModoEntrada,
    cargarMarcas,
    buscarPlaca,
    onCambioPlaca,
    onNuevaMarca,
    guardarPasoVehiculo,
    cambiarVehiculo,
    irAEditarVehiculo,
    empezarEditarVehiculoEnPaso,
    cancelarEdicionVehiculo,
  };
}
