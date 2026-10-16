<script setup>
import { ChevronDown, X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  tipo: { type: String, required: true },
  form: { type: Object, required: true },
  marcas: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'guardar', 'update:form']);

const patch = (campo, valor) => {
  const next = { ...props.form, [campo]: valor };
  if (campo === 'tipoCliente' && valor === 'EMPRESA') {
    next.tipoDocumento = 'RUC';
  }
  emit('update:form', next);
};

const titulo = {
  clientes: 'Editar cliente',
  vehiculos: 'Editar vehículo',
  marcas: 'Editar marca',
};

const campo = 'w-full rounded-xl border border-[#4a2870]/70 bg-[#10041f] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-lyer-cyan/70 focus:outline-none';
const etiqueta = 'font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400';
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
    <div class="relative max-h-[92vh] w-full max-w-lg overflow-hidden rounded-2xl border border-[#4a2870]/60 bg-[#160a24] text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      <div class="h-1 w-full bg-gradient-to-r from-lyer-green via-lyer-accent to-lyer-cyan" />

      <header class="flex items-center justify-between gap-3 border-b border-[#4a2870]/50 bg-[#10041f] px-5 py-4 sm:px-6">
        <h3 class="font-display text-lg font-bold uppercase tracking-tight text-white">{{ titulo[tipo] }}</h3>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-[#4a2870]/50 bg-[#140a22] text-slate-400 hover:text-white"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </header>

      <div class="max-h-[68vh] space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
        <template v-if="tipo === 'clientes'">
          <label class="block space-y-1.5">
            <span :class="etiqueta">Nombre / razón social</span>
            <input
              :value="form.nombreRazonSocial"
              type="text"
              :class="campo"
              @input="patch('nombreRazonSocial', $event.target.value)"
            />
          </label>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label class="block space-y-1.5">
              <span :class="etiqueta">Tipo de cliente</span>
              <span class="relative block">
                <select
                  :value="form.tipoCliente"
                  :class="[campo, 'appearance-none pr-10']"
                  @change="patch('tipoCliente', $event.target.value)"
                >
                  <option value="PERSONA">Persona</option>
                  <option value="EMPRESA">Empresa</option>
                </select>
                <ChevronDown class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </span>
            </label>
            <label class="block space-y-1.5">
              <span :class="etiqueta">Tipo de documento</span>
              <span class="relative block">
                <select
                  :value="form.tipoCliente === 'EMPRESA' ? 'RUC' : form.tipoDocumento"
                  :disabled="form.tipoCliente === 'EMPRESA'"
                  :class="[campo, 'appearance-none pr-10 disabled:opacity-60']"
                  @change="patch('tipoDocumento', $event.target.value)"
                >
                  <option v-if="form.tipoCliente !== 'EMPRESA'" value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                </select>
                <ChevronDown class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </span>
            </label>
          </div>

          <label class="block space-y-1.5">
            <span :class="etiqueta">Número de documento</span>
            <input
              :value="form.numeroDocumento"
              type="text"
              inputmode="numeric"
              :class="[campo, 'font-mono']"
              @input="patch('numeroDocumento', $event.target.value.replace(/\D/g, ''))"
            />
          </label>

          <label class="block space-y-1.5">
            <span :class="etiqueta">Representante <span class="font-medium normal-case tracking-normal text-slate-500">opcional</span></span>
            <input
              :value="form.representante"
              type="text"
              placeholder="Quien deja el vehículo"
              :class="campo"
              @input="patch('representante', $event.target.value)"
            />
          </label>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label class="block space-y-1.5">
              <span :class="etiqueta">Celular</span>
              <input
                :value="form.celular"
                type="text"
                inputmode="numeric"
                maxlength="9"
                placeholder="9 dígitos"
                :class="[campo, 'font-mono']"
                @input="patch('celular', $event.target.value.replace(/\D/g, ''))"
              />
            </label>
            <label class="block space-y-1.5">
              <span :class="etiqueta">Correo</span>
              <input
                :value="form.correo"
                type="email"
                placeholder="correo@ejemplo.com"
                :class="campo"
                @input="patch('correo', $event.target.value)"
              />
            </label>
          </div>
        </template>

        <template v-else-if="tipo === 'vehiculos'">
          <label class="block space-y-1.5">
            <span :class="etiqueta">Placa</span>
            <input :value="form.placa" type="text" disabled :class="[campo, 'cursor-not-allowed text-center font-mono font-bold uppercase tracking-widest text-lyer-cyan opacity-80']" />
            <span class="block text-xs text-slate-500">La placa no se edita porque está vinculada a las órdenes.</span>
          </label>

          <label class="block space-y-1.5">
            <span :class="etiqueta">Marca</span>
            <span class="relative block">
              <select
                :value="form.marcaId"
                :class="[campo, 'appearance-none pr-10']"
                @change="patch('marcaId', $event.target.value)"
              >
                <option value="">Selecciona una marca</option>
                <option v-for="m in marcas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
              </select>
              <ChevronDown class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </span>
          </label>

          <label class="block space-y-1.5">
            <span :class="etiqueta">Modelo</span>
            <input
              :value="form.modelo"
              type="text"
              :class="campo"
              @input="patch('modelo', $event.target.value)"
            />
          </label>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label class="block space-y-1.5">
              <span :class="etiqueta">Kilometraje (km)</span>
              <input
                :value="form.kilometraje ?? ''"
                type="number"
                min="0"
                :class="[campo, 'font-mono']"
                @input="patch('kilometraje', $event.target.value)"
              />
            </label>
            <label class="block space-y-1.5">
              <span :class="etiqueta">Horómetro (h)</span>
              <input
                :value="form.horometro ?? ''"
                type="number"
                min="0"
                :class="[campo, 'font-mono']"
                @input="patch('horometro', $event.target.value)"
              />
            </label>
          </div>
        </template>

        <template v-else>
          <label class="block space-y-1.5">
            <span :class="etiqueta">Nombre de la marca</span>
            <input
              :value="form.nombre"
              type="text"
              :class="campo"
              @input="patch('nombre', $event.target.value)"
            />
          </label>
        </template>
      </div>

      <footer class="flex items-center justify-end gap-2 border-t border-[#4a2870]/50 bg-[#10041f] px-5 py-4 sm:px-6">
        <button
          type="button"
          class="rounded-xl border border-[#4a2870]/60 bg-[#140a22] px-5 py-2.5 text-sm text-slate-300 hover:text-white"
          @click="emit('close')"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="rounded-xl border border-lyer-accent/40 bg-[#2a0a4a] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#3a1260]"
          @click="emit('guardar')"
        >
          Guardar
        </button>
      </footer>
    </div>
  </div>
</template>
