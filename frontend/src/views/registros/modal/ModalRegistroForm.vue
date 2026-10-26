<script setup>
import { X } from 'lucide-vue-next';
import FormEditarCliente from '../clientes/FormEditarCliente.vue';
import FormEditarVehiculo from '../vehiculos/FormEditarVehiculo.vue';
import FormEditarMarca from '../marcas/FormEditarMarca.vue';

defineProps({
  isOpen: Boolean,
  tipo: { type: String, required: true },
  form: { type: Object, required: true },
  errores: { type: Object, default: () => ({}) },
  marcas: { type: Array, default: () => [] },
});

defineEmits(['close', 'guardar', 'update:form']);

const titulo = {
  clientes: 'Editar cliente',
  vehiculos: 'Editar vehículo',
  marcas: 'Editar marca',
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
    <div class="relative max-h-[92vh] w-full max-w-lg overflow-hidden rounded-2xl border border-lyer-linea/60 bg-lyer-panel text-lyer-fg shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      <div class="h-1 w-full bg-gradient-to-r from-lyer-green via-lyer-accent to-lyer-cyan" />

      <header class="flex items-center justify-between gap-3 border-b border-lyer-linea/50 bg-lyer-barra px-5 py-4 sm:px-6">
        <h3 class="font-display text-lg font-bold uppercase tracking-tight text-lyer-fg">{{ titulo[tipo] }}</h3>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-lyer-linea/50 bg-lyer-fondo text-lyer-muted hover:text-lyer-fg"
          @click="$emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </header>

      <div class="max-h-[68vh] overflow-y-auto px-5 py-5 sm:px-6">
        <FormEditarCliente
          v-if="tipo === 'clientes'"
          :form="form"
          :errores="errores"
          @update:form="$emit('update:form', $event)"
        />
        <FormEditarVehiculo
          v-else-if="tipo === 'vehiculos'"
          :form="form"
          :marcas="marcas"
          :errores="errores"
          @update:form="$emit('update:form', $event)"
        />
        <FormEditarMarca
          v-else
          :form="form"
          :errores="errores"
          @update:form="$emit('update:form', $event)"
        />
      </div>

      <footer class="flex items-center justify-end gap-2 border-t border-lyer-linea/50 bg-lyer-barra px-5 py-4 sm:px-6">
        <button
          type="button"
          class="rounded-xl border border-lyer-linea/60 bg-lyer-fondo px-5 py-2.5 text-sm text-lyer-muted hover:text-lyer-fg"
          @click="$emit('close')"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="rounded-xl border border-lyer-accent/40 bg-lyer-boton px-6 py-2.5 text-sm font-bold text-lyer-fg hover:bg-lyer-boton"
          @click="$emit('guardar')"
        >
          Guardar
        </button>
      </footer>
    </div>
  </div>
</template>
