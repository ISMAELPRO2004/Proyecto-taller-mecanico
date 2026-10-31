import { ref, watch, onBeforeUnmount } from 'vue';
import { usuarioService } from '../../../../services/usuarioService.js';

export function useFotosLog(props, data) {
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

  return { vistaAnterior, vistaNueva, vistaAmpliada, cargandoFotos };
}
