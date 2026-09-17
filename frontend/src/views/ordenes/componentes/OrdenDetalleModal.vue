<script setup>
import { ref, watch, computed } from 'vue';
import { ordenService } from '../../../services/ordenService.js';
import { generarOrdenPDF } from '../../../utils/ordenPdf.js';
import { useAuthStore } from '../../../stores/auth.js';
import { notify } from '../../../utils/alerts.js';
import CampoFoto from './CampoFoto.vue';
import ModalFacturaOrden from './ModalFacturaOrden.vue';
import { facturaPendiente } from '../composables/usePermisosOrden.js';
import {
  X, Printer, User, Car, Wrench, Package, FileText, Download
} from 'lucide-vue-next';

const props = defineProps({
  ordenId: { type: Number, default: null },
  isOpen:  { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'actualizada']);
const auth = useAuthStore();
const verPrecios = computed(() => auth.usuario?.rol !== 'TECNICO');
const esAdmin = computed(() => auth.usuario?.rol === 'ADMIN');
const fotos = ref({ registro: '', desarrollo: '' });
const subiendoFoto = ref('');
const orden   = ref(null);
const loading = ref(false);
const facturaAbierta = ref(false);
const guardandoFactura = ref(false);
const pendienteFactura = computed(() => facturaPendiente(orden.value));

const revocarFotos = () => {
  if (fotos.value.registro) URL.revokeObjectURL(fotos.value.registro);
  if (fotos.value.desarrollo) URL.revokeObjectURL(fotos.value.desarrollo);
  fotos.value = { registro: '', desarrollo: '' };
};

const cargarFoto = async (tipo, ruta) => {
  if (!ruta || !props.ordenId) return;
  try {
    const blob = await ordenService.descargarFoto(props.ordenId, tipo);
    if (fotos.value[tipo]) URL.revokeObjectURL(fotos.value[tipo]);
    fotos.value[tipo] = URL.createObjectURL(blob);
  } catch {
    fotos.value[tipo] = '';
  }
};

const cargarDetalle = async () => {
  if (!props.ordenId) return;
  loading.value = true;
  try {
    orden.value = await ordenService.obtener(props.ordenId);
    await Promise.all([
      cargarFoto('registro', orden.value.fotoRegistro),
      cargarFoto('desarrollo', orden.value.fotoDesarrollo),
    ]);
  } catch (error) {
    console.error('Error al cargar detalle:', error);
  } finally {
    loading.value = false;
  }
};

const cambiarRegistro = async (file) => {
  subiendoFoto.value = 'registro';
  try {
    const actualizada = await ordenService.subirFoto(props.ordenId, 'registro', file);
    orden.value = actualizada;
    await cargarFoto('registro', actualizada.fotoRegistro);
  } catch (error) {
    notify.error('No se pudo cambiar la foto', error.response?.data?.message);
  } finally {
    subiendoFoto.value = '';
  }
};

const quitarRegistro = async () => {
  subiendoFoto.value = 'registro';
  try {
    const actualizada = await ordenService.quitarFoto(props.ordenId, 'registro');
    orden.value = actualizada;
    if (fotos.value.registro) URL.revokeObjectURL(fotos.value.registro);
    fotos.value.registro = '';
  } catch (error) {
    notify.error('No se pudo quitar', error.response?.data?.message);
  } finally {
    subiendoFoto.value = '';
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) cargarDetalle();
  else {
    orden.value = null;
    revocarFotos();
  }
});

