import { terceroService } from '../services/catalogoService.js';
import { crearControladorCatalogo } from './catalogoController.js';

const catalogo = crearControladorCatalogo(terceroService);

export const listarServiciosTerceros = catalogo.listar;
export const crearServicioTercero = catalogo.crear;
export const actualizarServicioTercero = catalogo.actualizar;
export const eliminarServicioTercero = catalogo.eliminar;
