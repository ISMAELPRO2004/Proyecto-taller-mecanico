<script setup>
import { ChevronDown } from 'lucide-vue-next';
import { campo, etiqueta } from '../modal/campoRegistro.js';

const props = defineProps({
  form: { type: Object, required: true },
});

const emit = defineEmits(['update:form']);

const patch = (campoForm, valor) => {
  const next = { ...props.form, [campoForm]: valor };
  if (campoForm === 'tipoCliente' && valor === 'EMPRESA') {
    next.tipoDocumento = 'RUC';
  }
  emit('update:form', next);
};
</script>

<template>
  <div class="space-y-4">
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
  </div>
</template>
