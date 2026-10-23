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
  validar(form) {
    const e = {};
    if (!form.marcaId) e.marcaId = 'Selecciona una marca';
    if (!form.modelo?.trim()) e.modelo = 'El modelo es obligatorio';
    if (form.kilometraje !== '' && form.kilometraje != null && Number(form.kilometraje) < 0) {
      e.kilometraje = 'El kilometraje no puede ser negativo';
    }
    if (form.horometro !== '' && form.horometro != null && Number(form.horometro) < 0) {
      e.horometro = 'El horómetro no puede ser negativo';
    }
    return e;
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
