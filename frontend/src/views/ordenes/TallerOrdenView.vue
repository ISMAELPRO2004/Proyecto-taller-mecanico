<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { ordenService } from '../../services/ordenService.js';
import { catalogoService } from '../../services/catalogoService.js';
import { usuarioService } from '../../services/usuarioService.js';
import { notify } from '../../utils/alerts.js';
import { nombreClienteOrden, marcaVehiculoOrden, modeloVehiculoOrden } from '../../utils/ordenDisplay.js';
import EncabezadoOrdenForm from './componentes/EncabezadoOrdenForm.vue';
import ListaMateriales from './componentes/ListaMateriales.vue';
import ListaServicios from './componentes/ListaServicios.vue';
import ListaTerceros from './componentes/ListaTerceros.vue';
import SelectorCatalogoModal from './componentes/SelectorCatalogoModal.vue';
import FooterResumenOrden from './componentes/FooterResumenOrden.vue';
import CampoFoto from './componentes/CampoFoto.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const verPrecios = computed(() => auth.usuario?.rol !== 'TECNICO');
const esAdmin = computed(() => auth.usuario?.rol === 'ADMIN');
const fotos = ref({ registro: '', desarrollo: '' });
const subiendoFoto = ref('');
const cargando = ref(true);
const guardando = ref(false);
const responsables = ref([]);
const catalogos = ref({ materiales: [], servicios: [], terceros: [] });

const form = ref({
  numeroOrden: '',
  placa: '',
  cliente: '',
  marca: '',
  modelo: '',
  descripcionInformal: '',
  trabajoSolicitado: '',
  estado: 'ACEPTADO',
  responsableId: '',
  materiales: [],
  servicios: [],
  terceros: [],
  requiereFactura: false,
  numeroFactura: '',
  montoFactura: '',
});

const selector = ref({ abierto: false, tipo: 'materiales', titulo: '' });
const modalFactura = ref(false);
const estadoAntes = ref('ACEPTADO');
const facturaBorrador = ref({ decision: '', numero: '', monto: '' });

const titulosCatalogo = {
  materiales: 'Repuestos e insumos',
  servicios: 'Mano de obra',
  terceros: 'Trabajos externos',
};

const idsSeleccionados = computed(() => {
  if (selector.value.tipo === 'materiales') return form.value.materiales.map((m) => m.materialId);
  if (selector.value.tipo === 'servicios') return form.value.servicios.map((s) => s.servicioId);
  return form.value.terceros.map((t) => t.terceroId);
});

const itemsSelector = computed(() => catalogos.value[selector.value.tipo] || []);

const totalFinal = computed(() => {
  const mats = form.value.materiales.reduce(
    (acc, m) => acc + Number(m.cantidad || 0) * Number(m.precioAlMomento || 0),
    0
  );
  const servs = form.value.servicios.reduce((acc, s) => acc + Number(s.monto || 0), 0);
  const tercs = form.value.terceros.reduce((acc, t) => acc + Number(t.monto || 0), 0);
  return mats + servs + tercs;
});

const facturaPendiente = computed(
  () => form.value.estado === 'CANCELADO' && form.value.requiereFactura && !String(form.value.numeroFactura || '').trim()
);

const cargarFoto = async (tipo, ruta) => {
  if (fotos.value[tipo]) URL.revokeObjectURL(fotos.value[tipo]);
  fotos.value[tipo] = '';
  if (!ruta) return;
  try {
    const blob = await ordenService.descargarFoto(route.params.id, tipo);
    fotos.value[tipo] = URL.createObjectURL(blob);
  } catch {
    fotos.value[tipo] = '';
  }
};

const subirDesarrollo = async (file) => {
  subiendoFoto.value = 'desarrollo';
  try {
    const orden = await ordenService.subirFoto(route.params.id, 'desarrollo', file);
    await cargarFoto('desarrollo', orden.fotoDesarrollo);
    notify.success('Foto de desarrollo actualizada');
  } catch (e) {
    notify.error('No se pudo subir la foto', e.response?.data?.message);
  } finally {
    subiendoFoto.value = '';
  }
};

const quitarDesarrollo = async () => {
  subiendoFoto.value = 'desarrollo';
  try {
    await ordenService.quitarFoto(route.params.id, 'desarrollo');
    if (fotos.value.desarrollo) URL.revokeObjectURL(fotos.value.desarrollo);
    fotos.value.desarrollo = '';
  } catch (e) {
    notify.error('No se pudo quitar', e.response?.data?.message);
  } finally {
    subiendoFoto.value = '';
  }
};

