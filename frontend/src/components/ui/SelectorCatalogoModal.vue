<script setup>
import { ref, computed, watch } from 'vue';
import { Search, X, Check } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  titulo: String,
  items: Array,
  yaSeleccionadosIds: Array // Recibe los IDs actuales del formulario
});

const emit = defineEmits(['close', 'confirmar']);
const filtro = ref('');
const seleccionTemporales = ref([]);

// Sincronizar al abrir el modal
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    seleccionTemporales.value = props.items.filter(item => 
      props.yaSeleccionadosIds.includes(item.id)
    );
  }
});

const itemsFiltrados = computed(() => {
  return props.items.filter(item => 
    item.descripcion.toLowerCase().includes(filtro.value.toLowerCase())
  );
});

const toggleSeleccion = (item) => {
  const index = seleccionTemporales.value.findIndex(i => i.id === item.id);
  if (index > -1) {
    seleccionTemporales.value.splice(index, 1);
  } else {
    seleccionTemporales.value.push(item);
  }
};

const confirmar = () => {
  emit('confirmar', [...seleccionTemporales.value]);
  filtro.value = '';
};

const cerrar = () => {
  filtro.value = '';
  emit('close');
};
</script>

<template>
  <div :class="['modal', { 'modal-open': isOpen }]">
    <div class="modal-box max-w-2xl p-0 overflow-hidden border-t-8 border-lyer-green rounded-[2.5rem] shadow-2xl">
      <div class="p-6 bg-slate-50 border-b flex justify-between items-center">
        <div>
          <h3 class="font-black text-slate-800 uppercase italic tracking-tighter">{{ titulo }}</h3>
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gestiona los elementos de la orden</p>
        </div>
        <button @click="cerrar" class="btn btn-sm btn-circle btn-ghost text-slate-400"><X class="w-5 h-5"/></button>
      </div>

      <div class="p-4 border-b">
        <div class="relative">
          <Search class="absolute left-4 top-3 w-4 h-4 text-slate-400" />
          <input v-model="filtro" type="text" placeholder="Buscar en catálogo..." 
            class="input input-bordered w-full pl-12 rounded-2xl bg-slate-50 border-none font-medium" />
        </div>
      </div>

      <div class="max-h-96 overflow-y-auto p-4 space-y-2">
        <div v-for="item in itemsFiltrados" :key="item.id" 
          @click="toggleSeleccion(item)"
          :class="['flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group',
                   seleccionTemporales.find(i => i.id === item.id) ? 'bg-emerald-50 border-lyer-accent shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200']">
          <div class="flex items-center gap-4">
            <div :class="['w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors',
                          seleccionTemporales.find(i => i.id === item.id) ? 'bg-lyer-green border-lyer-green text-white' : 'border-slate-200 bg-white group-hover:border-lyer-green/30']">
              <Check v-if="seleccionTemporales.find(i => i.id === item.id)" class="w-4 h-4" stroke-width="4" />
            </div>
            <div>
              <p class="font-bold text-slate-700 text-sm uppercase">{{ item.descripcion }}</p>
              <p class="text-[10px] font-black text-lyer-green">PRECIO BASE: S/ {{ parseFloat(item.precioBase).toFixed(2) }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="itemsFiltrados.length === 0" class="py-12 text-center text-slate-300 font-bold uppercase text-xs italic tracking-widest">
          No se encontraron resultados
        </div>
      </div>

      <div class="p-6 bg-slate-50 border-t flex justify-between items-center">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {{ seleccionTemporales.length }} seleccionados
        </span>
        <div class="flex gap-2">
          <button @click="cerrar" class="btn btn-ghost font-bold text-slate-400 uppercase text-xs">Cancelar</button>
          <button @click="confirmar" class="btn bg-lyer-green text-white border-none px-10 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all uppercase text-xs font-black">
            Confirmar Selección
          </button>
        </div>
      </div>
    </div>
  </div>
</template>