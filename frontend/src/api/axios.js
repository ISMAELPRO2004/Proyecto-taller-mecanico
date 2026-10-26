import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = String(error.config?.url || '');
    const esLogin = url.includes('/auth/login');

    const cuerpo = error.response?.data;
    const esApi = cuerpo && typeof cuerpo === 'object' && (cuerpo.error || cuerpo.message);
    if (error.response?.status === 401 && !esLogin && esApi) {
      if (cuerpo.error === 'SESION_REEMPLAZADA') {
        sessionStorage.setItem(
          'lyer.aviso.login',
          'Se inició sesión en otro dispositivo. Esta sesión se cerró.'
        );
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
