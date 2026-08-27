import Swal from 'sweetalert2';

const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2800,
  timerProgressBar: true,
  customClass: {
    popup: 'lyer-toast'
  },
  didOpen: (el) => {
    el.style.zIndex = '99999';
  }
});

export const notify = {
  success: (title, text) => toast.fire({
    icon: 'success',
    title: text ? `${title}: ${text}` : title
  }),

  error: (title, text) => toast.fire({
    icon: 'error',
    title: text ? `${title}: ${text}` : title,
    timer: 4000
  }),

  /** Confirmaciones sí se mantienen como modal (acciones destructivas) */
  confirm: async (title, text) => {
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#064e3b',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    });
    return result.isConfirmed;
  }
};
