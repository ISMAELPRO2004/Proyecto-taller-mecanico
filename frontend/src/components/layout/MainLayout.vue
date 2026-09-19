<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { 
  LayoutDashboard, Users, ClipboardList, 
  Package, ChevronLeft, Menu, LogOut, X, Database
} from 'lucide-vue-next';

const router = useRouter();
const route  = useRoute();
const auth = useAuthStore();

const sidebarOpen      = ref(false);
const isCollapsed      = ref(false);

const menuItems = computed(() => {
  const rol = auth.usuario?.rol;
  const items = [
    { name: 'Dashboard', path: '/home', icon: LayoutDashboard },
    { name: 'Listado de Órdenes', path: '/ordenes', icon: ClipboardList },
  ];
  if (rol === 'ADMIN' || rol === 'SUPERVISOR') {
    items.push({ name: 'Inventario', path: '/catalogos', icon: Package });
  }
  if (rol === 'ADMIN') {
    items.push({ name: 'Registros', path: '/registros', icon: Database });
    items.push({ name: 'Usuarios & Logs', path: '/usuarios', icon: Users });
  }
  return items;
});

// Cerrar drawer al navegar en móvil
watch(() => route.path, () => { sidebarOpen.value = false; });

const logout = () => {
  auth.logout();
  router.push('/login');
};

const nombreUsuario = computed(() =>
  auth.usuario?.nombre || auth.usuario?.username || 'Usuario'
);

const etiquetaRol = computed(() => {
  const map = {
    ADMIN: 'Administrador',
    SUPERVISOR: 'Supervisor',
    TECNICO: 'Técnico',
    RECEPCIONISTA: 'Recepcionista',
  };
  return map[auth.usuario?.rol] || auth.usuario?.rol || '';
});

const routeTitle = (name) => {
  const map = {
    'dashboard':       'Dashboard',
    'listado-ordenes': 'Listado Órdenes',
    'nueva-orden':     'Nueva Orden',
    'editar-orden':    'Editar Orden',
    'taller-orden':    'Orden de trabajo',
    'catalogos-maestros': 'Inventario',
    'registros-maestros': 'Registros',
    'usuarios-logs':   'Usuarios & Logs',
  };
  return map[name] || name?.replace(/-/g, ' ') || '';
};
</script>

<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden" data-theme="lyer">

    <!-- ── OVERLAY móvil ─────────────────────────────────────────────────── -->
    <Transition name="fade">
      <div v-if="sidebarOpen"
        class="fixed inset-0 bg-black/50 z-30 lg:hidden"
        @click="sidebarOpen = false" />
    </Transition>

    <!-- ── SIDEBAR ────────────────────────────────────────────────────────── -->
    <aside :class="[
      'fixed lg:relative inset-y-0 left-0 z-40',
      'bg-lyer-green text-white flex flex-col shadow-xl',
      'transition-all duration-300',
      // Desktop: expandido o colapsado
      'lg:translate-x-0',
      isCollapsed ? 'lg:w-20' : 'lg:w-64',
      // Móvil: drawer fuera/dentro de pantalla
      sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72 lg:translate-x-0',
    ]">

      <!-- Logo + toggle -->
      <div class="p-5 flex items-center justify-between shrink-0">
        <h1 v-if="!isCollapsed || sidebarOpen"
          class="text-xl font-black italic tracking-tighter whitespace-nowrap">
          LYER <span class="text-lyer-accent">MOTORS</span>
        </h1>
        <!-- En desktop: colapsar sidebar -->
        <button @click="isCollapsed = !isCollapsed"
          class="hidden lg:flex w-8 h-8 rounded hover:bg-lyer-accent/20 transition-colors items-center justify-center shrink-0">
          <Menu class="w-5 h-5" />
        </button>
        <!-- En móvil: cerrar drawer -->
        <button @click="sidebarOpen = false"
          class="lg:hidden w-8 h-8 rounded hover:bg-lyer-accent/20 transition-colors flex items-center justify-center shrink-0">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 mt-2 px-3 space-y-1 overflow-y-auto">
        <router-link v-for="item in menuItems" :key="item.path" :to="item.path"
          :class="[
            'flex items-center p-3 rounded-xl transition-colors',
            'hover:bg-lyer-accent/20',
            route.path === item.path || (item.path !== '/home' && route.path.startsWith(item.path))
              ? 'bg-lyer-accent text-lyer-green font-bold'
              : 'text-slate-200',
          ]">
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span v-if="!isCollapsed || sidebarOpen"
            class="ml-3 text-sm truncate">{{ item.name }}</span>
        </router-link>
      </nav>

      <!-- Usuario + Logout -->
      <div class="p-3 border-t border-lyer-accent/20 shrink-0 space-y-2">
        <div
          v-if="!isCollapsed || sidebarOpen"
          class="px-3 py-2 rounded-xl bg-lyer-accent/10"
        >
          <p class="text-sm font-black text-white truncate leading-tight">{{ nombreUsuario }}</p>
          <p class="text-[10px] font-bold uppercase tracking-widest text-lyer-accent mt-0.5">{{ etiquetaRol }}</p>
        </div>
        <div
          v-else
          class="flex justify-center"
          :title="`${nombreUsuario} · ${etiquetaRol}`"
        >
          <div class="w-9 h-9 rounded-full bg-lyer-accent/20 text-lyer-accent flex items-center justify-center text-xs font-black">
            {{ (nombreUsuario || '?').charAt(0).toUpperCase() }}
          </div>
        </div>
        <button @click="logout"
          class="flex items-center w-full p-3 text-red-300 hover:bg-red-900/20 rounded-xl transition-colors">
          <LogOut class="w-5 h-5 shrink-0" />
          <span v-if="!isCollapsed || sidebarOpen" class="ml-3 text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <!-- ── CONTENIDO PRINCIPAL ─────────────────────────────────────────── -->
    <main class="flex-1 flex flex-col overflow-hidden min-w-0">

      <!-- Header -->
      <header class="h-14 bg-white border-b flex items-center justify-between px-4 shadow-sm shrink-0">
        <div class="flex items-center gap-3">
          <!-- Hamburguesa — solo móvil -->
          <button @click="sidebarOpen = true"
            class="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
            <Menu class="w-5 h-5 text-lyer-green" />
          </button>
          <!-- Volver — si no es home -->
          <button v-if="route.path !== '/home'"
            @click="router.back()"
            class="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
            <ChevronLeft class="w-5 h-5 text-lyer-green" />
          </button>
          <h2 class="text-sm font-bold text-slate-700 capitalize truncate max-w-[160px] sm:max-w-none">
            {{ routeTitle(route.name) }}
          </h2>
        </div>
        <div class="bg-lyer-green text-white px-3 py-1.5 rounded-lg font-bold text-xs shrink-0">
          {{ new Date().toLocaleDateString('es-PE') }}
        </div>
      </header>

      <!-- Vista -->
      <section class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <router-view />
      </section>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>