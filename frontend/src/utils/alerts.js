import Swal from 'sweetalert2';

export const notify = {
  success: (title, text) => Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#064e3b',
    timer: 3000
  }),
  error: (title, text) => Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#064e3b'
  }),
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