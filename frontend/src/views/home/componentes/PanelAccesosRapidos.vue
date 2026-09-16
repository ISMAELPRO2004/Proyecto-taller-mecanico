<script setup>
import { ClipboardList, Wrench, CheckCircle2, ArrowUpRight } from 'lucide-vue-next';
</script>

<template>
  <div class="space-y-4">
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
      <h4 class="font-bold text-slate-800 mb-4 text-sm">Accesos Rápidos</h4>
      <div class="space-y-2">
        <button
          @click="$router.push('/ordenes')"
          class="flex items-center justify-between w-full p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <div class="flex items-center gap-3">
            <ClipboardList class="w-4 h-4 text-lyer-green" />
            <span class="text-sm font-medium text-slate-700">Ver todas las órdenes</span>
          </div>
          <ArrowUpRight class="w-4 h-4 text-slate-400" />
        </button>
        <button
          @click="$router.push('/catalogos')"
          class="flex items-center justify-between w-full p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <div class="flex items-center gap-3">
            <Wrench class="w-4 h-4 text-lyer-green" />
            <span class="text-sm font-medium text-slate-700">Actualizar catálogos</span>
          </div>
          <ArrowUpRight class="w-4 h-4 text-slate-400" />
        </button>
        <button
          @click="$router.push('/usuarios')"
          class="flex items-center justify-between w-full p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <div class="flex items-center gap-3">
            <CheckCircle2 class="w-4 h-4 text-lyer-green" />
            <span class="text-sm font-medium text-slate-700">Usuarios & Auditoría</span>
          </div>
          <ArrowUpRight class="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  </div>
</template>
