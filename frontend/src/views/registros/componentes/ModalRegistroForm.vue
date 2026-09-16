<script setup>
import { X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  tipo: { type: String, required: true },
  form: { type: Object, required: true },
  marcas: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'guardar', 'update:form']);

const patch = (campo, valor) => {
  const next = { ...props.form, [campo]: valor };
  if (campo === 'tipoCliente') {
    next.tipoDocumento = valor === 'EMPRESA' ? 'RUC' : 'DNI';
  }
  emit('update:form', next);
};

const titulo = {
  clientes: 'Editar cliente',
  vehiculos: 'Editar vehículo',
  marcas: 'Editar marca',
};
</script>

<template>
  <div :class="['modal modal-bottom sm:modal-middle', { 'modal-open': isOpen }]">
    <div class="modal-box p-0 overflow-hidden border-t-8 border-lyer-green rounded-[2rem]">
      <div class="p-6 bg-slate-50 border-b flex justify-between items-center">
        <h3 class="font-black text-lg text-slate-800 uppercase italic">{{ titulo[tipo] }}</h3>
        <button @click="emit('close')" class="btn btn-circle btn-ghost btn-sm"><X class="w-5 h-5" /></button>
      </div>

      <div class="p-6 space-y-4">
        <template v-if="tipo === 'clientes'">
          <input :value="form.nombreRazonSocial" @input="patch('nombreRazonSocial', $event.target.value)"
            class="input input-bordered w-full rounded-xl font-bold" placeholder="Nombre / razón social" />
          <div class="grid grid-cols-2 gap-3">
            <select :value="form.tipoCliente" @change="patch('tipoCliente', $event.target.value)" class="select select-bordered rounded-xl font-bold">
              <option value="PERSONA">Persona</option>
              <option value="EMPRESA">Empresa</option>
            </select>
            <select :value="form.tipoDocumento" @change="patch('tipoDocumento', $event.target.value)" class="select select-bordered rounded-xl font-bold">
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
            </select>
          </div>
          <input :value="form.numeroDocumento" @input="patch('numeroDocumento', $event.target.value.replace(/\D/g, ''))"
            class="input input-bordered w-full rounded-xl font-bold" placeholder="Documento" />
          <input :value="form.representante" @input="patch('representante', $event.target.value)"
            class="input input-bordered w-full rounded-xl" placeholder="Representante (opcional)" />
          <div class="grid grid-cols-2 gap-3">
            <input :value="form.celular" @input="patch('celular', $event.target.value.replace(/\D/g, ''))"
              maxlength="9" class="input input-bordered rounded-xl" placeholder="Celular" />
            <input :value="form.correo" @input="patch('correo', $event.target.value)"
              class="input input-bordered rounded-xl" placeholder="Correo" />
          </div>
        </template>

        <template v-else-if="tipo === 'vehiculos'">
          <input :value="form.placa" disabled class="input input-bordered w-full rounded-xl font-black uppercase text-center bg-slate-100" />
          <p class="text-[10px] text-slate-400">La placa no se edita porque está vinculada a las órdenes.</p>
          <select :value="form.marcaId" @change="patch('marcaId', $event.target.value)" class="select select-bordered w-full rounded-xl font-bold">
            <option value="">Marca</option>
            <option v-for="m in marcas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
          </select>
          <input :value="form.modelo" @input="patch('modelo', $event.target.value)"
            class="input input-bordered w-full rounded-xl font-bold" placeholder="Modelo" />
          <div class="grid grid-cols-2 gap-3">
            <input :value="form.kilometraje ?? ''" type="number" @input="patch('kilometraje', $event.target.value)"
              class="input input-bordered rounded-xl" placeholder="Kilometraje" />
            <input :value="form.horometro ?? ''" type="number" @input="patch('horometro', $event.target.value)"
              class="input input-bordered rounded-xl" placeholder="Horómetro" />
          </div>
        </template>

        <template v-else>
          <input :value="form.nombre" @input="patch('nombre', $event.target.value)"
            class="input input-bordered w-full rounded-xl font-bold" placeholder="Nombre de la marca" />
        </template>
      </div>

      <div class="p-6 bg-slate-50 border-t flex justify-end gap-2">
        <button @click="emit('close')" class="btn btn-ghost">Cancelar</button>
        <button @click="emit('guardar')" class="btn bg-lyer-green text-white border-none">Guardar</button>
      </div>
    </div>
  </div>
</template>