const subirRegistroAdmin = async (file) => {
  subiendoFoto.value = 'registro';
  try {
    const orden = await ordenService.subirFoto(route.params.id, 'registro', file);
    await cargarFoto('registro', orden.fotoRegistro);
    notify.success('Foto de registro actualizada');
  } catch (e) {
    notify.error('No se pudo cambiar la foto', e.response?.data?.message);
  } finally {
    subiendoFoto.value = '';
  }
};

const quitarRegistroAdmin = async () => {
  subiendoFoto.value = 'registro';
  try {
    await ordenService.quitarFoto(route.params.id, 'registro');
    if (fotos.value.registro) URL.revokeObjectURL(fotos.value.registro);
    fotos.value.registro = '';
  } catch (e) {
    notify.error('No se pudo quitar', e.response?.data?.message);
  } finally {
    subiendoFoto.value = '';
  }
};

const abrirSelector = (tipo) => {
  selector.value = { abierto: true, tipo, titulo: titulosCatalogo[tipo] };
};

const confirmarCatalogo = (seleccionados) => {
  const tipo = selector.value.tipo;
  if (tipo === 'materiales') {
    const actuales = new Map(form.value.materiales.map((m) => [m.materialId, m]));
    form.value.materiales = seleccionados.map((item) => actuales.get(item.id) || {
      materialId: item.id,
      descripcion: item.descripcion,
      cantidad: 1,
      precioAlMomento: item.precioBase ?? null,
    });
  } else if (tipo === 'servicios') {
    const actuales = new Map(form.value.servicios.map((s) => [s.servicioId, s]));
    form.value.servicios = seleccionados.map((item) => actuales.get(item.id) || {
      servicioId: item.id,
      descripcion: item.descripcion,
      monto: item.precioBase ?? null,
    });
  } else {
    const actuales = new Map(form.value.terceros.map((t) => [t.terceroId, t]));
    form.value.terceros = seleccionados.map((item) => actuales.get(item.id) || {
      terceroId: item.id,
      descripcion: item.descripcion,
      monto: item.precioBase ?? null,
      responsable: item.responsable || '',
    });
  }
  selector.value.abierto = false;
};

const cambiarEstado = (nuevo) => {
  if (nuevo === 'CANCELADO' && form.value.estado !== 'CANCELADO') {
    estadoAntes.value = form.value.estado;
    facturaBorrador.value = {
      decision: form.value.requiereFactura ? 'si' : '',
      numero: form.value.numeroFactura || '',
      monto: form.value.montoFactura ?? '',
    };
    form.value.estado = 'CANCELADO';
    modalFactura.value = true;
    return;
  }
  form.value.estado = nuevo;
};

const confirmarFactura = () => {
  if (!facturaBorrador.value.decision) {
    notify.error('Factura', 'Indique si habrá factura.');
    return;
  }
  const pideFactura = facturaBorrador.value.decision === 'si';
  form.value.requiereFactura = pideFactura;
  form.value.numeroFactura = pideFactura ? String(facturaBorrador.value.numero || '').trim() : '';
  form.value.montoFactura = pideFactura ? facturaBorrador.value.monto : '';
  form.value.estado = 'CANCELADO';
  modalFactura.value = false;
};

const cancelarFactura = () => {
  form.value.estado = estadoAntes.value;
  modalFactura.value = false;
};

const payload = () => {
  const body = {
    descripcionInformal: form.value.descripcionInformal || null,
    trabajoSolicitado: form.value.trabajoSolicitado || null,
    responsableId: form.value.responsableId || null,
    estado: form.value.estado,
    materiales: form.value.materiales.map((m) => ({
      materialId: Number(m.materialId),
      cantidad: Number(m.cantidad) || 1,
      precioAlMomento: verPrecios.value ? m.precioAlMomento : null,
    })),
    servicios: form.value.servicios.map((s) => ({
      servicioId: Number(s.servicioId),
      descripcion: s.descripcion,
      monto: verPrecios.value ? s.monto : null,
    })),
    terceros: form.value.terceros.map((t) => ({
      terceroId: Number(t.terceroId),
      descripcion: t.descripcion,
      monto: verPrecios.value ? t.monto : null,
    })),
  };

  if (form.value.estado === 'CANCELADO') {
    body.requiereFactura = form.value.requiereFactura;
    body.numeroFactura = form.value.numeroFactura || null;
    body.montoFactura = form.value.montoFactura === '' ? null : form.value.montoFactura;
  }

  return body;
};