const guardarFactura = async (payload) => {
  guardandoFactura.value = true;
  try {
    if (orden.value.estado === 'TERMINADO') {
      orden.value = await ordenService.cambiarEstado(props.ordenId, { estado: 'CANCELADO', ...payload });
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

const generarPDF = () => {
  if (!orden.value) return;
  try {
    generarOrdenPDF(orden.value, { verPrecios: verPrecios.value });
  } catch (e) {
    console.error('PDF Error:', e);
  }
};

const imprimir = () => { window.print(); };
</script>

<template>
  <div :class="['modal', { 'modal-open': isOpen }]">
    <div class="modal-box w-11/12 max-w-4xl p-0 flex flex-col max-h-[92vh] border border-slate-200 overflow-hidden shadow-2xl rounded-3xl">

      <!-- Header -->
      <header class="bg-white p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
        <div class="flex items-center gap-3 sm:gap-4 min-w-0">
          <div class="bg-lyer-green/10 p-2 sm:p-3 rounded-2xl text-lyer-green shrink-0">
            <FileText class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div class="min-w-0">
            <h3 class="text-base sm:text-xl font-black text-slate-800 tracking-tight uppercase truncate">
              Orden <span class="text-lyer-green">{{ orden?.numeroOrden || '...' }}</span>
            </h3>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Mecánica LYER Motors</p>
          </div>
        </div>
        <button @click="emit('close')"
          class="btn btn-circle btn-ghost btn-sm text-slate-400 hover:text-red-500 transition-colors shrink-0">
          <X class="w-5 h-5" />
        </button>
      </header>

      <!-- Contenido scrolleable -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 space-y-8 bg-white">

        <!-- Loading -->
        <div v-if="loading" class="py-20 text-center flex flex-col items-center gap-4">
          <span class="loading loading-ring loading-lg text-lyer-green"></span>
          <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronizando...</p>
        </div>

        <!-- Contenido — solo cuando orden tiene datos -->
        <div v-else-if="orden" class="animate-fade-in space-y-8 sm:space-y-12">

          <!-- Cliente -->
          <section class="space-y-4">
            <div class="flex items-center gap-2 text-lyer-green font-black uppercase text-[10px] tracking-[0.2em] opacity-70">
              <User class="w-4 h-4" /> Información del Cliente
            </div>
            <div class="bg-slate-50/50 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 space-y-2">
              <h4 class="text-2xl sm:text-3xl font-black text-slate-800 leading-none">{{ orden.cliente?.nombreRazonSocial || '—' }}</h4>
              <div class="flex items-center gap-3">
                <span class="text-[10px] bg-lyer-accent text-white px-2 py-0.5 rounded-full font-bold">CONTACTO</span>
                <p class="text-sm font-bold text-slate-500">{{ orden.cliente?.celular || 'N/A' }}</p>
              </div>
              <div class="mt-4 p-4 bg-white rounded-2xl border border-slate-100 text-slate-600 text-sm italic leading-relaxed shadow-sm">
                "{{ orden.trabajoSolicitado }}"
              </div>
            </div>
          </section>

          <!-- Vehículo -->
          <section class="space-y-4">
            <div class="flex items-center gap-2 text-lyer-accent font-black uppercase text-[10px] tracking-[0.2em] opacity-70">
              <Car class="w-4 h-4" /> Datos de la Unidad
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-100/50 text-center">
                <span class="block text-[9px] uppercase font-bold text-emerald-600/60 mb-1">Placa</span>
                <span class="text-lg sm:text-xl font-black text-emerald-950 block">{{ orden.placa }}</span>
              </div>
              <div class="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-100/50 text-center">
                <span class="block text-[9px] uppercase font-bold text-emerald-600/60 mb-1">Marca / Modelo</span>
                <span class="text-xs sm:text-sm font-black text-emerald-900 block truncate uppercase">
                  {{ orden.vehiculo?.marca?.nombre }} {{ orden.vehiculo?.modelo }}
                </span>
              </div>
              <div class="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 text-center">
                <span class="block text-[9px] uppercase font-bold text-slate-400 mb-1">Kilometraje</span>
                <span class="text-xs sm:text-sm font-black text-slate-700 block">
                  {{ orden.kilometraje }} <small class="text-[8px] opacity-50">KM</small>
                </span>
              </div>
              <div class="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 text-center">
                <span class="block text-[9px] uppercase font-bold text-slate-400 mb-1">Horómetro</span>
                <span class="text-xs sm:text-sm font-black text-slate-700 block">
                  {{ orden.horometro }} <small class="text-[8px] opacity-50">H</small>
                </span>
              </div>
            </div>
          </section>

          <section
            v-if="orden.estado === 'TERMINADO' && esAdmin"
            class="rounded-2xl p-4 border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Orden terminada</p>
              <p class="text-sm font-bold text-slate-600">Nadie puede modificar el trabajo. Puedes cancelarla y registrar la factura.</p>
            </div>
            <button type="button" class="btn btn-sm bg-red-500 text-white border-none rounded-xl" @click="facturaAbierta = true">
              Cancelar
            </button>
          </section>

          <section
            v-if="orden.estado === 'CANCELADO'"
            :class="['rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3', pendienteFactura ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100']"
          >
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest" :class="pendienteFactura ? 'text-amber-600 animate-pulse' : 'text-slate-400'">
                {{ pendienteFactura ? 'Factura pendiente' : (orden.requiereFactura ? 'Factura registrada' : 'Sin factura') }}
              </p>
              <p v-if="orden.requiereFactura" class="text-sm font-bold text-slate-700">
                {{ orden.numeroFactura || 'Sin número' }}
                <span v-if="orden.montoFactura != null"> · S/ {{ Number(orden.montoFactura).toFixed(2) }}</span>
              </p>
            </div>
            <button v-if="esAdmin" type="button" class="btn btn-sm bg-lyer-green text-white border-none rounded-xl" @click="facturaAbierta = true">
              Completar factura
            </button>
          </section>

          <section class="grid md:grid-cols-2 gap-4">
            <CampoFoto
              titulo="Foto de registro"
              :src="fotos.registro"
              :puede-cambiar="esAdmin && !['TERMINADO', 'CANCELADO'].includes(orden.estado)"
              :puede-quitar="esAdmin && !!fotos.registro && !['TERMINADO', 'CANCELADO'].includes(orden.estado)"
              :subiendo="subiendoFoto === 'registro'"
              @seleccionar="cambiarRegistro"
              @quitar="quitarRegistro"
            />
            <CampoFoto
              titulo="Foto de desarrollo"
              ayuda="Se reemplaza durante el trabajo."
              :src="fotos.desarrollo"
            />
          </section>

          <!-- Materiales -->
          <section v-if="orden.materiales?.length" class="space-y-4">
            <div class="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
              <Package class="w-4 h-4" /> Repuestos y Materiales
            </div>
            <div class="rounded-2xl sm:rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <table class="table table-compact w-full">
                <thead class="bg-slate-50 text-slate-400 border-b border-slate-100">
                  <tr class="text-[9px] uppercase tracking-widest">
                    <th class="w-16 sm:w-20 text-center py-3 sm:py-4">Cant.</th>
                    <th class="py-3 sm:py-4">Repuesto</th>
                    <th v-if="verPrecios" class="text-right py-3 sm:py-4 pr-4 sm:pr-8">Total</th>
                  </tr>
                </thead>
                <tbody class="text-xs text-slate-700">
                  <tr v-for="m in orden.materiales" :key="m.id"
                    class="border-b last:border-0 border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td class="text-center font-black py-3 sm:py-4">{{ m.cantidad }}</td>
                    <td class="py-3 sm:py-4 font-medium">{{ m.material.descripcion }}</td>
                    <td v-if="verPrecios" class="text-right py-3 sm:py-4 pr-4 sm:pr-8 font-black text-slate-900">
                      S/ {{ (Number(m.cantidad) * Number(m.precioAplicado)).toFixed(2) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Servicios y terceros -->
          <section v-if="orden.servicios?.length || orden.terceros?.length" class="space-y-4">
            <div class="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
              <Wrench class="w-4 h-4" /> Mano de Obra y Servicios
            </div>
            <div class="rounded-2xl sm:rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <table class="table table-compact w-full">
                <tbody class="text-xs text-slate-700">
                  <tr v-for="s in orden.servicios" :key="s.id"
                    class="border-b last:border-0 border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td class="py-4 pl-4 sm:pl-8 font-medium">{{ s.descripcion }}</td>
                    <td v-if="verPrecios" class="text-right pr-4 sm:pr-8 font-black text-lyer-green">
                      S/ {{ parseFloat(s.monto).toFixed(2) }}
                    </td>
                  </tr>
                  <tr v-for="t in orden.terceros" :key="t.id"
                    class="bg-blue-50/30 border-b last:border-0 border-blue-100 hover:bg-blue-50/50 transition-colors">
                    <td class="py-4 pl-4 sm:pl-8 font-medium italic text-blue-900">
                      <span class="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-bold mr-2">
                        TERCERO
                      </span>
                      {{ t.descripcion }}
                    </td>
                    <td v-if="verPrecios" class="text-right pr-4 sm:pr-8 font-black text-blue-700">
                      S/ {{ parseFloat(t.monto).toFixed(2) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Total — DENTRO del v-else-if="orden", único footer de total -->
          <div v-if="verPrecios" class="bg-slate-900 text-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center relative overflow-hidden group">
            <div class="absolute -right-6 -bottom-6 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
              <FileText class="w-40 sm:w-64 h-40 sm:h-64" />
            </div>
            <div class="z-10 space-y-1">
              <span class="text-[9px] font-black text-lyer-accent uppercase tracking-[0.4em]">Resumen Económico</span>
              <h5 class="text-lg sm:text-xl font-bold tracking-tight">Inversión Final del Servicio</h5>
              <p class="text-xs opacity-40 font-medium">Mecánica LYER MOTORS - Huancayo, Perú</p>
            </div>
            <div class="z-10 bg-white/5 px-6 sm:px-10 py-4 sm:py-6 rounded-2xl border border-white/10 shadow-2xl">
              <span class="text-3xl sm:text-5xl font-black tracking-tighter tabular-nums">
                S/ {{ parseFloat(orden.totalFinal).toFixed(2) }}
              </span>
            </div>
          </div>

        </div><!-- fin v-else-if="orden" -->

      </div><!-- fin scroll -->

      <!-- Footer de botones — único, fuera del scroll, siempre visible -->
      <footer class="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-end gap-2 shrink-0 no-print">
        <button @click="generarPDF"
          class="btn btn-sm sm:btn-md bg-lyer-green text-white border-none hover:bg-emerald-900 px-4 sm:px-8 rounded-2xl transition-all hover:scale-105 active:scale-95">
          <Download class="w-4 h-4 mr-1 sm:mr-2" /> PDF
        </button>
        <button @click="imprimir"
          class="btn btn-sm sm:btn-md btn-outline border-slate-200 text-slate-500 hover:bg-white hover:text-lyer-green px-4 sm:px-8 rounded-2xl transition-all">
          <Printer class="w-4 h-4 mr-1 sm:mr-2" /> Imprimir
        </button>
        <button @click="emit('close')"
          class="btn btn-sm sm:btn-md btn-ghost px-4 text-slate-400">
          Cerrar
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