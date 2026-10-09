import { servicioService } from '../services/catalogoService.js';
import { crearControladorCatalogo } from './catalogoController.js';

const catalogo = crearControladorCatalogo(servicioService);

export const listarServicios = catalogo.listar;
export const crearServicio = catalogo.crear;
export const actualizarServicio = catalogo.actualizar;
export const eliminarServicio = catalogo.eliminar;
