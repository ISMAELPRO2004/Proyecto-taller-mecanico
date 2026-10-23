import { Package } from 'lucide-vue-next';
import { catalogoService, endpoints } from '../../../services/catalogoService.js';

export const categoriaRepuestos = {
  id: 'materiales',
  label: 'Repuestos',
  singular: 'Material',
  icon: Package,
  mostrarResponsable: false,
  listar: () => catalogoService.listarMateriales(),
  endpoint: endpoints.materiales,
};
