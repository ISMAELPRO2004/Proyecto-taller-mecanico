import { ref, computed, onMounted } from 'vue';
import { ordenService } from '../../../services/ordenService.js';
import { ESTADO } from '../../../constants/estadosOrden.js';

export function useDashboard() {
  const cargando = ref(true);
  const ordenes = ref([]);
  const ordenesRecientes = ref([]);

  // Mes actual por defecto en formato "YYYY-MM" (ej. "2026-11")
  const hoy = new Date();
  const mesPorDefecto = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  const mesSeleccionado = ref(mesPorDefecto);

  // Filtra las órdenes según el mes seleccionado usando fechaCreacion de Prisma
  const ordenesDelMes = computed(() => {
    if (!mesSeleccionado.value) return ordenes.value;
    return ordenes.value.filter((o) => {
      if (!o.fechaCreacion) return false;
      const fecha = new Date(o.fechaCreacion);
      const anioMes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      return anioMes === mesSeleccionado.value;
    });
  });

  // Estadísticas calculadas automáticamente para el mes seleccionado
  const stats = computed(() => {
    const lista = ordenesDelMes.value;
    return {
      total: lista.length,
      enReparacion: lista.filter((o) => o.estado === ESTADO.EN_REPARACION).length,
      esperandoRepuesto: lista.filter((o) => o.estado === ESTADO.ESPERANDO_REPUESTO).length,
      cambioAceite: lista.filter((o) => o.estado === ESTADO.CAMBIO_ACEITE).length,
      terminadas: lista.filter((o) => o.estado === ESTADO.TERMINADO).length,
      canceladas: lista.filter((o) => o.estado === ESTADO.CANCELADO).length,
    };
  });

  const cargar = async () => {
    cargando.value = true;
    try {
      const data = await ordenService.listar();
      ordenes.value = data;
      ordenesRecientes.value = data.slice(0, 5);
    } catch (e) {
      console.error('Error dashboard:', e);
    } finally {
      cargando.value = false;
    }
  };

  onMounted(cargar);

  return {
    cargando,
    ordenes,
    stats,
    ordenesRecientes,
    mesSeleccionado,
  };
}