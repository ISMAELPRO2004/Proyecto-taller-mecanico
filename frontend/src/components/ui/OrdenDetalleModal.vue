<script setup>
import { ref, watch } from 'vue';
import api from '../../api/axios.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  X, Printer, User, Car, Wrench, Package, 
  ExternalLink, FileText, Download 
} from 'lucide-vue-next';

const props = defineProps({
  ordenId: { type: Number, default: null },
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);
const orden = ref(null);
const loading = ref(false);

const cargarDetalle = async () => {
  if (!props.ordenId) return;
  loading.value = true;
  try {
    const { data } = await api.get(`/ordenes/${props.ordenId}`);
    orden.value = data;
  } catch (error) {
    console.error("Error al cargar detalle:", error);
  } finally {
    loading.value = false;
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) cargarDetalle();
});

const generarPDF = () => {
  if (!orden.value) return;
  try {
    const doc = new jsPDF();
    const verdeLyer = [6, 78, 59];
    const verdeAccent = [16, 185, 129];
    
    doc.setFillColor(...verdeLyer);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text("LYER MOTORS", 15, 20);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`ORDEN DE TRABAJO: ${orden.value.numeroOrden}`, 15, 30);
    doc.text(`Fecha: ${new Date(orden.value.fechaCreacion).toLocaleDateString()}`, 155, 25);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("INFORMACIÓN DEL CLIENTE", 15, 50);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre: ${orden.value.clienteNombre}`, 15, 57);
    doc.text(`Celular: ${orden.value.clienteCelular || 'N/A'}`, 15, 63);

    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text("ESPECIFICACIONES DEL VEHÍCULO", 15, 75);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Placa: ${orden.value.placa}`, 15, 82);
    doc.text(`Unidad: ${orden.value.marca} ${orden.value.modelo}`, 15, 88);
    doc.text(`Recorrido: ${orden.value.kilometraje} KM / ${orden.value.horometro} H`, 15, 94);

    let currentY = 105;
    if (orden.value.materiales?.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [['Cant.', 'Descripción de Repuestos', 'Unitario', 'Total']],
        body: orden.value.materiales.map(m => [
          m.cantidad, 
          m.material.descripcion, 
          `S/ ${Number(m.precioAplicado).toFixed(2)}`,
          `S/ ${(Number(m.cantidad) * Number(m.precioAplicado)).toFixed(2)}`
        ]),
        headStyles: { fillColor: verdeLyer, fontSize: 10 },
        theme: 'striped'
      });
      currentY = doc.lastAutoTable.finalY + 10;
    }

    const servicios = [
      ...orden.value.servicios.map(s => [s.descripcion, `S/ ${Number(s.monto).toFixed(2)}`]),
      ...orden.value.terceros.map(t => [`(Tercero) ${t.descripcion}`, `S/ ${Number(t.monto).toFixed(2)}`])
    ];

    if (servicios.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [['Descripción de Servicios', 'Monto']],
        body: servicios,
        headStyles: { fillColor: verdeAccent, fontSize: 10 },
        theme: 'grid'
      });
      currentY = doc.lastAutoTable.finalY + 15;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`INVERSIÓN TOTAL: S/ ${Number(orden.value.totalFinal).toFixed(2)}`, 130, currentY);
    doc.save(`OT_${orden.value.numeroOrden}.pdf`);
  } catch (e) {
    console.error("PDF Error:", e);
  }
};

const imprimir = () => { window.print(); };
</script>

