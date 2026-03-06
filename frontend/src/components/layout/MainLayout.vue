<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Package, 
  ChevronLeft, 
  Menu,
  LogOut,
  History
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const isCollapsed = ref(false);

const menuItems = [
  { name: 'Dashboard', path: '/home', icon: LayoutDashboard },
  { name: 'Listado de Órdenes', path: '/ordenes', icon: ClipboardList },
  { name: 'Inventario', path: '/catalogos', icon: Package },
  { name: 'Usuarios & Logs', path: '/usuarios', icon: Users },
];

const logout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};
</script>

<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden" data-theme="lyer">
    <aside 
  :class="[
    'bg-lyer-green text-white transition-all duration-300 flex flex-col shadow-xl', 
    isCollapsed ? 'w-20' : 'w-64'
  ]"
>
      <div class="p-6 flex items-center justify-between">
        <h1 v-if="!isCollapsed" class="text-xl font-black italic tracking-tighter">LYER <span class="text-lyer-accent">MOTORS</span></h1>
        <button @click="isCollapsed = !isCollapsed" class="w-8 h-8 rounded hover:bg-lyer-accent/20 transition-colors">
          <Menu class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 mt-4 px-4 space-y-2">
        <router-link v-for="item in menuItems" :key="item.path" :to="item.path"
          :class="['flex items-center p-3 rounded-lg transition-colors hover:bg-lyer-accent/20', 
          route.path.includes(item.path) ? 'bg-lyer-accent text-lyer-green font-bold' : 'text-slate-200']">
          <component :is="item.icon" class="w-6 h-6 shrink-0" />
          <span v-if="!isCollapsed" class="ml-4 truncate">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="p-4 border-t border-lyer-accent/20">
        <button @click="logout" class="flex items-center w-full p-3 text-red-300 hover:bg-red-900/20 rounded-lg">
          <LogOut class="w-6 h-6" />
          <span v-if="!isCollapsed" class="ml-4">Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
        <div class="flex items-center gap-4">
          <button v-if="route.path !== '/home'" @click="router.back()" class="w-10 h-10 rounded-full">
            <ChevronLeft class="w-6 h-6 text-lyer-green" />
          </button>
          <h2 class="text-lg font-bold text-slate-700 capitalize">{{ route.name?.replace('-', ' ') }}</h2>
        </div>
        <div class="bg-lyer-green text-white px-4 py-2 rounded-lg font-bold">
          {{ new Date().toLocaleDateString() }}
        </div>
      </header>

      <section class="flex-1 overflow-y-auto p-8">
        <router-view />
      </section>
    </main>
  </div>
</template>