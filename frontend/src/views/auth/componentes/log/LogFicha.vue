<script setup>
import { PlusCircle, Trash2, RefreshCcw, ArrowRight, Package, Wrench, ExternalLink } from 'lucide-vue-next';

defineProps({
  tipo: String,
  creacion: Object,
  eliminacion: Object,
  cabecera: { type: Array, default: () => [] },
  listas: { type: Array, default: () => [] },
  campoLabel: Function,
  formatVal: Function,
  accionConfig: Function,
});
</script>

<template>
  <div class="space-y-6">
  <template v-if="tipo === 'CREACION'">
    <div class="flex items-center gap-2 text-emerald-600">
      <PlusCircle class="w-4 h-4" />
      <span class="text-[10px] font-black uppercase tracking-widest">Datos Registrados</span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div v-for="[label, val] in creacion.campos" :key="label" class="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
        <span class="block text-[8px] font-black text-emerald-700 uppercase opacity-60 mb-1">{{ label }}</span>
        <span class="text-xs font-bold text-slate-700">{{ val }}</span>
      </div>
    </div>
    <template v-if="creacion.materiales.length">
      <div class="flex items-center gap-2 text-slate-400">
        <Package class="w-4 h-4" />
        <span class="text-[9px] font-black uppercase tracking-widest">Repuestos</span>
      </div>
      <div class="rounded-2xl border border-slate-100 overflow-hidden">
        <table class="table table-compact w-full text-xs">
          <thead class="bg-slate-50 text-slate-400 text-[9px] uppercase">
            <tr><th class="pl-4 py-3">Descripción</th><th class="text-center">Cant.</th><th class="text-right pr-4">Subtotal</th></tr>
          </thead>
          <tbody>
            <tr v-for="(m, i) in creacion.materiales" :key="i" class="border-t border-slate-50">
              <td class="pl-4 py-2 font-medium">{{ m.descripcion }}</td>
              <td class="text-center font-bold">{{ m.cantidad }}</td>
              <td class="text-right pr-4 font-black">S/ {{ m.subtotal.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-if="creacion.servicios.length">
      <div class="flex items-center gap-2 text-slate-400">
        <Wrench class="w-4 h-4" />
        <span class="text-[9px] font-black uppercase tracking-widest">Servicios</span>
      </div>
      <div class="rounded-2xl border border-slate-100 overflow-hidden">
        <table class="table table-compact w-full text-xs">
          <tbody>
            <tr v-for="(s, i) in creacion.servicios" :key="i" class="border-t border-slate-50 first:border-0">
              <td class="pl-4 py-2 font-medium">{{ s.descripcion }}</td>
              <td class="text-right pr-4 font-black">S/ {{ s.monto.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-if="creacion.terceros.length">
      <div class="flex items-center gap-2 text-slate-400">
        <ExternalLink class="w-4 h-4" />
        <span class="text-[9px] font-black uppercase tracking-widest">Terceros</span>
      </div>
      <div class="rounded-2xl border border-slate-100 overflow-hidden">
        <table class="table table-compact w-full text-xs">
          <tbody>
            <tr v-for="(t, i) in creacion.terceros" :key="i" class="border-t border-slate-50 first:border-0">
              <td class="pl-4 py-2 font-medium italic text-blue-800">{{ t.descripcion }}</td>
              <td class="text-right pr-4 font-black text-blue-700">S/ {{ t.monto.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <div v-if="creacion.total !== null" class="bg-slate-900 text-white p-5 rounded-2xl flex justify-between items-center">
      <span class="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total de la Orden</span>
      <span class="text-xl font-black text-emerald-400">S/ {{ creacion.total.toFixed(2) }}</span>
    </div>
  </template>

  <template v-else-if="tipo === 'ELIMINACION'">
    <div class="flex items-center gap-2 text-red-500">
      <Trash2 class="w-4 h-4" />
      <span class="text-[10px] font-black uppercase tracking-widest">Registro Eliminado</span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div v-for="[label, val] in eliminacion.campos" :key="label" class="p-4 bg-red-50/50 rounded-2xl border border-red-100">
        <span class="block text-[8px] font-black text-red-500 uppercase opacity-70 mb-1">{{ label }}</span>
        <span class="text-xs font-bold text-red-800">{{ val }}</span>
      </div>
    </div>
    <template v-if="eliminacion.materiales.length">
      <div class="flex items-center gap-2 text-red-400">
        <Package class="w-4 h-4" />
        <span class="text-[9px] font-black uppercase tracking-widest">Repuestos incluidos</span>
      </div>
      <div class="rounded-2xl border border-red-100 overflow-hidden">
        <table class="table table-compact w-full text-xs">
          <tbody>
            <tr v-for="(m, i) in eliminacion.materiales" :key="i" class="border-t border-red-50 first:border-0">
              <td class="pl-4 py-2 font-medium text-red-800">{{ m.descripcion }}</td>
              <td class="text-center text-red-500 font-bold">x{{ m.cantidad }}</td>
              <td class="text-right pr-4 font-black text-red-700">S/ {{ m.subtotal.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-if="eliminacion.servicios.length || eliminacion.terceros.length">
      <div class="flex items-center gap-2 text-red-400">
        <Wrench class="w-4 h-4" />
        <span class="text-[9px] font-black uppercase tracking-widest">Servicios incluidos</span>
      </div>
      <div class="rounded-2xl border border-red-100 overflow-hidden">
        <table class="table table-compact w-full text-xs">
          <tbody>
            <tr v-for="(s, i) in eliminacion.servicios" :key="'s'+i" class="border-t border-red-50 first:border-0">
              <td class="pl-4 py-2 font-medium text-red-800">{{ s.descripcion }}</td>
              <td class="text-right pr-4 font-black text-red-700">S/ {{ s.monto.toFixed(2) }}</td>
            </tr>
            <tr v-for="(t, i) in eliminacion.terceros" :key="'t'+i" class="border-t border-red-50">
              <td class="pl-4 py-2 font-medium italic text-red-700">{{ t.descripcion }}</td>
              <td class="text-right pr-4 font-black text-red-600">S/ {{ t.monto.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <div v-if="eliminacion.total" class="bg-red-900 text-white p-5 rounded-2xl flex justify-between items-center">
      <span class="text-[10px] font-black text-red-300 uppercase tracking-widest">Total eliminado</span>
      <span class="text-xl font-black text-red-300">S/ {{ eliminacion.total.toFixed(2) }}</span>
    </div>
  </template>

  <template v-else-if="tipo === 'EDICION'">
    <div v-if="cabecera.length" class="space-y-3">
      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Campos Modificados</p>
      <div v-for="[key, val] in cabecera" :key="key" class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <span class="text-[9px] font-black text-slate-400 uppercase w-32 shrink-0">{{ campoLabel(key) }}</span>
        <div class="flex items-center gap-3 text-xs font-bold overflow-hidden">
          <span class="opacity-40 line-through truncate max-w-[100px]">{{ formatVal(key, val.de) }}</span>
          <ArrowRight class="w-3 h-3 text-lyer-green shrink-0" />
          <span class="text-lyer-green truncate max-w-[120px]">{{ formatVal(key, val.a) }}</span>
        </div>
      </div>
    </div>
    <div v-for="lista in listas" :key="lista.nombre" class="space-y-3">
      <div class="flex items-center gap-2 text-slate-400">
        <Package v-if="lista.icono === 'package'" class="w-4 h-4" />
        <Wrench v-else-if="lista.icono === 'wrench'" class="w-4 h-4" />
        <ExternalLink v-else class="w-4 h-4" />
        <span class="text-[9px] font-black uppercase tracking-widest">{{ lista.nombre }}</span>
      </div>
      <div v-for="(item, i) in lista.items" :key="i" :class="['p-4 rounded-2xl border', accionConfig(item.accion).bg, accionConfig(item.accion).border]">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2">
            <PlusCircle v-if="item.accion === 'AÑADIDO'" :class="['w-4 h-4 shrink-0', accionConfig(item.accion).color]" />
            <Trash2 v-else-if="item.accion === 'ELIMINADO'" :class="['w-4 h-4 shrink-0', accionConfig(item.accion).color]" />
            <RefreshCcw v-else :class="['w-4 h-4 shrink-0', accionConfig(item.accion).color]" />
            <span class="text-[11px] font-black text-slate-700 uppercase">{{ item.descripcion }}</span>
          </div>
          <span :class="['text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0', accionConfig(item.accion).bg, accionConfig(item.accion).color]">
            {{ item.accion }}
          </span>
        </div>
        <div v-if="item.accion === 'MODIFICADO'" class="mt-3 pl-6 space-y-1">
          <div v-for="campo in ['cantidad', 'precio', 'monto']" :key="campo">
            <div v-if="item[campo]" class="flex items-center gap-2 text-[10px] font-bold text-slate-500">
              <span class="capitalize text-slate-400 w-16">{{ campo }}:</span>
              <span class="opacity-40 line-through">{{ item[campo].de }}</span>
              <ArrowRight class="w-3 h-3 text-lyer-green" />
              <span class="text-lyer-green">{{ item[campo].a }}</span>
            </div>
          </div>
        </div>
        <div v-if="item.accion === 'AÑADIDO' && item.datos" class="mt-2 pl-6 flex gap-4 text-[10px] text-slate-500 font-bold">
          <span v-if="item.datos.cantidad">Cant: {{ item.datos.cantidad }}</span>
          <span v-if="item.datos.precio">S/ {{ item.datos.precio }}</span>
          <span v-if="item.datos.monto">S/ {{ item.datos.monto }}</span>
        </div>
      </div>
    </div>
    <div v-if="!cabecera.length && !listas.length" class="text-center py-8 text-slate-300 text-xs font-bold">
      Sin cambios registrados
    </div>
  </template>
  </div>
</template>