<template>
  <div :class="['modal', { 'modal-open': isOpen }]">
    <div class="modal-box w-11/12 max-w-4xl p-0 flex flex-col max-h-[92vh] border border-slate-200 overflow-hidden shadow-2xl rounded-3xl">
      
      <header class="bg-white p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
        <div class="flex items-center gap-4">
          <div class="bg-lyer-green/10 p-3 rounded-2xl text-lyer-green">
            <FileText class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-xl font-black text-slate-800 tracking-tight uppercase">
              Orden <span class="text-lyer-green">{{ orden?.numeroOrden || '...' }}</span>
            </h3>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Mecánica LYER Motors</p>
          </div>
        </div>
        <button @click="emit('close')" class="btn btn-circle btn-ghost btn-sm text-slate-400 hover:text-red-500 transition-colors">
          <X class="w-6 h-6" />
        </button>
      </header>

      <div class="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 bg-white">
        <div v-if="loading" class="py-20 text-center flex flex-col items-center gap-4">
          <span class="loading loading-ring loading-lg text-lyer-green"></span>
          <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronizando...</p>
        </div>

        <div v-else-if="orden" class="animate-fade-in space-y-12">
          
          <section class="space-y-6">
            <div class="flex items-center gap-3 text-lyer-green font-black uppercase text-[10px] tracking-[0.2em] opacity-70">
              <User class="w-4 h-4" /> Información del Cliente
            </div>
            <div class="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 space-y-2">
              <h4 class="text-3xl font-black text-slate-800 leading-none">{{ orden.clienteNombre }}</h4>
              <div class="flex items-center gap-3">
                <span class="text-[10px] bg-lyer-accent text-white px-2 py-0.5 rounded-full font-bold">CONTACTO</span>
                <p class="text-sm font-bold text-slate-500">{{ orden.clienteCelular || 'N/A' }}</p>
              </div>
              <div class="mt-6 p-5 bg-white rounded-2xl border border-slate-100 text-slate-600 text-sm italic leading-relaxed shadow-sm">
                "{{ orden.trabajoSolicitado }}"
              </div>
            </div>
          </section>

          <section class="space-y-6">
            <div class="flex items-center gap-3 text-lyer-accent font-black uppercase text-[10px] tracking-[0.2em] opacity-70">
              <Car class="w-4 h-4" /> Datos de la Unidad
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50 text-center">
                <span class="block text-[9px] uppercase font-bold text-emerald-600/60 mb-1">Placa</span>
                <span class="text-xl font-black text-emerald-950 block">{{ orden.placa }}</span>
              </div>
              <div class="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50 text-center">
                <span class="block text-[9px] uppercase font-bold text-emerald-600/60 mb-1">Marca / Modelo</span>
                <span class="text-sm font-black text-emerald-900 block truncate uppercase">{{ orden.marca }} {{ orden.modelo }}</span>
              </div>
              <div class="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                <span class="block text-[9px] uppercase font-bold text-slate-400 mb-1">Kilometraje</span>
                <span class="text-sm font-black text-slate-700 block">{{ orden.kilometraje }} <small class="text-[8px] opacity-50">KM</small></span>
              </div>
              <div class="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                <span class="block text-[9px] uppercase font-bold text-slate-400 mb-1">Horómetro</span>
                <span class="text-sm font-black text-slate-700 block">{{ orden.horometro }} <small class="text-[8px] opacity-50">H</small></span>
              </div>
            </div>
          </section>

          <section v-if="orden.materiales?.length" class="space-y-6">
            <div class="flex items-center gap-3 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
              <Package class="w-4 h-4" /> Repuestos y Materiales
            </div>
            <div class="rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <table class="table table-compact w-full">
                <thead class="bg-slate-50 text-slate-400 border-b border-slate-100">
                  <tr class="text-[9px] uppercase tracking-widest">
                    <th class="w-20 text-center py-4">Cant.</th>
                    <th class="py-4">Descripción del Repuesto</th>
                    <th class="text-right py-4 pr-8">Total</th>
                  </tr>
                </thead>
                <tbody class="text-xs text-slate-700">
                  <tr v-for="m in orden.materiales" :key="m.id" class="border-b last:border-0 border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td class="text-center font-black py-4">{{ m.cantidad }}</td>
                    <td class="py-4 font-medium">{{ m.material.descripcion }}</td>
                    <td class="text-right py-4 pr-8 font-black text-slate-900">S/ {{ (m.cantidad * m.precioAplicado).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-if="orden.servicios?.length || orden.terceros?.length" class="space-y-6">
            <div class="flex items-center gap-3 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
              <Wrench class="w-4 h-4" /> Mano de Obra y Servicios
            </div>
            <div class="rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <table class="table table-compact w-full">
                <tbody class="text-xs text-slate-700">
                  <tr v-for="s in orden.servicios" :key="s.id" class="border-b last:border-0 border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td class="py-5 pl-8 font-medium">{{ s.descripcion }}</td>
                    <td class="text-right pr-8 font-black text-lyer-green">S/ {{ parseFloat(s.monto).toFixed(2) }}</td>
                  </tr>
                  <tr v-for="t in orden.terceros" :key="t.id" class="bg-blue-50/30 border-b last:border-0 border-blue-100 hover:bg-blue-50/50 transition-colors">
                    <td class="py-5 pl-8 font-medium italic text-blue-900">
                      <span class="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-bold mr-2">TERCERO</span>
                      {{ t.descripcion }}
                    </td>
                    <td class="text-right pr-8 font-black text-blue-700">S/ {{ parseFloat(t.monto).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <footer class="mt-16 bg-slate-900 text-white p-10 rounded-[3rem] flex flex-col md:flex-row justify-between items-center relative overflow-hidden group">
            <div class="absolute -right-10 -bottom-10 opacity-5 rotate-12 transition-transform group-hover:scale-110">
              <FileText class="w-64 h-64" />
            </div>
            <div class="z-10 text-center md:text-left space-y-1">
              <span class="text-[9px] font-black text-lyer-accent uppercase tracking-[0.4em]">Resumen Económico</span>
              <h5 class="text-xl font-bold tracking-tight">Inversión Final del Servicio</h5>
              <p class="text-xs opacity-40 font-medium">Mecánica LYER MOTORS - Huancayo, Perú</p>
            </div>
            <div class="z-10 mt-8 md:mt-0 bg-white/5 backdrop-blur-md px-10 py-6 rounded-2rem border border-white/10 shadow-2xl">
              <span class="text-5xl font-black tracking-tighter tabular-nums">S/ {{ parseFloat(orden.totalFinal).toFixed(2) }}</span>
            </div>
          </footer>
        </div>
      </div>

      <footer class="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-end gap-3 shrink-0 no-print">
        <button @click="generarPDF" class="btn bg-lyer-green text-white border-none hover:bg-emerald-900 shadow-lg px-8 rounded-2xl transition-all hover:scale-105 active:scale-95">
          <Download class="w-5 h-5 mr-2" /> Generar PDF
        </button>
        <button @click="imprimir" class="btn btn-outline border-slate-200 text-slate-500 hover:bg-white hover:text-lyer-green px-8 rounded-2xl transition-all">
          <Printer class="w-5 h-5 mr-2" /> Imprimir
        </button>
        <button @click="emit('close')" class="btn btn-ghost px-6 text-slate-400">Cerrar</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: modalFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media print {
  .no-print { display: none !important; }
  .modal-box { 
    max-height: none !important;
    height: auto !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    border: none !important;
    box-shadow: none !important;
  }
}
</style>