import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/auth.js';
import { notify } from '../../../utils/alerts.js';

const CLAVE_AVISO = 'lyer.aviso.login';

export function useLogin() {
  const nombreUsuario = ref('');
  const contrasena = ref('');
  const verClave = ref(false);
  const cargando = ref(false);
  const auth = useAuthStore();
  const router = useRouter();

  onMounted(() => {
    const aviso = sessionStorage.getItem(CLAVE_AVISO);
    if (!aviso) return;
    sessionStorage.removeItem(CLAVE_AVISO);
    notify.info('Sesión cerrada', aviso);
  });

  const entrar = async () => {
    cargando.value = true;
    const ok = await auth.login(nombreUsuario.value, contrasena.value);
    if (ok) {
      notify.success('¡Bienvenido!', 'Acceso concedido al sistema.');
      router.push('/home');
    } else {
      notify.error('Error', 'Credenciales incorrectas. Intente de nuevo.');
    }
    cargando.value = false;
  };

  return { nombreUsuario, contrasena, verClave, cargando, entrar };
}
