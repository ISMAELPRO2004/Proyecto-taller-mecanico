import { Wrench } from 'lucide-vue-next';
import { catalogoService, endpoints } from '../../../services/catalogoService.js';

export const categoriaServicios = {
  id: 'servicios',
  label: 'Servicios',
  singular: 'Servicio',
  icon: Wrench,
  mostrarResponsable: false,
  listar: () => catalogoService.listarServicios(),
  endpoint: endpoints.servicios,
};
