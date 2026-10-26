import Swal from 'sweetalert2';

const posicionToast = () =>
  (typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches)
    ? 'bottom'
    : 'top';

const toast = (opts) => Swal.mixin({
  toast: true,
  position: posicionToast(),
  showConfirmButton: false,
  timer: 2800,
  timerProgressBar: true,
  width: 'auto',
  customClass: {
    popup: 'lyer-toast',
    title: 'lyer-toast-title',
    htmlContainer: 'lyer-toast-text',
  },
  didOpen: (el) => {
    el.style.zIndex = '99999';
  },
  ...opts,
});

const tituloToast = (title, text) => (text ? `${title}: ${text}` : title);

export const notify = {
  success: (title, text) => toast().fire({
    icon: 'success',
    title: tituloToast(title, text),
  }),

  info: (title, text) => toast().fire({
    icon: 'info',
    title: tituloToast(title, text),
  }),

  error: (title, text) => toast({ timer: 4000 }).fire({
    icon: 'error',
    title: tituloToast(title, text),
  }),

  /** Confirmaciones sí se mantienen como modal (acciones destructivas) */
  confirm: async (title, text) => {
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#480078',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      width: 'min(92vw, 24rem)',
      customClass: {
        popup: 'lyer-confirm',
      },
    });
    return result.isConfirmed;
  },
};
