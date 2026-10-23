import { ordenService } from '../../../../services/ordenService.js';
import { notify } from '../../../../utils/alerts.js';
import {
  limpiarBorradorLocal,
  guardarFotoLocal,
  leerFotoLocal,
  borrarFotoLocal,
} from '../../../../utils/borradorRecepcion.js';

export function usePasoRecepcion(ctx) {
  const {
    form,
    errores,
    ordenId,
    fotoSrc,
    archivoRegistro,
    subiendoFoto,
    guardando,
    router,
    claveFoto,
  } = ctx;

  const cargarFotoRegistro = async (id, ruta) => {
    if (fotoSrc.value) URL.revokeObjectURL(fotoSrc.value);
    fotoSrc.value = '';
    if (!ruta || !id) return;
    try {
      const blob = await ordenService.descargarFoto(id, 'registro');
      fotoSrc.value = URL.createObjectURL(blob);
    } catch {
      fotoSrc.value = '';
    }
  };

  const restaurarFotoPendiente = async () => {
    if (form.value.fotoRegistro) {
      await borrarFotoLocal(claveFoto()).catch(() => {});
      return;
    }
    const file = await leerFotoLocal(claveFoto()).catch(() => null);
    if (!file) return;
    archivoRegistro.value = file;
    if (fotoSrc.value) URL.revokeObjectURL(fotoSrc.value);
    fotoSrc.value = URL.createObjectURL(file);
  };

  const alElegirFoto = async (file) => {
    if (!file) return;
    errores.value = { ...errores.value, fotoRegistro: '' };
    archivoRegistro.value = file;
    if (fotoSrc.value?.startsWith('blob:')) URL.revokeObjectURL(fotoSrc.value);
    fotoSrc.value = URL.createObjectURL(file);
    const clave = claveFoto();
    try {
      await guardarFotoLocal(clave, file);
    } catch {
      /* si el navegador no guarda la foto, el envío al finalizar sigue usando el archivo */
    }
    ctx.persistirLocal();
    if (!ordenId.value) return;

    subiendoFoto.value = true;
    try {
      const ordenFoto = await ordenService.subirFoto(ordenId.value, 'registro', file);
      form.value.fotoRegistro = ordenFoto.fotoRegistro || form.value.fotoRegistro;
      archivoRegistro.value = null;
      await borrarFotoLocal(clave).catch(() => {});
      await cargarFotoRegistro(ordenId.value, form.value.fotoRegistro);
    } catch (e) {
      notify.error(
        'No se pudo subir la foto',
        e.response?.data?.message || 'Quedó en este borrador y se reintentará al finalizar.',
      );
    } finally {
      subiendoFoto.value = false;
    }
  };

  const quitarRegistro = async () => {
    archivoRegistro.value = null;
    await borrarFotoLocal(claveFoto()).catch(() => {});
    if (!form.value.fotoRegistro && fotoSrc.value?.startsWith('blob:')) {
      URL.revokeObjectURL(fotoSrc.value);
      fotoSrc.value = '';
      return;
    }
    if (!ordenId.value || !form.value.fotoRegistro) return;
    subiendoFoto.value = true;
    try {
      await ordenService.quitarFoto(ordenId.value, 'registro');
      form.value.fotoRegistro = '';
      if (fotoSrc.value) URL.revokeObjectURL(fotoSrc.value);
      fotoSrc.value = '';
      notify.success('Foto quitada');
    } catch (e) {
      notify.error('No se pudo quitar', e.response?.data?.message);
    } finally {
      subiendoFoto.value = false;
    }
  };

  const validarTrabajo = () => {
    const e = {};
    const { estadoIngreso, observacionIngreso, descripcionInformal } = form.value;
    if (!descripcionInformal?.trim()) {
      e.descripcionInformal = 'Escribe la solicitud del cliente';
    }
    if (!archivoRegistro.value && !form.value.fotoRegistro) {
      e.fotoRegistro = 'La foto de registro inicial es obligatoria';
    }
    if (estadoIngreso === 'OBSERVADO' && !observacionIngreso?.trim()) {
      e.observacionIngreso = 'Describe la observación de ingreso';
    }
    errores.value = e;
    return Object.keys(e).length === 0;
  };

  const completarBorrador = async () => {
    if (!ordenId.value) return;
    if (!validarTrabajo()) {
      return notify.error('Revisa la recepción', 'La solicitud del cliente y la foto inicial son obligatorias.');
    }

    guardando.value = true;
    try {
      if (archivoRegistro.value) {
        subiendoFoto.value = true;
        try {
          const ordenFoto = await ordenService.subirFoto(ordenId.value, 'registro', archivoRegistro.value);
          form.value.fotoRegistro = ordenFoto.fotoRegistro || form.value.fotoRegistro;
          archivoRegistro.value = null;
        } catch (e) {
          notify.error('No se pudo subir la foto', e.response?.data?.message || 'Vuelve a elegirla.');
          return;
        }
      }

      await ordenService.completarRecepcion(ordenId.value, {
        descripcionInformal: form.value.descripcionInformal.trim(),
        estadoIngreso: form.value.estadoIngreso,
        observacionIngreso: form.value.observacionIngreso || null,
      });

      notify.success('Borrador listo', 'La orden quedó en espera de validación.');
      await limpiarBorradorLocal();
      router.push('/ordenes');
    } catch (e) {
      const msg = e.response?.data?.errors?.[0]?.mensaje
        || e.response?.data?.message
        || 'No se pudo guardar.';
      notify.error('Error', msg);
    } finally {
      guardando.value = false;
      subiendoFoto.value = false;
    }
  };

  return {
    cargarFotoRegistro,
    restaurarFotoPendiente,
    alElegirFoto,
    quitarRegistro,
    completarBorrador,
  };
}
