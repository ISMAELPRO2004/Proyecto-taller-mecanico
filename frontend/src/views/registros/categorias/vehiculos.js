import { vehiculoService } from '../../../services/vehiculoService.js';

export const categoriaVehiculos = {
  id: 'vehiculos',
  label: 'Vehículos',
  filtrar(lista, q) {
    return lista.filter((v) =>
      !q
      || v.placa.toLowerCase().includes(q)
      || v.modelo.toLowerCase().includes(q)
      || v.marca?.nombre?.toLowerCase().includes(q)
    );
  },
  formDesde(item) {
    return {
      placa: item.placa,
      marcaId: item.marcaId,
      modelo: item.modelo,
      kilometraje: item.kilometraje,
      horometro: item.horometro,
    };
  },
  guardar(form) {
    return vehiculoService.actualizar(form.placa, {
      marcaId: Number(form.marcaId),
      modelo: form.modelo,
      kilometraje: form.kilometraje === '' ? null : form.kilometraje,
      horometro: form.horometro === '' ? null : form.horometro,
    });
  },
  eliminar(item) {
    return vehiculoService.eliminar(item.placa);
  },
};