const guardar = async () => {
  if (modalFactura.value) return;
  if (form.value.estado === 'CANCELADO' && form.value.requiereFactura === undefined) {
    modalFactura.value = true;
    return;
  }
  guardando.value = true;
  try {
    await ordenService.actualizar(route.params.id, payload());
    notify.success('Orden actualizada');
    router.push('/ordenes');
  } catch (error) {
    notify.error('No se pudo guardar', error.response?.data?.message);
  } finally {
    guardando.value = false;
  }
};

const mapOrden = (orden) => {
  form.value = {
    numeroOrden: orden.numeroOrden || '',
    placa: orden.placa || orden.vehiculo?.placa || '',
    cliente: nombreClienteOrden(orden),
    marca: marcaVehiculoOrden(orden),
    modelo: modeloVehiculoOrden(orden),
    descripcionInformal: orden.descripcionInformal || '',
    trabajoSolicitado: orden.trabajoSolicitado || '',
    estado: orden.estado,
    responsableId: orden.responsableId || '',
    requiereFactura: orden.requiereFactura || false,
    numeroFactura: orden.numeroFactura || '',
    montoFactura: orden.montoFactura ?? '',
    materiales: (orden.materiales || []).map((m) => ({
      materialId: m.materialId,
      descripcion: m.material?.descripcion || '',
      cantidad: m.cantidad,
      precioAlMomento: m.precioAplicado,
    })),
    servicios: (orden.servicios || []).map((s) => ({
      servicioId: s.servicioId,
      descripcion: s.descripcion || s.servicio?.descripcion || '',
      monto: s.monto,
    })),
    terceros: (orden.terceros || []).map((t) => ({
      terceroId: t.terceroId,
      descripcion: t.descripcion || t.tercero?.descripcion || '',
      monto: t.monto,
      responsable: t.tercero?.responsable || '',
    })),
  };
};

const inicializar = async () => {
  cargando.value = true;
  try {
    const [orden, usuarios, materiales, servicios, terceros] = await Promise.all([
      ordenService.obtener(route.params.id),
      usuarioService.listar().catch(() => []),
      catalogoService.listarMateriales().catch(() => []),
      catalogoService.listarServicios().catch(() => []),
      catalogoService.listarTerceros().catch(() => []),
    ]);

    if (orden.estado === 'EN_ESPERA') {
      router.replace(`/ordenes/editar/${orden.id}`);
      return;
    }
    if (orden.estaCerrada || ['TERMINADO', 'CANCELADO'].includes(orden.estado)) {
      notify.info('Orden no editable', 'Esta orden ya no se puede completar.');
      router.replace('/ordenes');
      return;
    }

    mapOrden(orden);
    await Promise.all([
      cargarFoto('registro', orden.fotoRegistro),
      cargarFoto('desarrollo', orden.fotoDesarrollo),
    ]);
    responsables.value = (usuarios || []).filter((u) => u.activo && ['TECNICO', 'SUPERVISOR'].includes(u.rol));
    catalogos.value = { materiales, servicios, terceros };
  } catch {
    notify.error('Error', 'No se pudo cargar la orden.');
    router.replace('/ordenes');
  } finally {
    cargando.value = false;
  }
};

