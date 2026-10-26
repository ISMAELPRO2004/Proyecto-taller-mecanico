<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import {
  LayoutDashboard, Users, ClipboardList,
  Package, ChevronLeft, Menu, LogOut, X, Database, Sun, Moon
} from 'lucide-vue-next';
import { useTemaStore } from '../../stores/tema.js';
import logoEmpresa from '../../assets/logoEmpresa.png';
import iconCamion from '../../assets/iconCamion.svg';

const router = useRouter();
const route  = useRoute();
const auth = useAuthStore();
const tema = useTemaStore();

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
  auth.usuario?.nombre || auth.usuario?.nombreUsuario || 'Usuario'
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

const activo = (path) =>
  route.path === path || (path !== '/home' && route.path.startsWith(path));

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
  <div class="app-shell flex h-screen overflow-hidden bg-lyer-fondo text-lyer-fg" :data-theme="tema.esClaro ? 'lyer-claro' : 'lyer'">

    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-30 bg-black/60 lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <aside :class="[
      'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-lyer-linea2/70 bg-lyer-sidebar text-lyer-fg shadow-[4px_0_24px_rgba(0,0,0,0.45)] transition-all duration-300 lg:relative',
      'lg:translate-x-0',
      isCollapsed ? 'lg:w-20' : 'lg:w-72',
      sidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0',
    ]">
      <div
        :class="[
          'flex shrink-0 items-center border-b border-lyer-linea2/60 bg-lyer-barra',
          isCollapsed && !sidebarOpen ? 'h-auto flex-col gap-2 px-2 py-3 lg:flex' : 'h-20 justify-between gap-2 px-4',
        ]"
      >
        <img
          v-if="!isCollapsed || sidebarOpen"
          :src="logoEmpresa"
          alt="Taller Mecánica LYER"
          class="h-16 w-auto max-w-[220px] object-contain object-left"
        />
        <img
          v-else
          :src="iconCamion"
          alt="LYER"
          class="logo-colapsado mx-auto h-9 w-9 object-contain"
        />
        <button
          class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lyer-cyan/80 transition-colors hover:bg-lyer-hover hover:text-lyer-fg lg:flex"
          :title="isCollapsed ? 'Expandir menú' : 'Colapsar menú'"
          @click="isCollapsed = !isCollapsed"
        >
          <Menu class="h-5 w-5" />
        </button>
        <button
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lyer-cyan/80 transition-colors hover:bg-lyer-hover hover:text-lyer-fg lg:hidden"
          title="Cerrar menú"
          @click="sidebarOpen = false"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <nav class="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-6">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :title="isCollapsed && !sidebarOpen ? item.name : undefined"
          :class="[
            'group flex items-center gap-3.5 px-4 py-3 transition-all',
            activo(item.path)
              ? 'rounded-full bg-lyer-accent font-semibold text-[#1a0633] shadow-[0_0_20px_-3px_rgba(255,96,128,0.45)]'
              : 'rounded-xl font-medium text-lyer-muted hover:bg-lyer-boton hover:text-lyer-fg',
            isCollapsed && !sidebarOpen ? 'lg:justify-center lg:px-3' : '',
          ]"
        >
          <component
            :is="item.icon"
            :class="['h-5 w-5 shrink-0', activo(item.path) ? '' : 'text-lyer-cyan/80 group-hover:text-lyer-cyan']"
          />
          <span v-if="!isCollapsed || sidebarOpen" class="truncate text-sm">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="shrink-0 border-t border-lyer-linea2/70 bg-lyer-barra/95 p-4">
        <div v-if="!isCollapsed || sidebarOpen" class="mb-2 px-2 py-2">
          <p class="truncate text-sm font-semibold tracking-wide text-lyer-fg">{{ nombreUsuario }}</p>
          <p class="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-lyer-cyan">{{ etiquetaRol }}</p>
        </div>
        <div v-else class="mb-2 flex justify-center" :title="`${nombreUsuario} · ${etiquetaRol}`">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-lyer-accent/20 text-xs font-black text-lyer-accent">
            {{ (nombreUsuario || '?').charAt(0).toUpperCase() }}
          </div>
        </div>
        <button
          type="button"
          class="mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wider text-lyer-muted transition-colors hover:bg-lyer-hover hover:text-lyer-fg"
          :class="isCollapsed && !sidebarOpen ? 'lg:justify-center' : ''"
          :title="tema.esClaro ? 'Modo oscuro' : 'Modo claro'"
          @click="tema.alternar()"
        >
          <Sun v-if="tema.esClaro" class="h-4 w-4 shrink-0 text-amber-500" />
          <Moon v-else class="h-4 w-4 shrink-0 text-lyer-cyan" />
          <span v-if="!isCollapsed || sidebarOpen">{{ tema.esClaro ? 'Modo oscuro' : 'Modo claro' }}</span>
        </button>
        <button
          class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wider text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
          :class="isCollapsed && !sidebarOpen ? 'lg:justify-center' : ''"
          @click="logout"
        >
          <LogOut class="h-4 w-4 shrink-0" />
          <span v-if="!isCollapsed || sidebarOpen">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <main class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <header class="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-lyer-linea/50 bg-lyer-barra/95 px-4 backdrop-blur-md lg:px-6">
        <div class="flex min-w-0 items-center gap-3">
          <button
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-lyer-linea bg-lyer-panel text-lyer-muted transition-colors hover:text-lyer-fg lg:hidden"
            title="Abrir menú"
            @click="sidebarOpen = true"
          >
            <Menu class="h-5 w-5" />
          </button>
          <button
            v-if="route.path !== '/home'"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-lyer-linea bg-lyer-panel text-lyer-muted transition-colors hover:text-lyer-fg"
            title="Volver"
            @click="router.back()"
          >
            <ChevronLeft class="h-5 w-5" />
          </button>
          <h2 class="truncate text-base font-semibold tracking-wide text-lyer-fg">
            {{ routeTitle(route.name) }}
          </h2>
        </div>
        <div class="shrink-0 rounded-md border border-lyer-accent/40 bg-lyer-boton px-3.5 py-1.5 text-xs font-semibold tracking-wider text-lyer-soft">
          {{ new Date().toLocaleDateString('es-PE') }}
        </div>
      </header>

      <section class="flex-1 overflow-y-auto bg-lyer-fondo p-4 text-lyer-fg md:p-5 lg:px-6 lg:py-6">
        <router-view />
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}
.logo-colapsado {
  filter: brightness(0) invert(1);
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>