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
  modoBusqueda: { type: String, default: 'documento' },
  buscandoDocumento: { type: Boolean, default: false },
});

const emit = defineEmits([
  'update:cliente',
  'cambiar-modo-busqueda',
  'actualizar-nombre',
  'marcar-cliente-nuevo',
  'seleccionar-cliente',
  'consultar-documento',
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

const campo = 'h-12 w-full rounded-xl border border-lyer-linea/50 bg-lyer-fondo px-4 text-sm text-lyer-fg placeholder:text-lyer-muted focus:border-lyer-cyan focus:outline-none disabled:cursor-not-allowed disabled:opacity-80';
</script>

<template>
  <section class="space-y-8 rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:p-8 md:p-10">
    <FormBusquedaCliente
      :modo="modoBusqueda"
      :nombre="cliente.nombreRazonSocial"
      :tipo-documento="cliente.tipoDocumento"
      :numero-documento="cliente.numeroDocumento"
      :bloqueado="nombreBloqueado"
      :buscando="buscandoDocumento"
      :error-nombre="errores.nombreRazonSocial"
      :error-documento="errores.numeroDocumento"
      @cambiar-modo="$emit('cambiar-modo-busqueda', $event)"
      @update:nombre="$emit('actualizar-nombre', $event)"
      @update:tipo-documento="patch('tipoDocumento', $event)"
      @update:numero-documento="patch('numeroDocumento', $event)"
      @marcar-nuevo="$emit('marcar-cliente-nuevo')"
      @seleccionar="$emit('seleccionar-cliente', $event)"
      @consultar="$emit('consultar-documento')"
    />

    <template v-if="consultado">
      <div class="border-t border-lyer-linea/40" />

      <p v-if="esNuevo" class="flex items-start gap-2 text-sm text-lyer-muted">
        <Info class="mt-0.5 h-4 w-4 shrink-0 text-lyer-cyan" />
        <span>
          {{ cliente.tipoCliente === 'EMPRESA' ? 'Nueva empresa' : 'Nueva persona' }}.
          Completa los datos para registrarla.
          {{ modoBusqueda === 'nombre' ? 'El documento es opcional.' : '' }}
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
            <h2 class="font-display text-base font-bold uppercase tracking-wider text-lyer-fg md:text-lg">Datos del cliente</h2>
          </div>
          <button
            v-if="bloqueado && puedeEditar"
            type="button"
            class="inline-flex items-center gap-1 text-sm font-semibold text-lyer-cyan hover:text-lyer-fg"
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
          <div v-if="modoBusqueda === 'documento'">
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-lyer-muted">
              Nombre / razón social
              <span class="text-lyer-accent">*</span>
            </label>
            <input
              :value="cliente.nombreRazonSocial"
              :disabled="bloqueado"
              :class="[campo, errores.nombreRazonSocial ? 'border-rose-400' : '']"
              @input="patch('nombreRazonSocial', $event.target.value)"
            />
            <p v-if="errores.nombreRazonSocial" class="mt-1 text-xs text-rose-300">{{ errores.nombreRazonSocial }}</p>
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-lyer-muted">
              Tipo
              <span class="text-lyer-accent">*</span>
            </label>
            <div class="relative">
              <select
                :value="cliente.tipoCliente"
                :disabled="bloqueado || modoBusqueda === 'documento'"
                :class="[campo, 'appearance-none pr-10']"
                @change="patch('tipoCliente', $event.target.value)"
              >
                <option value="PERSONA">Persona</option>
                <option value="EMPRESA">Empresa</option>
              </select>
              <ChevronDown class="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-lyer-muted" />
            </div>
          </div>

          <template v-if="modoBusqueda === 'nombre'">
            <div>
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-lyer-muted">Documento</label>
              <div class="relative">
                <select
                  :value="cliente.tipoCliente === 'EMPRESA' ? 'RUC' : cliente.tipoDocumento"
                  :disabled="bloqueado || cliente.tipoCliente === 'EMPRESA'"
                  :class="[campo, 'appearance-none pr-10', errores.tipoDocumento ? 'border-rose-400' : '']"
                  @change="patch('tipoDocumento', $event.target.value)"
                >
                  <option v-if="cliente.tipoCliente !== 'EMPRESA'" value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                </select>
                <p v-if="errores.tipoDocumento" class="mt-1 text-xs text-rose-300">{{ errores.tipoDocumento }}</p>
                <ChevronDown class="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-lyer-muted" />
              </div>
            </div>

            <div>
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-lyer-muted">N° documento</label>
              <input
                :value="cliente.numeroDocumento"
                :disabled="bloqueado"
                inputmode="numeric"
                :maxlength="cliente.tipoDocumento === 'RUC' ? 11 : 8"
                placeholder="Opcional"
                :class="[campo, 'font-mono', errores.numeroDocumento ? 'border-rose-400' : '']"
                @input="patch('numeroDocumento', $event.target.value)"
              />
              <p v-if="errores.numeroDocumento" class="mt-1 text-xs text-rose-300">{{ errores.numeroDocumento }}</p>
            </div>
          </template>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-lyer-muted">
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
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-lyer-muted">Celular</label>
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
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-lyer-muted">Correo electrónico</label>
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