onMounted(inicializar);
onUnmounted(() => {
  if (fotos.value.registro) URL.revokeObjectURL(fotos.value.registro);
  if (fotos.value.desarrollo) URL.revokeObjectURL(fotos.value.desarrollo);
});
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-5 pb-10">
    <div v-if="cargando" class="py-24 text-center">
      <span class="loading loading-ring loading-lg text-lyer-green" />
    </div>

    <template v-else>
      <EncabezadoOrdenForm
        es-edicion
        modo="taller"
        :estado="form.estado"
        @back="router.push('/ordenes')"
        @update:estado="cambiarEstado"
      />

      <section class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-6">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="text-[10px] font-black text-lyer-green uppercase tracking-widest">{{ form.numeroOrden }}</p>
            <h3 class="text-lg font-black text-slate-800 uppercase italic">{{ form.placa }}</h3>
            <p class="text-xs text-slate-500 font-bold">
              {{ form.marca }} {{ form.modelo }} · {{ form.cliente }}
            </p>
          </div>
          <span
            v-if="facturaPendiente"
            class="badge badge-warning badge-sm font-black uppercase animate-pulse"
          >
            Factura pendiente
          </span>
        </div>
      </section>

      <section class="grid md:grid-cols-2 gap-4">
        <CampoFoto
          titulo="Foto de registro"
          ayuda="Tomada al ingreso. Solo el administrador puede cambiarla."
          :src="fotos.registro"
          :puede-cambiar="esAdmin"
          :puede-quitar="esAdmin && !!fotos.registro"
          :subiendo="subiendoFoto === 'registro'"
          @seleccionar="subirRegistroAdmin"
          @quitar="quitarRegistroAdmin"
        />
        <CampoFoto
          titulo="Foto de desarrollo"
          ayuda="Se puede ir reemplazando mientras la orden está en trabajo."
          :src="fotos.desarrollo"
          puede-cambiar
          :puede-quitar="!!fotos.desarrollo"
          :subiendo="subiendoFoto === 'desarrollo'"
          @seleccionar="subirDesarrollo"
          @quitar="quitarDesarrollo"
        />
      </section>

      <section class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-6 grid md:grid-cols-2 gap-4">
        <label class="form-control">
          <span class="label-text text-[10px] font-black text-slate-400 uppercase">Descripción informal</span>
          <textarea v-model="form.descripcionInformal" rows="3" class="textarea textarea-bordered rounded-2xl text-sm" />
        </label>
        <label class="form-control">
          <span class="label-text text-[10px] font-black text-slate-400 uppercase">Trabajo solicitado</span>
          <textarea v-model="form.trabajoSolicitado" rows="3" class="textarea textarea-bordered rounded-2xl text-sm" />
        </label>
      </section>

      <section class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-6 space-y-8">
        <ListaMateriales
          :materiales="form.materiales"
          :ver-precios="verPrecios"
          @add="abrirSelector('materiales')"
          @remove="form.materiales.splice($event, 1)"
        />
        <ListaServicios
          :servicios="form.servicios"
          :ver-precios="verPrecios"
          @add="abrirSelector('servicios')"
          @remove="form.servicios.splice($event, 1)"
        />
        <ListaTerceros
          :terceros="form.terceros"
          :ver-precios="verPrecios"
          @add="abrirSelector('terceros')"
          @remove="form.terceros.splice($event, 1)"
        />
      </section>

      <FooterResumenOrden
        :responsable-id="form.responsableId"
        :responsables="responsables"
        :total-final="totalFinal"
        :ver-precios="verPrecios"
        es-edicion
        @update:responsable-id="form.responsableId = $event"
        @guardar="guardar"
      />
    </template>

    <SelectorCatalogoModal
      :is-open="selector.abierto"
      :titulo="selector.titulo"
      :tipo="selector.tipo"
      :items="itemsSelector"
      :ya-seleccionados-ids="idsSeleccionados"
      :ver-precios="verPrecios"
      @close="selector.abierto = false"
      @confirmar="confirmarCatalogo"
    />

    <div v-if="modalFactura" class="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-[2rem] p-6 space-y-4 shadow-2xl">
        <div>
          <h3 class="font-black text-slate-800 uppercase italic">Cancelar orden</h3>
          <p class="text-xs text-slate-500">¿Habrá factura de esta orden?</p>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="btn flex-1 rounded-xl"
            :class="facturaBorrador.decision === 'si' ? 'bg-lyer-green text-white border-none' : 'btn-outline'"
            @click="facturaBorrador.decision = 'si'"
          >Sí</button>
          <button
            type="button"
            class="btn flex-1 rounded-xl"
            :class="facturaBorrador.decision === 'no' ? 'bg-slate-800 text-white border-none' : 'btn-outline'"
            @click="facturaBorrador.decision = 'no'"
          >No</button>
        </div>
        <div v-if="facturaBorrador.decision === 'si'" class="space-y-3">
          <label class="form-control">
            <span class="label-text text-[10px] font-black text-slate-400 uppercase">Número de factura</span>
            <input v-model="facturaBorrador.numero" type="text" class="input input-bordered rounded-xl" placeholder="Opcional, se puede completar después" />
          </label>
          <label class="form-control">
            <span class="label-text text-[10px] font-black text-slate-400 uppercase">Monto</span>
            <input v-model="facturaBorrador.monto" type="number" step="0.01" min="0" class="input input-bordered rounded-xl" />
          </label>
          <p class="text-[10px] text-amber-600 font-bold">Si no hay número, la factura queda pendiente.</p>
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" class="btn btn-ghost flex-1 rounded-xl" @click="cancelarFactura">Volver</button>
          <button type="button" class="btn flex-1 bg-lyer-green text-white border-none rounded-xl" @click="confirmarFactura">Confirmar</button>
        </div>
      </div>
    </div>

    <div v-if="guardando" class="fixed inset-0 z-40 bg-white/40 flex items-center justify-center">
      <span class="loading loading-spinner loading-lg text-lyer-green" />
    </div>
  </div>
</template>
