import { materialService } from '../services/catalogoService.js';
import { crearControladorCatalogo } from './catalogoController.js';

const catalogo = crearControladorCatalogo(materialService);

export const listarMateriales = catalogo.listar;
export const crearMaterial = catalogo.crear;
export const actualizarMaterial = catalogo.actualizar;
export const eliminarMaterial = catalogo.eliminar;
