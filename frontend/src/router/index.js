import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    // Importación dinámica para mejorar la carga
    component: () => import('../modules/auth/LoginView.vue')
  },
  {
    path: '/logs',
    name: 'logs',
    component: () => import('../modules/auth/AuditLogsView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' } // Solo el jefe entra aquí
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guardia de seguridad: No pasan si no están logueados
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  
  if (to.meta.requiresAuth && !auth.token) {
    next('/login');
  } else if (to.meta.role && auth.usuario?.rol !== to.meta.role) {
    // Si intenta entrar a logs pero no es ADMIN, lo mandamos afuera
    next('/login');
  } else {
    next();
  }
});

export default router;