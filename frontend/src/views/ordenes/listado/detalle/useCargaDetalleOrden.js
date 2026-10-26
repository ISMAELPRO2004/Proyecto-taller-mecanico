import { ref, watch } from 'vue';
import { ordenService } from '../../../../services/ordenService.js';

export function useCargaDetalleOrden(props, tiposFoto = ['registro', 'desarrollo']) {
  const orden = ref(null);
  const loading = ref(false);
  const fotos = ref({ registro: '', desarrollo: '' });

  const revocarFotos = () => {
    if (fotos.value.registro) URL.revokeObjectURL(fotos.value.registro);
    if (fotos.value.desarrollo) URL.revokeObjectURL(fotos.value.desarrollo);
    fotos.value = { registro: '', desarrollo: '' };
  };

  const cargarFoto = async (tipo, ruta) => {
    if (!ruta || !props.ordenId) return;
    try {
      const blob = await ordenService.descargarFoto(props.ordenId, tipo);
      if (fotos.value[tipo]) URL.revokeObjectURL(fotos.value[tipo]);
      fotos.value[tipo] = URL.createObjectURL(blob);
    } catch {
      fotos.value[tipo] = '';
    }
  };

  const cargarDetalle = async () => {
    if (!props.ordenId) return;
    loading.value = true;
    try {
      orden.value = await ordenService.obtener(props.ordenId);
      await Promise.all(
        tiposFoto.map((tipo) => {
          const ruta = tipo === 'registro' ? orden.value.fotoRegistro : orden.value.fotoDesarrollo;
          return cargarFoto(tipo, ruta);
        })
      );
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    } finally {
      loading.value = false;
    }
  };

  watch(
    () => [props.isOpen, props.ordenId],
    ([abierto]) => {
      if (abierto) cargarDetalle();
      else {
        orden.value = null;
        revocarFotos();
      }
    }
  );

  return { orden, loading, fotos };
}
