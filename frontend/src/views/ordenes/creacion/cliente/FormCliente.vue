<script setup>
import { User, Edit3, Phone, Mail, ChevronDown, Info, CheckCircle2 } from 'lucide-vue-next';
import FormBusquedaCliente from './FormBusquedaCliente.vue';

const props = defineProps({
  cliente: { type: Object, required: true },
  errores: { type: Object, default: () => ({}) },
  bloqueado: { type: Boolean, default: false },
  nombreBloqueado: { type: Boolean, default: false },
  consultado: { type: Boolean, default: false },
  esNuevo: { type: Boolean, default: true },
  puedeEditar: { type: Boolean, default: false },
  consultando: { type: Boolean, default: false },
});

const emit = defineEmits([
  'update:cliente',
  'actualizar-nombre',
  'cambiar-busqueda',
  'buscar-documento',
  'seleccionar-cliente',
  'editar',
]);

const digitosDocumento = (tipo, valor) => {
  const max = tipo === 'RUC' ? 11 : 8;
  return String(valor || '').replace(/\D/g, '').slice(0, max);
};

const patch = (campo, valor) => {
  if (props.bloqueado) return;
  const next = { ...props.cliente, [campo]: valor };
  if (campo === 'tipoCliente' && valor === 'EMPRESA') {
    next.tipoDocumento = 'RUC';
  }
  if (campo === 'tipoCliente' || campo === 'tipoDocumento') {
    next.numeroDocumento = digitosDocumento(next.tipoDocumento, next.numeroDocumento);
  }
  if (campo === 'numeroDocumento') {
    next.numeroDocumento = digitosDocumento(next.tipoDocumento, valor);
  }
  emit('update:cliente', next);
};

const onTipoBusqueda = (tipo) => {
  emit('cambiar-busqueda', { tipo, numero: digitosDocumento(tipo, props.cliente.numeroDocumento) });
};

const onNumeroBusqueda = (numero) => {
  emit('cambiar-busqueda', { tipo: props.cliente.tipoDocumento === 'RUC' ? 'RUC' : 'DNI', numero });
};

const campo = 'h-12 w-full rounded-xl border border-[#4a2870]/50 bg-[#140a22] px-4 text-sm text-white placeholder:text-slate-600 focus:border-lyer-cyan focus:outline-none disabled:cursor-not-allowed disabled:opacity-80';
</script>

<template>
  <section class="space-y-8 rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:p-8 md:p-10">
    <FormBusquedaCliente
      :tipo-documento="cliente.tipoDocumento === 'RUC' ? 'RUC' : 'DNI'"
      :numero-documento="cliente.numeroDocumento"
      :bloqueado="nombreBloqueado"
      :consultando="consultando"
      :error="errores.numeroDocumento"
      @update:tipo-documento="onTipoBusqueda"
      @update:numero-documento="onNumeroBusqueda"
      @buscar="$emit('buscar-documento')"
      @seleccionar="$emit('seleccionar-cliente', $event)"
    />

    <template v-if="consultado">
      <div class="border-t border-[#4a2870]/40" />

      <p v-if="esNuevo" class="flex items-start gap-2 text-sm text-slate-300">
        <Info class="mt-0.5 h-4 w-4 shrink-0 text-lyer-cyan" />
        <span>
          {{ cliente.tipoCliente === 'EMPRESA' ? 'Nueva empresa' : 'Nueva persona' }}.
          Completa los datos para registrarla. El nombre se rellena si la consulta lo encuentra.
        </span>
      </p>
      <p v-else class="flex items-start gap-2 text-sm text-lyer-cyan">
        <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0" />
        <span>{{ cliente.tipoCliente === 'EMPRESA' ? 'Empresa registrada' : 'Persona registrada' }}</span>
      </p>

      <div class="space-y-6">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
              <User class="h-4 w-4" />
            </div>
            <h2 class="font-display text-base font-bold uppercase tracking-wider text-white md:text-lg">Datos del cliente</h2>
          </div>
          <button
            v-if="bloqueado && puedeEditar"
            type="button"
            class="inline-flex items-center gap-1 text-sm font-semibold text-lyer-cyan hover:text-white"
            @click="$emit('editar')"
          >
            <Edit3 class="h-4 w-4" />
            Editar
          </button>
          <span
            v-else-if="bloqueado"
            class="rounded-md border border-lyer-cyan/30 bg-lyer-cyan/10 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-lyer-cyan"
          >
            Guardado
          </span>
        </div>

        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div class="md:col-span-2">
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              {{ cliente.tipoCliente === 'EMPRESA' ? 'Razón social' : 'Nombre y apellidos' }}
              <span class="text-lyer-accent">*</span>
            </label>
            <input
              :value="cliente.nombreRazonSocial"
              :disabled="bloqueado"
              placeholder="Se completa al consultar el documento"
              :class="[campo, errores.nombreRazonSocial ? 'border-rose-400' : '']"
              @input="$emit('actualizar-nombre', $event.target.value)"
            />
            <p v-if="errores.nombreRazonSocial" class="mt-1 text-sm font-medium text-rose-300">{{ errores.nombreRazonSocial }}</p>
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Tipo
              <span class="text-lyer-accent">*</span>
            </label>
            <div class="relative">
              <select
                :value="cliente.tipoCliente"
                :disabled="bloqueado"
                :class="[campo, 'appearance-none pr-10']"
                @change="patch('tipoCliente', $event.target.value)"
              >
                <option value="PERSONA">Persona</option>
                <option value="EMPRESA">Empresa</option>
              </select>
              <ChevronDown class="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
            </div>
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Representante / quien deja el vehículo
            </label>
            <input
              :value="cliente.representante"
              :disabled="bloqueado"
              placeholder="Opcional"
              :class="campo"
              @input="patch('representante', $event.target.value)"
            />
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Celular</label>
            <div class="relative">
              <Phone class="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                :value="cliente.celular"
                maxlength="9"
                inputmode="numeric"
                :disabled="bloqueado"
                placeholder="Opcional"
                :class="[campo, 'pl-10 font-mono', errores.celular ? 'border-rose-400' : '']"
                @input="patch('celular', $event.target.value.replace(/\D/g, ''))"
              />
            </div>
            <p v-if="errores.celular" class="mt-1 text-xs text-rose-300">{{ errores.celular }}</p>
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Correo electrónico</label>
            <div class="relative">
              <Mail class="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                :value="cliente.correo"
                type="email"
                :disabled="bloqueado"
                placeholder="Opcional"
                :class="[campo, 'pl-10']"
                @input="patch('correo', $event.target.value)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
