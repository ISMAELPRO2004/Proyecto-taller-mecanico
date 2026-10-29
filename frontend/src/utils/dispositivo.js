/** Celular o tablet: van a cámara. PC de escritorio: teclado. */
export const esDispositivoMovil = () => {
  if (typeof navigator === 'undefined') return false;
  if (navigator.userAgentData?.mobile) return true;
  return /Android|webOS|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
};
