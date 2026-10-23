import { Truck } from 'lucide-vue-next';
import { catalogoService, endpoints } from '../../../services/catalogoService.js';

export const categoriaTerceros = {
  id: 'terceros',
  label: 'Terceros',
  singular: 'Tercero',
  icon: Truck,
  mostrarResponsable: true,
  listar: () => catalogoService.listarTerceros(),
  endpoint: endpoints.terceros,
};
