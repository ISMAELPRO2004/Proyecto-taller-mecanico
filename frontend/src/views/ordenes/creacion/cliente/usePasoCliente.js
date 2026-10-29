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
    modoBusquedaCliente,
  } = ctx;

  const buscandoDocumento = ref(false);

  const cambiarModoBusqueda = (modo) => {
    modoBusquedaCliente.value = modo === 'nombre' ? 'nombre' : 'documento';
    clienteConsultado.value = false;
    clienteEraNuevo.value = true;
    editandoCliente.value = false;
    form.value.cliente = clienteVacio({
      tipoDocumento: modoBusquedaCliente.value === 'documento' ? form.value.cliente.tipoDocumento : 'DNI',
    });
    errores.value = { ...errores.value, nombreRazonSocial: '', numeroDocumento: '', tipoDocumento: '' };
  };

  const onCambioNombre = (valor) => {
    const cargado = !clienteEraNuevo.value && (clienteConsultado.value || form.value.cliente.id);
    if (cargado) {
      const { tipoCliente, tipoDocumento } = form.value.cliente;
      form.value.cliente = clienteVacio({ nombreRazonSocial: valor, tipoCliente, tipoDocumento });
      clienteEraNuevo.value = true;
      clienteConsultado.value = false;
      editandoCliente.value = false;
      errores.value = { ...errores.value, nombreRazonSocial: '', numeroDocumento: '' };
      return;
    }
    form.value.cliente.nombreRazonSocial = valor;
    if (clienteEraNuevo.value && clienteConsultado.value && !form.value.cliente.id) {
      clienteConsultado.value = false;
    }
    if (valor.trim().length < 2) clienteConsultado.value = false;
  };

  const marcarClienteNuevo = () => {
    const nombre = form.value.cliente.nombreRazonSocial?.trim() || '';
    if (nombre.length < 2) {
      errores.value = { ...errores.value, nombreRazonSocial: 'Escribe el nombre y pulsa Buscar cliente' };
      return;
    }
    errores.value = { ...errores.value, nombreRazonSocial: '' };
    if (clienteEraNuevo.value && clienteConsultado.value && !form.value.cliente.id) return;
    if (form.value.cliente.id || !clienteEraNuevo.value) {
      const { tipoCliente, tipoDocumento } = form.value.cliente;
      form.value.cliente = clienteVacio({ nombreRazonSocial: nombre, tipoCliente, tipoDocumento });
    }
    clienteEraNuevo.value = true;
    clienteConsultado.value = true;
    editandoCliente.value = false;
  };

  const aplicarCliente = (cliente) => {
    form.value.cliente = mapCliente(cliente);
    clienteEraNuevo.value = false;
    clienteConsultado.value = true;
    editandoCliente.value = false;
    const titulo = cliente.tipoCliente === 'EMPRESA' ? 'Empresa registrada' : 'Persona registrada';
    notify.success(titulo, cliente.nombreRazonSocial);
  };

  const consultarCliente = async () => {
    const tipo = form.value.cliente.tipoDocumento === 'RUC' ? 'RUC' : 'DNI';
    const numero = String(form.value.cliente.numeroDocumento || '').replace(/\D/g, '');
    const largo = tipo === 'RUC' ? 11 : 8;
    if (numero.length !== largo) {
      errores.value = { ...errores.value, numeroDocumento: `${tipo}: ${largo} dígitos` };
      return;
    }
    errores.value = { ...errores.value, numeroDocumento: '' };
    buscandoDocumento.value = true;
    try {
      const { fuente, cliente, mensaje } = await clienteService.consultarDocumento(tipo, numero);
      form.value.cliente = mapCliente(cliente);
      clienteConsultado.value = true;
      clienteEraNuevo.value = fuente !== 'local';
      editandoCliente.value = false;
      if (fuente === 'local') {
        notify.success(cliente.tipoCliente === 'EMPRESA' ? 'Empresa registrada' : 'Persona registrada', cliente.nombreRazonSocial);
      } else if (fuente === 'reniec' || fuente === 'sunat') {
        notify.success(fuente === 'sunat' ? 'RUC encontrado' : 'DNI encontrado', cliente.nombreRazonSocial);
      } else {
        notify.info('Sin datos automáticos', mensaje || 'Completa el nombre a mano.');
      }
    } catch (e) {
      notify.error('Consulta', e.response?.data?.message || 'No se pudo consultar el documento.');
    } finally {
      buscandoDocumento.value = false;
    }
  };

  const validarCliente = () => {
    const e = {};
    const { cliente } = form.value;
    const porNombre = modoBusquedaCliente.value === 'nombre';
    if (!clienteConsultado.value) {
      e[porNombre ? 'nombreRazonSocial' : 'numeroDocumento'] = porNombre
        ? 'Elige una recomendación o pulsa Buscar cliente'
        : 'Consulta el DNI o RUC';
    } else if (!cliente.nombreRazonSocial?.trim() || cliente.nombreRazonSocial.trim().length < 2) {
      e.nombreRazonSocial = 'Nombre / razón social obligatorio';
    }
    const doc = (cliente.numeroDocumento || '').trim();
    if (!porNombre && !doc) e.numeroDocumento = 'Documento obligatorio';
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
    buscandoDocumento,
    cambiarModoBusqueda,
    onCambioNombre,
    marcarClienteNuevo,
    consultarCliente,
    aplicarCliente,
    guardarPasoCliente,
    cambiarCliente,
    irAEditarCliente,
    empezarEditarClienteEnPaso,
    cancelarEdicionCliente,
  };
}
