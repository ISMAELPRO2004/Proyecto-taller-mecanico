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
  <div :class="['modal modal-bottom sm:modal-middle', { 'modal-open': isOpen }]">
    <div class="modal-box max-w-2xl p-0 overflow-hidden border-t-8 border-lyer-green rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl">
      
      <!-- Header más compacto en móvil -->
      <div class="p-5 md:p-6 bg-slate-50 border-b flex justify-between items-center">
        <div class="min-w-0">
          <h3 class="font-black text-slate-800 uppercase italic tracking-tighter text-sm md:text-base truncate">{{ titulo }}</h3>
          <p class="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Selecciona los elementos</p>
        </div>
        <button @click="cerrar" class="btn btn-sm btn-circle btn-ghost text-slate-400 shrink-0"><X class="w-5 h-5"/></button>
      </div>

      <div class="p-4 border-b bg-white">
        <div class="relative">
          <Search class="absolute left-4 top-3 w-4 h-4 text-slate-400" />
          <input v-model="filtro" type="text" placeholder="Buscar en catálogo..." 
            class="input input-bordered w-full pl-12 rounded-2xl bg-slate-50 border-none font-medium text-sm" />
        </div>
      </div>

      <!-- Área de lista con padding ajustado -->
      <div class="max-h-80 md:max-h-96 overflow-y-auto p-3 md:p-4 space-y-2 bg-white">
        <div v-for="item in itemsFiltrados" :key="item.id" 
          @click="toggleSeleccion(item)"
          :class="['flex items-center gap-3 p-3 md:p-4 rounded-2xl border transition-all cursor-pointer group',
                   seleccionTemporales.find(i => i.id === item.id) ? 'bg-emerald-50 border-lyer-accent shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200']">
          
          <!-- Checkbox fijo -->
          <div :class="['w-5 h-5 md:w-6 md:h-6 shrink-0 rounded-lg border-2 flex items-center justify-center transition-colors',
                        seleccionTemporales.find(i => i.id === item.id) ? 'bg-lyer-green border-lyer-green text-white' : 'border-slate-200 bg-white group-hover:border-lyer-green/30']">
            <Check v-if="seleccionTemporales.find(i => i.id === item.id)" class="w-3 h-3 md:w-4 md:h-4" stroke-width="4" />
          </div>

          <!-- Texto descriptivo con wrap -->
          <div class="min-w-0 flex-1">
            <p class="font-bold text-slate-700 text-xs md:text-sm uppercase leading-tight">{{ item.descripcion }}</p>
            <p class="text-[9px] font-black text-lyer-green mt-1">BASE: S/ {{ parseFloat(item.precioBase).toFixed(2) }}</p>
          </div>
        </div>
        
        <!-- Estado vacío -->
        <div v-if="itemsFiltrados.length === 0" class="py-12 text-center text-slate-300 font-bold uppercase text-[10px] italic tracking-widest">
          No hay coincidencias
        </div>
      </div>

      <!-- Footer Responsivo: Stack en móvil -->
      <div class="p-4 md:p-6 bg-slate-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {{ seleccionTemporales.length }} seleccionados
        </span>
        <div class="flex gap-2 w-full sm:w-auto">
          <button @click="cerrar" class="btn btn-ghost btn-sm flex-1 sm:flex-none font-bold text-slate-400 uppercase text-[10px]">Cancelar</button>
          <button @click="confirmar" class="btn btn-sm flex-[2] sm:flex-none bg-lyer-green text-white border-none px-6 md:px-10 rounded-xl shadow-lg uppercase text-[10px] font-black">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>