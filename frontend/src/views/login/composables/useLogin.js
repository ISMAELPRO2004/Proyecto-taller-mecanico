import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/auth.js';
import { notify } from '../../../utils/alerts.js';

export function useLogin() {
  const username = ref('');
  const password = ref('');
  const verClave = ref(false);
  const cargando = ref(false);
  const auth = useAuthStore();
  const router = useRouter();

  const entrar = async () => {
    cargando.value = true;
    const ok = await auth.login(username.value, password.value);
    if (ok) {
      notify.success('¡Bienvenido!', 'Acceso concedido al sistema.');
      router.push('/home');
    } else {
      notify.error('Error', 'Credenciales incorrectas. Intente de nuevo.');
    }
    cargando.value = false;
  };

  return { username, password, verClave, cargando, entrar };
}
