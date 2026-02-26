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
    component: () => import('../views/auth/LoginView.vue')
  },
  {
    path: '/logs',
    name: 'logs',
    component: () => import('../views/auth/AuditLogsView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' } // Solo el jefe entra aquí
  },
  {
    path: '/usuarios/nuevo',
    name: 'nuevo-usuario',
    component: () => import('../views/auth/UserManagementView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/home',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/catalogos',
    name: 'catalogos-maestros',
    component: () => import('../views/CatalogosView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/ordenes',
    name: 'ordenes-ot',
    component: () => import('../views/ordenes/OrdenesListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ordenes/nueva',
    name: 'nueva-orden',
    component: () => import('../views/ordenes/NuevaOrdenView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
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