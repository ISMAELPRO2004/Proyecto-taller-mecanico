import { computed } from 'vue';
import { puedeEditar, puedeEliminar, puedeAceptar, puedeCancelarTerminado } from '../composables/usePermisosOrden.js';
import { useAuthStore } from '../../../../stores/auth.js';
import { puedeVerPrecios, recepcionPendiente, puedeImprimir, mostrarAlertaFactura } from '../../../../utils/roles.js';
import { ESTADO, ESTADOS_CERRADOS } from '../../../../constants/estadosOrden.js';

const ROLES_TALLER = ['ADMIN', 'SUPERVISOR', 'TECNICO'];
const ROLES_ACEPTAR = ['ADMIN', 'SUPERVISOR'];

export function useTablaOrdenes() {
  const auth = useAuthStore();
  const verPrecios = computed(() => puedeVerPrecios(auth.usuario?.rol));
  const puedeVerImprimir = computed(() => puedeImprimir(auth.usuario?.rol));
  const esAdmin = computed(() => auth.usuario?.rol === 'ADMIN');
  const verFacturaPendiente = (o) => mostrarAlertaFactura(o, auth.usuario?.rol);

  const mostrarEditar = (o) => {
    if (!puedeEditar(o)) return false;
    if (o.estado === ESTADO.EN_ESPERA) return true;
    return ROLES_TALLER.includes(auth.usuario?.rol);
  };

  const mostrarAceptar = (o) => puedeAceptar(o) && ROLES_ACEPTAR.includes(auth.usuario?.rol);
  const mostrarEliminar = (o) => puedeEliminar(o, auth.usuario?.rol);
  const mostrarCancelar = (o) => esAdmin.value && puedeCancelarTerminado(o);
  const mostrarFactura = (o) => esAdmin.value && o.estado === ESTADO.CANCELADO;
  const ordenBloqueada = (o) => ESTADOS_CERRADOS.includes(o.estado);

  return {
    verPrecios,
    puedeVerImprimir,
    verFacturaPendiente,
    mostrarEditar,
    mostrarAceptar,
    mostrarEliminar,
    mostrarCancelar,
    mostrarFactura,
    ordenBloqueada,
    recepcionPendiente,
  };
}
