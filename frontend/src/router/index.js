import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const routes = [
  {
    path: '/',
    redirect: '/home' // Redirigimos al Dashboard por defecto si ya está logueado
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginView.vue')
  },
  {
    path: '/home',
    name: 'dashboard',
    component: () => import('../views/home/DashboardView.vue'), // Ajustado a tu nueva estructura
    meta: { requiresAuth: true }
  },
  {
    /* Ruta Consolidada: Aquí manejas Usuarios y Logs en un solo lugar. 
       Solo los ADMIN pueden ver esta sección de control total. 
    */
    path: '/usuarios',
    name: 'usuarios-logs',
    component: () => import('../views/auth/UserManagementView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/catalogos',
    name: 'catalogos-maestros',
    component: () => import('../views/inventario/CatalogosView.vue'), // Ajustado según tu captura
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/ordenes',
    name: 'listado-ordenes',
    component: () => import('../views/ordenes/OrdenesListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ordenes/nueva',
    name: 'nueva-orden',
    component: () => import('../views/ordenes/NuevaOrdenView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/ordenes/editar/:id', // Ruta para edición
    name: 'editar-orden',
    component: () => import('../views/ordenes/NuevaOrdenView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guardia de seguridad: Verificación de Token y Roles
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  
  if (to.meta.requiresAuth && !auth.token) {
    next('/login');
  } else if (to.meta.role && auth.usuario?.rol !== to.meta.role) {
    // Si no es ADMIN, lo devolvemos al Home en lugar de sacarlo al Login
    next('/home');
  } else {
    next();
  }
});

export default router;