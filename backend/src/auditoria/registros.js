import { registrarEventos } from './guardar.js';
import {
  eventoNuevo,
  eventoCambio,
  eventoBorrado,
  filasPresentes,
  filasDeCliente,
  cambiosDeCliente,
  filasDeVehiculo,
  cambiosDeVehiculo,
} from './eventos.js';

const cambiosDeMarca = (antes, despues) => (
  antes.nombre === despues.nombre
    ? []
    : [{ etiqueta: 'Nombre', de: antes.nombre, a: despues.nombre }]
);

export const auditarMarca = {
  crear: (req, marca) => registrarEventos(req, [
    eventoNuevo('CREAR MARCA', marca.nombre, filasPresentes([['Nombre', marca.nombre]])),
  ]),
  editar: (req, antes, marca) => registrarEventos(req, [
    eventoCambio('EDITAR MARCA', marca.nombre, cambiosDeMarca(antes, marca)),
  ]),
  eliminar: (req, marca) => registrarEventos(req, [
    eventoBorrado('ELIMINAR MARCA', marca.nombre, filasPresentes([['Nombre', marca.nombre]])),
  ]),
};

export const auditarCliente = {
  guardar: (req, { anterior, cliente }) => registrarEventos(req, [
    anterior
      ? eventoCambio('EDITAR CLIENTE', cliente.nombreRazonSocial, cambiosDeCliente(anterior, cliente))
      : eventoNuevo('CREAR CLIENTE', cliente.nombreRazonSocial, filasDeCliente(cliente)),
  ]),
  editar: (req, antes, cliente) => registrarEventos(req, [
    eventoCambio('EDITAR CLIENTE', cliente.nombreRazonSocial, cambiosDeCliente(antes, cliente)),
  ]),
  eliminar: (req, cliente) => registrarEventos(req, [
    eventoBorrado('ELIMINAR CLIENTE', cliente.nombreRazonSocial, filasDeCliente(cliente)),
  ]),
};

export const auditarVehiculo = {
  guardar: (req, { anterior, vehiculo }) => registrarEventos(req, [
    anterior
      ? eventoCambio('EDITAR VEHÍCULO', vehiculo.placa, cambiosDeVehiculo(anterior, vehiculo))
      : eventoNuevo('CREAR VEHÍCULO', vehiculo.placa, filasDeVehiculo(vehiculo)),
  ]),
  editar: (req, antes, vehiculo) => registrarEventos(req, [
    eventoCambio('EDITAR VEHÍCULO', vehiculo.placa, cambiosDeVehiculo(antes, vehiculo)),
  ]),
  eliminar: (req, vehiculo) => registrarEventos(req, [
    eventoBorrado('ELIMINAR VEHÍCULO', vehiculo.placa, filasDeVehiculo(vehiculo)),
  ]),
};
