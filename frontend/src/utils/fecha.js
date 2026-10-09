/** Fecha y hora local, con segundos: 08/10/2026 14:41:05 */
export const fechaHora = (valor) => {
  if (!valor) return '—';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return String(valor);
  const dos = (n) => String(n).padStart(2, '0');
  return `${dos(fecha.getDate())}/${dos(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}:${dos(fecha.getSeconds())}`;
};
