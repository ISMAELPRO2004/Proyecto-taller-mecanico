<script setup>
import { ChevronDown } from 'lucide-vue-next';
import { campo, etiqueta } from '../modal/campoRegistro.js';

const props = defineProps({
  form: { type: Object, required: true },
  errores: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:form']);

const maxDocumento = (tipo) => (tipo === 'RUC' ? 11 : 8);

const digitosDocumento = (tipo, valor) => String(valor || '').replace(/\D/g, '').slice(0, maxDocumento(tipo));

const tipoDocumentoActual = () => (props.form.tipoCliente === 'EMPRESA' ? 'RUC' : props.form.tipoDocumento);

const patch = (campoForm, valor) => {
  const next = { ...props.form, [campoForm]: valor };
  if (campoForm === 'tipoCliente' && valor === 'EMPRESA') {
    next.tipoDocumento = 'RUC';
  }
  if (campoForm === 'tipoCliente' || campoForm === 'tipoDocumento') {
    next.numeroDocumento = digitosDocumento(next.tipoCliente === 'EMPRESA' ? 'RUC' : next.tipoDocumento, next.numeroDocumento);
  }
  if (campoForm === 'numeroDocumento') {
    next.numeroDocumento = digitosDocumento(tipoDocumentoActual(), valor);
  }
  if (campoForm === 'celular') {
    next.celular = String(valor || '').replace(/\D/g, '').slice(0, 9);
  }
  emit('update:form', next);
};

const conError = (nombre) => [campo, props.errores[nombre] ? 'border-rose-400 focus:border-rose-400' : ''];
</script>

<template>
  <div class="space-y-4">
    <label class="block space-y-1.5">
      <span :class="etiqueta">Nombre / razón social</span>
      <input
        :value="form.nombreRazonSocial"
        type="text"
        :class="conError('nombreRazonSocial')"
        @input="patch('nombreRazonSocial', $event.target.value)"
      />
      <p v-if="errores.nombreRazonSocial" class="text-xs text-rose-300">{{ errores.nombreRazonSocial }}</p>
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
          <ChevronDown class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lyer-muted" />
        </span>
      </label>
      <label class="block space-y-1.5">
        <span :class="etiqueta">Tipo de documento</span>
        <span class="relative block">
          <select
            :value="tipoDocumentoActual()"
            :disabled="form.tipoCliente === 'EMPRESA'"
            :class="[campo, 'appearance-none pr-10 disabled:opacity-60', errores.tipoDocumento ? 'border-rose-400' : '']"
            @change="patch('tipoDocumento', $event.target.value)"
          >
            <option v-if="form.tipoCliente !== 'EMPRESA'" value="DNI">DNI</option>
            <option value="RUC">RUC</option>
          </select>
          <ChevronDown class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lyer-muted" />
        </span>
        <p v-if="errores.tipoDocumento" class="text-xs text-rose-300">{{ errores.tipoDocumento }}</p>
      </label>
    </div>

    <label class="block space-y-1.5">
      <span :class="etiqueta">Número de documento</span>
      <input
        :value="form.numeroDocumento"
        type="text"
        inputmode="numeric"
        :maxlength="maxDocumento(tipoDocumentoActual())"
        :placeholder="tipoDocumentoActual() === 'RUC' ? '11 dígitos' : '8 dígitos'"
        :class="[conError('numeroDocumento'), 'font-mono']"
        @input="patch('numeroDocumento', $event.target.value)"
      />
      <p v-if="errores.numeroDocumento" class="text-xs text-rose-300">{{ errores.numeroDocumento }}</p>
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
          :class="[conError('celular'), 'font-mono']"
          @input="patch('celular', $event.target.value)"
        />
        <p v-if="errores.celular" class="text-xs text-rose-300">{{ errores.celular }}</p>
      </label>
      <label class="block space-y-1.5">
        <span :class="etiqueta">Correo</span>
        <input
          :value="form.correo"
          type="email"
          placeholder="correo@ejemplo.com"
          :class="conError('correo')"
          @input="patch('correo', $event.target.value)"
        />
        <p v-if="errores.correo" class="text-xs text-rose-300">{{ errores.correo }}</p>
      </label>
    </div>
  </div>
</template>
