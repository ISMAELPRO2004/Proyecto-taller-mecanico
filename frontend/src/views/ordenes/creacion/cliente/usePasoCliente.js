import { ref } from 'vue';
import { ordenService } from '../../../../services/ordenService.js';
import { clienteService } from '../../../../services/clienteService.js';
import { notify } from '../../../../utils/alerts.js';
import { clienteVacio, mapCliente } from '../composables/estadoRecepcion.js';

export function usePasoCliente(ctx) {
  const {
    form,
    errores,
    ordenId,
    paso,
    pasoRecepcion,
    pasoOrigenEdicion,
    clienteEraNuevo,
    clienteConsultado,
    clienteConfirmado,
    clienteEditable,
    editandoCliente,
    guardandoPaso,
    recordarGuardado,
  } = ctx;

  const consultandoDocumento = ref(false);

  const onCambioNombre = (valor) => {
    const cargado = !clienteEraNuevo.value && (clienteConsultado.value || form.value.cliente.id);
    if (cargado) {
      const { tipoCliente, tipoDocumento, numeroDocumento } = form.value.cliente;
      form.value.cliente = clienteVacio({ nombreRazonSocial: valor, tipoCliente, tipoDocumento, numeroDocumento });
      clienteEraNuevo.value = true;
      editandoCliente.value = false;
      errores.value = { ...errores.value, nombreRazonSocial: '' };
      return;
    }
    form.value.cliente.nombreRazonSocial = valor;
  };

  const onCambioBusqueda = ({ tipo, numero }) => {
    const tipoDocumento = tipo === 'RUC' ? 'RUC' : 'DNI';
    const numeroDocumento = String(numero || '').replace(/\D/g, '');
    const cargado = !clienteEraNuevo.value && (clienteConsultado.value || form.value.cliente.id);
    if (cargado) {
      form.value.cliente = clienteVacio({
        tipoCliente: tipoDocumento === 'RUC' ? 'EMPRESA' : 'PERSONA',
        tipoDocumento,
        numeroDocumento,
      });
      clienteEraNuevo.value = true;
      clienteConsultado.value = false;
      editandoCliente.value = false;
      errores.value = { ...errores.value, nombreRazonSocial: '', numeroDocumento: '' };
      return;
    }
    form.value.cliente.tipoDocumento = tipoDocumento;
    form.value.cliente.numeroDocumento = numeroDocumento;
    form.value.cliente.tipoCliente = tipoDocumento === 'RUC' ? 'EMPRESA' : 'PERSONA';
    if (clienteConsultado.value && clienteEraNuevo.value && !form.value.cliente.id) {
      clienteConsultado.value = false;
    }
    errores.value = { ...errores.value, numeroDocumento: '' };
  };

  const consultarCliente = async () => {
    const tipo = form.value.cliente.tipoDocumento === 'RUC' ? 'RUC' : 'DNI';
    const numero = String(form.value.cliente.numeroDocumento || '').replace(/\D/g, '');
    if (tipo === 'DNI' && numero.length !== 8) {
      errores.value = { ...errores.value, numeroDocumento: 'DNI: 8 dígitos' };
      return;
    }
    if (tipo === 'RUC' && numero.length !== 11) {
      errores.value = { ...errores.value, numeroDocumento: 'RUC: 11 dígitos' };
      return;
    }

    consultandoDocumento.value = true;
    try {
      const data = await clienteService.consultarDocumento(tipo, numero);
      if (data.fuente === 'local' && data.cliente?.id) {
        aplicarCliente(data.cliente);
        return;
      }
      form.value.cliente = clienteVacio({
        tipoCliente: data.cliente?.tipoCliente || (tipo === 'RUC' ? 'EMPRESA' : 'PERSONA'),
        tipoDocumento: data.cliente?.tipoDocumento || tipo,
        numeroDocumento: data.cliente?.numeroDocumento || numero,
        nombreRazonSocial: data.cliente?.nombreRazonSocial || '',
        celular: data.cliente?.celular || '',
      });
      clienteEraNuevo.value = true;
      clienteConsultado.value = true;
      editandoCliente.value = false;
      errores.value = { ...errores.value, nombreRazonSocial: '', numeroDocumento: '' };
      if (data.cliente?.nombreRazonSocial) {
        notify.success('Datos encontrados', data.cliente.nombreRazonSocial);
      } else {
        notify.info('Sin datos automáticos', data.mensaje || 'Completa el nombre a mano.');
      }
    } catch (e) {
      notify.error('Error', e.response?.data?.message || 'No se pudo consultar el documento.');
    } finally {
      consultandoDocumento.value = false;
    }
  };

  const aplicarCliente = (cliente) => {
    form.value.cliente = mapCliente(cliente);
    clienteEraNuevo.value = false;
    clienteConsultado.value = true;
    editandoCliente.value = false;
    const titulo = cliente.tipoCliente === 'EMPRESA' ? 'Empresa registrada' : 'Persona registrada';
    notify.success(titulo, cliente.nombreRazonSocial);
  };

  const validarCliente = () => {
    const e = {};
    const { cliente } = form.value;
    if (!clienteConsultado.value) e.numeroDocumento = 'Consulta el DNI o RUC para continuar';
    else if (!cliente.nombreRazonSocial?.trim() || cliente.nombreRazonSocial.trim().length < 2) {
      e.nombreRazonSocial = 'Nombre / razón social obligatorio';
    }
    const doc = (cliente.numeroDocumento || '').trim();
    if (cliente.tipoCliente === 'EMPRESA' && cliente.tipoDocumento !== 'RUC') {
      e.tipoDocumento = 'Una empresa solo puede usar RUC';
    }
    if (doc && cliente.tipoDocumento === 'DNI' && doc.length !== 8) e.numeroDocumento = 'DNI: 8 dígitos';
    if (doc && cliente.tipoDocumento === 'RUC' && doc.length !== 11) e.numeroDocumento = 'RUC: 11 dígitos';
    if (cliente.celular && cliente.celular.length !== 9) e.celular = 'Celular: 9 dígitos';
    errores.value = e;
    return Object.keys(e).length === 0;
  };

  const payloadCliente = () => ({
    ...form.value.cliente,
    id: !clienteEraNuevo.value && form.value.cliente.id ? form.value.cliente.id : null,
    numeroDocumento: form.value.cliente.numeroDocumento || null,
    representante: form.value.cliente.representante || null,
    celular: form.value.cliente.celular || null,
    correo: form.value.cliente.correo || null,
  });

  const guardarPasoCliente = async () => {
    if (!ordenId.value) return notify.error('Falta el vehículo', 'Vuelve al paso 1.');
    if (!validarCliente()) return notify.error('Revisa el cliente', 'Completa los datos obligatorios.');

    const origen = pasoOrigenEdicion.value;
    const eraEdicion = editandoCliente.value && clienteConfirmado.value;

    guardandoPaso.value = true;
    try {
      const actualizarDatos = editandoCliente.value && clienteEditable.value;
      const orden = await ordenService.guardarPasoCliente(ordenId.value, {
        cliente: payloadCliente(),
        actualizarDatos,
      });

      pasoRecepcion.value = orden.pasoRecepcion;
      clienteEditable.value = !!orden.clienteEditableEnBorrador;
      clienteConfirmado.value = true;
      editandoCliente.value = false;
      pasoOrigenEdicion.value = null;
      recordarGuardado();
      paso.value = 3;
      notify.success(
        eraEdicion ? 'Cliente actualizado' : 'Cliente guardado',
        eraEdicion ? 'Volviste al detalle de la recepción.' : 'Ahora registra la solicitud del cliente.'
      );
    } catch (e) {
      notify.error('Error', e.response?.data?.message || 'No se pudo guardar el cliente.');
    } finally {
      guardandoPaso.value = false;
    }
  };

  const cambiarCliente = () => {
    pasoOrigenEdicion.value = null;
    paso.value = 2;
    editandoCliente.value = false;
    clienteConfirmado.value = false;
    clienteEditable.value = false;
    clienteEraNuevo.value = true;
    clienteConsultado.value = false;
    form.value.cliente = clienteVacio();
    errores.value = {};
  };

  const irAEditarCliente = () => {
    pasoOrigenEdicion.value = paso.value;
    paso.value = 2;
    editandoCliente.value = true;
  };

  const empezarEditarClienteEnPaso = () => {
    if (pasoOrigenEdicion.value == null) {
      pasoOrigenEdicion.value = clienteConfirmado.value ? 3 : 2;
    }
    editandoCliente.value = true;
  };

  const cancelarEdicionCliente = () => {
    const origen = pasoOrigenEdicion.value;
    editandoCliente.value = false;
    pasoOrigenEdicion.value = null;
    if (origen != null && origen >= 3 && clienteConfirmado.value) paso.value = 3;
  };

  return {
    onCambioNombre,
    onCambioBusqueda,
    consultarCliente,
    consultandoDocumento,
    aplicarCliente,
    guardarPasoCliente,
    cambiarCliente,
    irAEditarCliente,
    empezarEditarClienteEnPaso,
    cancelarEdicionCliente,
  };
}
