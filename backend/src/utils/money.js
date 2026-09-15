/** Convierte Decimal/cadena a céntimos enteros para evitar errores de punto flotante */
export const aCentimos = (val) => Math.round(parseFloat(val || 0) * 100);

export const calcularTotalOrden = ({ materiales = [], servicios = [], terceros = [] }) => {
  const totalMat = materiales.reduce(
    (acc, m) => acc + aCentimos(m.cantidad) * aCentimos(m.precioAlMomento),
    0
  );
  const totalServ = servicios.reduce((acc, s) => acc + aCentimos(s.monto), 0);
  const totalTerc = terceros.reduce((acc, t) => acc + aCentimos(t.monto), 0);
  return (totalMat + totalServ + totalTerc) / 100;
};
