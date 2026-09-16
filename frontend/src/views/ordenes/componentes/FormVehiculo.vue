<script setup>
import { ref } from 'vue';
import { Car, Plus } from 'lucide-vue-next';

const props = defineProps({
  vehiculo: { type: Object, required: true },
  marcas: { type: Array, default: () => [] },
  errores: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:vehiculo', 'crear-marca']);
const nuevaMarca = ref('');
const mostrandoNueva = ref(false);

const patch = (campo, valor) => {
  emit('update:vehiculo', { ...props.vehiculo, [campo]: valor });
};

const crearMarca = () => {
  if (!nuevaMarca.value.trim()) return;
  emit('crear-marca', nuevaMarca.value.trim());
  nuevaMarca.value = '';
  mostrandoNueva.value = false;
};
</script>

<template>
  <section class="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 space-y-4">
          <div class="flex items-center gap-2 text-emerald-700">
      <Car class="w-4 h-4" />
      <span class="text-[10px] font-black uppercase tracking-widest">Datos del vehículo</span>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="col-span-2 md:col-span-1">
        <label class="text-[9px] font-bold text-emerald-600 block mb-1 ml-2 uppercase">Placa</label>
        <input :value="vehiculo.placa" disabled
          class="input input-bordered w-full rounded-xl font-black text-center uppercase border-none shadow-sm bg-white/70" />
      </div>

      <div class="col-span-2">
        <label class="text-[9px] font-bold text-emerald-600 block mb-1 ml-2 uppercase">Marca</label>
        <div class="flex gap-2">
          <select
            :value="vehiculo.marcaId"
            @change="patch('marcaId', $event.target.value)"
            :class="['select select-bordered w-full rounded-xl font-bold border-none shadow-sm', errores.marcaId ? 'bg-red-50' : '']"
          >
            <option value="">Seleccione marca</option>
            <option v-for="m in marcas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
          </select>
          <button type="button" @click="mostrandoNueva = !mostrandoNueva"
            class="btn btn-square bg-white border-emerald-100 text-emerald-700 rounded-xl">
            <Plus class="w-4 h-4" />
          </button>
        </div>
        <div v-if="mostrandoNueva" class="flex gap-2 mt-2">
          <input v-model="nuevaMarca" placeholder="Nueva marca"
            class="input input-sm input-bordered flex-1 rounded-lg" @keyup.enter="crearMarca" />
          <button type="button" class="btn btn-sm bg-lyer-green text-white border-none" @click="crearMarca">OK</button>
        </div>
      </div>

      <div class="col-span-2 md:col-span-1">
        <label class="text-[9px] font-bold text-emerald-600 block mb-1 ml-2 uppercase">Modelo</label>
        <input :value="vehiculo.modelo" @input="patch('modelo', $event.target.value)"
          :class="['input input-bordered w-full rounded-xl text-xs font-bold border-none shadow-sm', errores.modelo ? 'bg-red-50' : '']" />
      </div>

      <div>
        <label class="text-[9px] font-bold text-emerald-600 block mb-1 ml-2 uppercase">Kilometraje</label>
        <input :value="vehiculo.kilometraje ?? ''" type="number"
          @input="patch('kilometraje', $event.target.value === '' ? null : $event.target.value)"
          class="input input-bordered w-full rounded-xl text-xs font-bold border-none shadow-sm text-center"
          placeholder="Opcional" />
      </div>

      <div>
        <label class="text-[9px] font-bold text-emerald-600 block mb-1 ml-2 uppercase">Horómetro</label>
        <input :value="vehiculo.horometro ?? ''" type="number"
          @input="patch('horometro', $event.target.value === '' ? null : $event.target.value)"
          class="input input-bordered w-full rounded-xl text-xs font-bold border-none shadow-sm text-center"
          placeholder="Opcional" />
      </div>
    </div>
  </section>
</template>
