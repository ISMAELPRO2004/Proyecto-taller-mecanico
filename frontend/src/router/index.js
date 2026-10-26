/**
 * Capas: ruta → vista (compone la pantalla) → composable (reglas) → service (HTTP).
 * Cada pantalla vive en views/<funcionalidad>, con sus partes en subcarpetas.
 */
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const routes = [
  {
    path: '/',
    redirect: () => (localStorage.getItem('token') ? '/home' : '/login'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login/LoginView.vue'),
  },
  {
    path: '/home',
    name: 'dashboard',
    component: () => import('../views/dashboard/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/usuarios',
    name: 'usuarios-logs',
    component: () => import('../views/seguridad/SeguridadView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' },
  },
  {
    path: '/catalogos',
    name: 'catalogos-maestros',
    component: () => import('../views/inventario/CatalogosView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN', 'SUPERVISOR'] },
  },
  {
    path: '/registros',
    name: 'registros-maestros',
    component: () => import('../views/registros/RegistrosView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' },
  },
  {
    path: '/ordenes',
    name: 'listado-ordenes',
    component: () => import('../views/ordenes/listado/ListadoOrdenesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/ordenes/nueva',
    name: 'nueva-orden',
    component: () => import('../views/ordenes/creacion/NuevaOrdenView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA'],
    },
  },
  {
    path: '/ordenes/editar/:id',
    name: 'editar-orden',
    component: () => import('../views/ordenes/creacion/NuevaOrdenView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA'],
    },
  },
  {
    path: '/ordenes/taller/:id',
    name: 'taller-orden',
    component: () => import('../views/ordenes/TallerOrdenView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'SUPERVISOR', 'TECNICO'],
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.token) {
    next({ name: 'login', replace: true });
    return;
  }

  if (to.name === 'login' && auth.token) {
    next({ name: 'dashboard', replace: true });
    return;
  }

  const rol = auth.usuario?.rol;
  if (to.meta.role && rol !== to.meta.role) {
    next({ name: 'dashboard', replace: true });
    return;
  }
  if (to.meta.roles && !to.meta.roles.includes(rol)) {
    next({ name: 'dashboard', replace: true });
    return;
  }

  next();
});

export default router;
