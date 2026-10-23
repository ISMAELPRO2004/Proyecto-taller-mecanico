import { ref } from 'vue';
import { usuarioService } from '../../../../services/usuarioService.js';
import { notify } from '../../../../utils/alerts.js';

export function useUsuarios(loading) {
  const usuarios = ref([]);
  const modalOpen = ref(false);
  const editando = ref(false);
  const form = ref({
    id: null, nombreCompleto: '', username: '', password: '', rol: 'RECEPCIONISTA',
  });

  const cargarUsuarios = async () => {
    loading.value = true;
    try {
      usuarios.value = await usuarioService.listar();
    } catch {
      notify.error('Error', 'No se pudo cargar la lista de usuarios.');
    } finally {
      loading.value = false;
    }
  };

  const abrirCrear = () => {
    editando.value = false;
    form.value = { id: null, nombreCompleto: '', username: '', password: '', rol: 'RECEPCIONISTA' };
    modalOpen.value = true;
  };

  const abrirEditar = (u) => {
    editando.value = true;
    form.value = { id: u.id, nombreCompleto: u.nombreCompleto, username: u.username, password: '', rol: u.rol };
    modalOpen.value = true;
  };

  const guardarUsuario = async () => {
    if (!form.value.nombreCompleto?.trim()) {
      return notify.error('Revisa los datos', 'Nombre y apellido obligatorio.');
    }
    if (!form.value.username?.trim()) {
      return notify.error('Revisa los datos', 'El usuario es obligatorio.');
    }
    if (!editando.value && (form.value.password || '').length < 6) {
      return notify.error('Revisa los datos', 'La contraseña debe tener mínimo 6 caracteres.');
    }
    if (editando.value && form.value.password && form.value.password.length < 6) {
      return notify.error('Revisa los datos', 'La contraseña debe tener mínimo 6 caracteres.');
    }
    try {
      if (editando.value) {
        await usuarioService.editar(form.value.id, form.value);
        notify.success('¡Actualizado!', 'Perfil modificado correctamente.');
      } else {
        await usuarioService.crear(form.value);
        notify.success('¡Creado!', 'Nuevo usuario registrado.');
      }
      modalOpen.value = false;
      cargarUsuarios();
    } catch (e) {
      notify.error('Error', e.response?.data?.error || 'No se pudo procesar la solicitud.');
    }
  };

  const toggleUsuario = async (u) => {
    const accion = u.activo ? 'desactivar' : 'activar';
    const ok = await notify.confirm(
      `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      `El usuario ${u.nombreCompleto} ${u.activo ? 'ya no podrá' : 'podrá nuevamente'} ingresar al sistema.`
    );
    if (!ok) return;
    try {
      await usuarioService.toggleActivo(u.id);
      notify.success('¡Listo!', `Usuario ${accion === 'desactivar' ? 'desactivado' : 'activado'}.`);
      cargarUsuarios();
    } catch {
      notify.error('Error', 'Operación no permitida.');
    }
  };

  const eliminarUsuario = async (u) => {
    const ok = await notify.confirm(
      '¿Eliminar usuario permanentemente?',
      `${u.nombreCompleto} será borrado del sistema. Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    try {
      await usuarioService.eliminar(u.id);
      notify.success('Eliminado', 'Usuario borrado del sistema.');
      cargarUsuarios();
    } catch (e) {
      notify.error('Error', e.response?.data?.error || 'No se pudo eliminar. Puede tener registros asociados.');
    }
  };

  return {
    usuarios,
    modalOpen,
    editando,
    form,
    cargarUsuarios,
    abrirCrear,
    abrirEditar,
    guardarUsuario,
    toggleUsuario,
    eliminarUsuario,
  };
}
