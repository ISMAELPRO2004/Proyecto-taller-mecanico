import { ref, onMounted } from 'vue';
import { ordenService } from '../../../services/ordenService.js';

export function useDashboard() {
  const cargando = ref(true);
  const ordenes = ref([]);
  const stats = ref({
    total: 0,
    enReparacion: 0,
    esperandoRepuesto: 0,
    cambioAceite: 0,
    terminadas: 0,
    canceladas: 0,
  });
  const ordenesRecientes = ref([]);

  const cargar = async () => {
    cargando.value = true;
    try {
      const data = await ordenService.listar();
      ordenes.value = data;
      stats.value = {
        total: data.length,
        enReparacion: data.filter((o) => o.estado === 'EN_REPARACION').length,
        esperandoRepuesto: data.filter((o) => o.estado === 'ESPERANDO_REPUESTO').length,
        cambioAceite: data.filter((o) => o.estado === 'CAMBIO_ACEITE').length,
        terminadas: data.filter((o) => o.estado === 'TERMINADO').length,
        canceladas: data.filter((o) => o.estado === 'CANCELADO').length,
      };
      ordenesRecientes.value = data.slice(0, 5);
    } catch (e) {
      console.error('Error dashboard:', e);
    } finally {
      cargando.value = false;
    }
  };

  onMounted(cargar);

  return { cargando, ordenes, stats, ordenesRecientes };
}
