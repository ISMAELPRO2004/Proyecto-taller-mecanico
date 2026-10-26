<script setup>
import { ref, computed } from 'vue';
import { ordenService } from '../../../../services/ordenService.js';
import { generarOrdenPDF } from '../../../../utils/ordenPdf.js';
import { useAuthStore } from '../../../../stores/auth.js';
import { notify } from '../../../../utils/alerts.js';
import { puedeVerPrecios, puedeImprimir } from '../../../../utils/roles.js';
import ModalFacturaOrden from '../factura/ModalFacturaOrden.vue';
import { facturaPendiente } from '../composables/usePermisosOrden.js';
import { ESTADO, labelEstadoOrden } from '../../../../constants/estadosOrden.js';
import { useCargaDetalleOrden } from './useCargaDetalleOrden.js';
import {
  X, Printer, User, Car, Wrench, Package, FileText, Download, Camera, Clock
} from 'lucide-vue-next';

const props = defineProps({
  ordenId: { type: Number, default: null },
  isOpen:  { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'actualizada']);
const auth = useAuthStore();
const verPrecios = computed(() => puedeVerPrecios(auth.usuario?.rol));
const puedeVerImprimir = computed(() => puedeImprimir(auth.usuario?.rol));
const esAdmin = computed(() => auth.usuario?.rol === 'ADMIN');
const { orden, loading, fotos } = useCargaDetalleOrden(props);
const facturaAbierta = ref(false);
const guardandoFactura = ref(false);
const pendienteFactura = computed(() =>
  esAdmin.value && facturaPendiente(orden.value)
);

const montoValido = (valor) => {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
};

const soles = (valor) => {
  const n = montoValido(valor);
  return n === null ? 'Sin precio' : `S/ ${n.toFixed(2)}`;
};

const totalLinea = (cantidad, precio) => {
  const c = montoValido(cantidad);
  const p = montoValido(precio);
  if (c === null || p === null) return 'Sin precio';
  return `S/ ${(c * p).toFixed(2)}`;
};

const medida = (valor, unidad) => {
  if (valor === null || valor === undefined || valor === '') return '—';
  const n = Number(valor);
  const texto = Number.isFinite(n) ? n.toLocaleString('es-PE') : String(valor);
  return `${texto} ${unidad}`;
};

const fechaIngreso = computed(() => {
  const valor = orden.value?.fechaCreacion;
  if (!valor) return '';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
});

const tonoEstado = (estado) => {
  if (estado === ESTADO.TERMINADO) return 'border-green-500/40 bg-green-500/10 text-green-300';
  if (estado === ESTADO.CANCELADO) return 'border-rose-500/40 bg-rose-500/10 text-rose-300';
  if (estado === ESTADO.ESPERANDO_REPUESTO) return 'border-amber-500/40 bg-amber-500/10 text-amber-300';
  return 'border-lyer-cyan/40 bg-lyer-cyan/10 text-lyer-cyan';
};

const totalDetalle = computed(() => {
  const actual = orden.value;
  if (!actual) return 0;
  const materiales = (actual.materiales || []).reduce(
    (acc, m) => acc + Number(m.cantidad || 0) * Number(m.precioAplicado || 0),
    0
  );
  const servicios = (actual.servicios || []).reduce((acc, s) => acc + Number(s.monto || 0), 0);
  const terceros = (actual.terceros || []).reduce((acc, t) => acc + Number(t.monto || 0), 0);
  return Math.round((materiales + servicios + terceros) * 100) / 100;
});

const guardarFactura = async (payload) => {
  guardandoFactura.value = true;
  try {
    if (orden.value.estado === ESTADO.TERMINADO) {
      orden.value = await ordenService.cambiarEstado(props.ordenId, { estado: ESTADO.CANCELADO, ...payload });
      notify.success('Orden cancelada', 'La facturación quedó registrada.');
    } else {
      orden.value = await ordenService.actualizarFactura(props.ordenId, payload);
      notify.success('Factura actualizada');
    }
    facturaAbierta.value = false;
    emit('actualizada');
  } catch (error) {
    notify.error('No se pudo guardar la factura', error.response?.data?.message);
  } finally {
    guardandoFactura.value = false;
  }
};

const generarPDF = async () => {
  if (!orden.value) return;
  try {
    await generarOrdenPDF(orden.value, { verPrecios: verPrecios.value, accion: 'descargar' });
  } catch (e) {
    console.error('PDF Error:', e);
  }
};

const imprimir = async () => {
  if (!orden.value) return;
  try {
    await generarOrdenPDF(orden.value, { verPrecios: verPrecios.value, accion: 'imprimir' });
  } catch (e) {
    console.error('Print Error:', e);
    notify.error('No se pudo abrir la impresión');
  }
};
</script>

<template>
  <div :class="['modal', { 'modal-open': isOpen }]">
    <div class="modal-box flex max-h-[92vh] w-11/12 max-w-4xl flex-col overflow-hidden !border !border-lyer-linea/60 !bg-lyer-panel p-0 text-lyer-fg shadow-2xl sm:rounded-2xl">
      <div class="h-1 w-full shrink-0 bg-gradient-to-r from-lyer-green via-lyer-accent to-lyer-cyan" />

      <header class="flex shrink-0 items-center justify-between gap-3 border-b border-lyer-linea/50 bg-lyer-barra px-5 py-4 sm:px-6">
        <div class="flex min-w-0 items-center gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
            <FileText class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="truncate font-display text-lg font-bold uppercase tracking-tight text-lyer-fg sm:text-xl">
                Orden {{ orden?.numeroOrden || '...' }}
              </h3>
              <span
                v-if="orden"
                :class="['inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider', tonoEstado(orden.estado)]"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-current" />
                {{ labelEstadoOrden(orden.estado) }}
              </span>
            </div>
            <p class="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-lyer-muted">Mecánica LYER Motors</p>
          </div>
        </div>
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-lyer-linea/50 bg-lyer-fondo text-lyer-muted hover:text-lyer-fg"
          title="Cerrar"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </header>

      <div class="flex-1 space-y-6 overflow-y-auto bg-lyer-hueco px-5 py-5 sm:px-6">
        <div v-if="loading" class="flex flex-col items-center gap-3 py-20 text-center">
          <span class="loading loading-ring loading-lg text-lyer-accent" />
          <p class="text-[10px] font-semibold uppercase tracking-widest text-lyer-muted">Cargando la orden</p>
        </div>

        <div v-else-if="orden" class="animate-fade-in space-y-6">
          <section class="space-y-2">
            <div class="flex items-center gap-2 text-lyer-muted">
              <User class="h-4 w-4 text-lyer-cyan" />
              <span class="font-mono text-[11px] font-semibold uppercase tracking-wider">Información del cliente</span>
            </div>
            <div class="space-y-3 rounded-xl border border-lyer-linea/45 bg-lyer-panel p-4 sm:p-5">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex flex-wrap items-center gap-2">
                  <h4 class="font-display text-xl font-bold text-lyer-fg sm:text-2xl">{{ orden.cliente?.nombreRazonSocial || '—' }}</h4>
                  <span
                    v-if="orden.cliente?.numeroDocumento"
                    class="rounded-md border border-lyer-linea/50 bg-lyer-fondo px-2 py-0.5 font-mono text-[11px] text-lyer-muted"
                  >
                    {{ orden.cliente.tipoDocumento || 'DOC' }} {{ orden.cliente.numeroDocumento }}
                  </span>
                  <span class="rounded-md border border-lyer-cyan/30 bg-lyer-cyan/10 px-2 py-0.5 font-mono text-[11px] text-lyer-cyan">
                    {{ orden.cliente?.celular || 'Sin celular' }}
                  </span>
                </div>
                <p v-if="fechaIngreso" class="inline-flex items-center gap-1.5 font-mono text-[11px] text-lyer-muted">
                  <Clock class="h-3.5 w-3.5" />
                  Ingreso {{ fechaIngreso }}
                </p>
              </div>
              <div v-if="orden.descripcionInformal" class="rounded-lg border-l-2 border-lyer-cyan bg-lyer-fondo px-4 py-3">
                <p class="text-[10px] font-semibold uppercase tracking-widest text-lyer-muted">Solicitud del cliente</p>
                <p class="mt-1 text-sm leading-relaxed text-lyer-fg">{{ orden.descripcionInformal }}</p>
              </div>
              <div v-if="orden.trabajoSolicitado" class="rounded-lg border-l-2 border-lyer-accent bg-lyer-fondo px-4 py-3">
                <p class="text-[10px] font-semibold uppercase tracking-widest text-lyer-muted">Trabajos a realizar</p>
                <p class="mt-1 text-sm leading-relaxed text-lyer-fg">{{ orden.trabajoSolicitado }}</p>
              </div>
            </div>
          </section>

          <section class="space-y-2">
            <div class="flex items-center gap-2 text-lyer-muted">
              <Car class="h-4 w-4 text-lyer-cyan" />
              <span class="font-mono text-[11px] font-semibold uppercase tracking-wider">Datos de la unidad</span>
            </div>
            <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div class="rounded-xl border border-lyer-cyan/30 bg-lyer-panel p-3.5">
                <span class="font-mono text-[10px] uppercase tracking-wider text-lyer-muted">Placa</span>
                <p class="mt-2 font-mono text-lg font-bold tracking-widest text-lyer-cyan">{{ orden.placa || '—' }}</p>
              </div>
              <div class="rounded-xl border border-lyer-linea/45 bg-lyer-panel p-3.5">
                <span class="font-mono text-[10px] uppercase tracking-wider text-lyer-muted">Marca / modelo</span>
                <p class="mt-2 truncate text-sm font-bold uppercase text-lyer-fg">
                  {{ orden.vehiculo?.marca?.nombre || '—' }} {{ orden.vehiculo?.modelo }}
                </p>
              </div>
              <div class="rounded-xl border border-lyer-linea/45 bg-lyer-panel p-3.5">
                <span class="font-mono text-[10px] uppercase tracking-wider text-lyer-muted">Kilometraje</span>
                <p class="mt-2 font-mono text-sm font-bold text-lyer-fg">{{ medida(orden.vehiculo?.kilometraje, 'km') }}</p>
              </div>
              <div class="rounded-xl border border-lyer-linea/45 bg-lyer-panel p-3.5">
                <span class="font-mono text-[10px] uppercase tracking-wider text-lyer-muted">Horómetro</span>
                <p class="mt-2 font-mono text-sm font-bold text-lyer-fg">{{ medida(orden.vehiculo?.horometro, 'h') }}</p>
              </div>
            </div>
          </section>

          <section
            v-if="orden.estado === ESTADO.TERMINADO && esAdmin"
            class="flex flex-col justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center"
          >
            <div>
              <p class="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300">Orden terminada</p>
              <p class="mt-1 text-sm text-lyer-fg">Nadie puede modificar el trabajo. Pásala a Cancelado para registrar la factura.</p>
            </div>
            <button
              type="button"
              class="rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-amber-200 hover:bg-amber-500/25"
              @click="facturaAbierta = true"
            >
              Cancelar y facturar
            </button>
          </section>

          <section
            v-if="esAdmin && orden.estado === ESTADO.CANCELADO"
            :class="[
              'flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center',
              pendienteFactura ? 'border-amber-500/30 bg-amber-500/10' : 'border-lyer-linea/45 bg-lyer-panel',
            ]"
          >
            <div>
              <p class="font-mono text-[10px] font-bold uppercase tracking-widest" :class="pendienteFactura ? 'text-amber-300' : 'text-lyer-muted'">
                {{ pendienteFactura ? 'Factura pendiente' : (orden.requiereFactura ? 'Factura registrada' : 'Sin factura') }}
              </p>
              <p v-if="orden.requiereFactura" class="mt-1 text-sm font-semibold text-lyer-fg">
                {{ orden.numeroFactura || 'Sin número' }}
                <span v-if="orden.montoFactura != null"> · {{ soles(orden.montoFactura) }}</span>
              </p>
            </div>
            <button
              type="button"
              class="rounded-xl border border-lyer-accent/40 bg-lyer-boton px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-lyer-fg hover:bg-lyer-boton"
              @click="facturaAbierta = true"
            >
              Completar factura
            </button>
          </section>

          <section class="space-y-2">
            <div class="flex items-center gap-2 text-lyer-muted">
              <Camera class="h-4 w-4 text-lyer-cyan" />
              <span class="font-mono text-[11px] font-semibold uppercase tracking-wider">Fotos</span>
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <article class="overflow-hidden rounded-xl border border-lyer-linea/45 bg-lyer-panel">
                <p class="px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-lyer-muted">Registro inicial</p>
                <img v-if="fotos.registro" :src="fotos.registro" alt="Foto de registro" class="h-48 w-full object-cover sm:h-52" />
                <div v-else class="flex h-48 flex-col items-center justify-center text-slate-500 sm:h-52">
                  <Camera class="mb-2 h-7 w-7" />
                  <span class="text-[11px] font-semibold uppercase tracking-wider">Sin foto</span>
                </div>
              </article>
              <article class="overflow-hidden rounded-xl border border-lyer-linea/45 bg-lyer-panel">
                <p class="px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-lyer-muted">Desarrollo</p>
                <img v-if="fotos.desarrollo" :src="fotos.desarrollo" alt="Foto de desarrollo" class="h-48 w-full object-cover sm:h-52" />
                <div v-else class="flex h-48 flex-col items-center justify-center text-slate-500 sm:h-52">
                  <Camera class="mb-2 h-7 w-7" />
                  <span class="text-[11px] font-semibold uppercase tracking-wider">Sin foto</span>
                </div>
              </article>
            </div>
          </section>

          <div class="space-y-6">
            <section v-if="orden.materiales?.length" class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 text-lyer-muted">
                  <Package class="h-4 w-4 text-lyer-cyan" />
                  <span class="font-mono text-[11px] font-semibold uppercase tracking-wider">Repuestos y materiales</span>
                </div>
                <span class="font-mono text-[10px] text-lyer-muted">{{ orden.materiales.length }}</span>
              </div>
              <div class="overflow-hidden rounded-xl border border-lyer-linea/45 bg-lyer-panel">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="border-b border-lyer-linea/40 bg-lyer-barra font-mono text-[10px] uppercase tracking-wider text-lyer-muted">
                      <th class="w-14 px-3 py-2 text-center">Cant.</th>
                      <th class="px-3 py-2">Descripción</th>
                      <th v-if="verPrecios" class="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="m in orden.materiales" :key="m.id" class="border-b border-lyer-linea/25 last:border-0">
                      <td class="px-3 py-2.5 text-center font-mono font-bold text-lyer-cyan">{{ m.cantidad }}</td>
                      <td class="px-3 py-2.5 font-medium text-lyer-fg">{{ m.material?.descripcion }}</td>
                      <td v-if="verPrecios" class="px-3 py-2.5 text-right font-mono text-lyer-fg">
                        {{ totalLinea(m.cantidad, m.precioAplicado) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section v-if="orden.servicios?.length" class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 text-lyer-muted">
                  <Wrench class="h-4 w-4 text-lyer-cyan" />
                  <span class="font-mono text-[11px] font-semibold uppercase tracking-wider">Mano de obra</span>
                </div>
                <span class="font-mono text-[10px] text-lyer-muted">{{ orden.servicios.length }}</span>
              </div>
              <div class="overflow-hidden rounded-xl border border-lyer-linea/45 bg-lyer-panel">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="border-b border-lyer-linea/40 bg-lyer-barra font-mono text-[10px] uppercase tracking-wider text-lyer-muted">
                      <th class="px-3 py-2">Operación</th>
                      <th v-if="verPrecios" class="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="s in orden.servicios" :key="'s-' + s.id" class="border-b border-lyer-linea/25 last:border-0">
                      <td class="px-3 py-2.5 font-medium text-lyer-fg">{{ s.descripcion }}</td>
                      <td v-if="verPrecios" class="px-3 py-2.5 text-right font-mono text-lyer-fg">{{ soles(s.monto) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section v-if="orden.terceros?.length" class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 text-lyer-muted">
                  <Wrench class="h-4 w-4 text-lyer-soft" />
                  <span class="font-mono text-[11px] font-semibold uppercase tracking-wider">Trabajos externos</span>
                </div>
                <span class="font-mono text-[10px] text-lyer-muted">{{ orden.terceros.length }}</span>
              </div>
              <div class="overflow-hidden rounded-xl border border-lyer-linea/45 bg-lyer-panel">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="border-b border-lyer-linea/40 bg-lyer-barra font-mono text-[10px] uppercase tracking-wider text-lyer-muted">
                      <th class="px-3 py-2">Descripción</th>
                      <th class="px-3 py-2">Responsable</th>
                      <th v-if="verPrecios" class="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="t in orden.terceros" :key="'t-' + t.id" class="border-b border-lyer-linea/25 last:border-0">
                      <td class="px-3 py-2.5 font-medium text-lyer-fg">{{ t.descripcion }}</td>
                      <td class="px-3 py-2.5 text-lyer-muted">{{ t.tercero?.responsable || '—' }}</td>
                      <td v-if="verPrecios" class="px-3 py-2.5 text-right font-mono text-lyer-fg">{{ soles(t.monto) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div
            v-if="verPrecios"
            class="flex flex-col items-center justify-between gap-4 rounded-xl border border-lyer-cyan/25 bg-lyer-barra p-5 sm:flex-row sm:p-6"
          >
            <div class="text-center sm:text-left">
              <p class="font-mono text-[10px] font-bold uppercase tracking-widest text-lyer-cyan">Resumen económico</p>
              <h5 class="mt-1 font-display text-lg font-bold text-lyer-fg sm:text-2xl">Inversión final del servicio</h5>
              <p class="mt-1 font-mono text-[11px] text-lyer-muted">Mecánica LYER Motors · Huancayo</p>
            </div>
            <div class="rounded-xl border border-lyer-cyan/30 bg-lyer-fondo px-6 py-3 text-center sm:text-right">
              <p class="font-mono text-[10px] uppercase tracking-wider text-lyer-muted">Total</p>
              <p class="font-display text-3xl font-bold tracking-tight text-lyer-cyan sm:text-4xl">S/ {{ totalDetalle.toFixed(2) }}</p>
            </div>
          </div>

        </div><!-- fin v-else-if="orden" -->

      </div><!-- fin scroll -->

      <footer class="no-print flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-lyer-linea/50 bg-lyer-barra px-5 py-4">
        <button
          type="button"
          class="rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-lyer-muted hover:text-lyer-fg"
          @click="emit('close')"
        >
          Cerrar
        </button>
        <button
          v-if="puedeVerImprimir"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border border-lyer-linea/50 bg-lyer-fondo px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-lyer-fg hover:text-lyer-fg"
          @click="imprimir"
        >
          <Printer class="h-4 w-4" />
          Imprimir
        </button>
        <button
          v-if="puedeVerImprimir"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border border-lyer-accent/40 bg-lyer-boton px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-lyer-fg hover:bg-lyer-boton"
          @click="generarPDF"
        >
          <Download class="h-4 w-4" />
          PDF
        </button>
      </footer>

    </div>
    <ModalFacturaOrden
      :is-open="facturaAbierta"
      :orden="orden"
      :guardando="guardandoFactura"
      @close="facturaAbierta = false"
      @guardar="guardarFactura"
    />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: modalFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media print {
  .no-print { display: none !important; }
  .modal-box {
    max-height: none !important;
    height: auto !important;
    position: absolute !important;
    top: 0 !important; left: 0 !important;
    width: 100% !important;
    border: none !important;
    box-shadow: none !important;
  }
}
</style>