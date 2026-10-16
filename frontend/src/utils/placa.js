export const FORMATO_PLACA = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/;
export const MENSAJE_FORMATO_PLACA = 'La placa debe tener el formato aaa-aaa';

/** Inserta el guion al escribir el cuarto carácter. Si se borra, no lo vuelve a poner. */
export const formatearPlacaEscrita = (anterior, entrada) => {
  const upper = String(entrada || '').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const prev = String(anterior || '').toUpperCase();
  const alnumNuevo = upper.replace(/-/g, '');
  const alnumPrev = prev.replace(/-/g, '');
  const borrando = alnumNuevo.length < alnumPrev.length || upper.length < prev.length;

  if (borrando) return upper.slice(0, 7);

  const letras = alnumNuevo.slice(0, 6);
  if (letras.length <= 3) return letras;
  return `${letras.slice(0, 3)}-${letras.slice(3)}`;
};

/** Avisa si el texto ya no puede ser aaa-aaa. Un prefijo a medias no es error. */
export const errorPlacaEnCurso = (valor) => {
  const v = String(valor || '').toUpperCase();
  if (!v || FORMATO_PLACA.test(v)) return '';
  if (/^[A-Z0-9]{1,3}$/.test(v)) return '';
  if (/^[A-Z0-9]{3}-[A-Z0-9]{0,2}$/.test(v)) return '';
  return MENSAJE_FORMATO_PLACA;
};
