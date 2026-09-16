import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginView.vue'),
  },
  {
    path: '/home',
    name: 'dashboard',
    component: () => import('../views/home/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/usuarios',
    name: 'usuarios-logs',
    component: () => import('../views/auth/UserManagementView.vue'),
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
    component: () => import('../views/ordenes/OrdenesListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/ordenes/nueva',
    name: 'nueva-orden',
    component: () => import('../views/ordenes/NuevaOrdenView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA'],
    },
  },
  {
    path: '/ordenes/editar/:id',
    name: 'editar-orden',
    component: () => import('../views/ordenes/NuevaOrdenView.vue'),
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
    next('/login');
    return;
  }

  const rol = auth.usuario?.rol;
  if (to.meta.role && rol !== to.meta.role) {
    next('/home');
    return;
  }
  if (to.meta.roles && !to.meta.roles.includes(rol)) {
    next('/home');
    return;
  }

  next();
});

export default router;
