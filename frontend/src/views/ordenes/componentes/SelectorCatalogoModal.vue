<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { Search, X, Check, Plus, ArrowLeft } from 'lucide-vue-next';
import { catalogoService, endpoints } from '../../../services/catalogoService.js';
import { notify } from '../../../utils/alerts.js';

const props = defineProps({
  isOpen: Boolean,
  titulo: String,
  tipo: { type: String, default: 'materiales' },
  items: { type: Array, default: () => [] },
  yaSeleccionadosIds: { type: Array, default: () => [] },
  verPrecios: { type: Boolean, default: true },
});

const emit = defineEmits(['close', 'confirmar', 'creado']);

const filtro = ref('');
const seleccionTemporales = ref([]);
const inputRef = ref(null);
const itemsLocal = ref([]);
const mostrarSugerencias = ref(false);

const vista = ref('seleccionar'); // seleccionar | crear
const guardando = ref(false);
const formNuevo = ref({ descripcion: '', precioBase: '', responsable: '' });
const descInputRef = ref(null);
const precioRef = ref(null);
const responsableRef = ref(null);
const esTercero = computed(() => props.tipo === 'terceros');

const nombreTipo = computed(() => {
  const map = { materiales: 'repuesto', servicios: 'servicio', terceros: 'trabajo externo' };
  return map[props.tipo] || 'ítem';
});

watch(() => props.items, (lista) => {
  itemsLocal.value = [...(lista || [])];
}, { immediate: true });

watch(() => props.isOpen, async (abierto) => {
  if (abierto) {
    itemsLocal.value = [...(props.items || [])];
    seleccionTemporales.value = itemsLocal.value.filter(i =>
      props.yaSeleccionadosIds.includes(i.id)
    );
    filtro.value = '';
    mostrarSugerencias.value = false;
    vista.value = 'seleccionar';
    formNuevo.value = { descripcion: '', precioBase: '', responsable: '' };
    await nextTick();
    inputRef.value?.focus();
  }
});

const estaSeleccionado = (id) => seleccionTemporales.value.some(i => i.id === id);

const q = computed(() => filtro.value.trim().toLowerCase());

/** Lista completa (filtrada si hay texto) */
const lista = computed(() => {
  const all = itemsLocal.value || [];
  if (!q.value) return all;
  return all.filter(i => i.descripcion.toLowerCase().includes(q.value));
});

/** Autocomplete corto en la barra (máx. 5) */
const sugerencias = computed(() => {
  if (!q.value) return [];
  return lista.value.slice(0, 5);
});

const toggleSeleccion = (item) => {
  const idx = seleccionTemporales.value.findIndex(i => i.id === item.id);
  if (idx > -1) seleccionTemporales.value.splice(idx, 1);
  else seleccionTemporales.value.push(item);
};

const elegirSugerencia = (item) => {
  if (!estaSeleccionado(item.id)) seleccionTemporales.value.push(item);
  filtro.value = '';
  mostrarSugerencias.value = false;
  nextTick(() => inputRef.value?.focus());
};

const ocultarSugerencias = () => {
  setTimeout(() => { mostrarSugerencias.value = false; }, 150);
};

const quitarSeleccionado = (id) => {
  seleccionTemporales.value = seleccionTemporales.value.filter(i => i.id !== id);
};

const confirmar = () => {
  emit('confirmar', [...seleccionTemporales.value]);
  filtro.value = '';
};

const cerrar = () => {
  filtro.value = '';
  vista.value = 'seleccionar';
  emit('close');
};

const abrirCrear = async (prefijo = '') => {
  vista.value = 'crear';
  mostrarSugerencias.value = false;
  formNuevo.value = { descripcion: prefijo || filtro.value.trim(), precioBase: '', responsable: '' };
  await nextTick();
  descInputRef.value?.focus();
};

const volverSeleccion = async () => {
  vista.value = 'seleccionar';
  await nextTick();
  inputRef.value?.focus();
};

const guardarNuevo = async () => {
  const descripcion = formNuevo.value.descripcion?.trim();
  const responsable = formNuevo.value.responsable?.trim();
  const precio = parseFloat(formNuevo.value.precioBase);

  if (!descripcion) return notify.error('Ingresa una descripción');
  if (esTercero.value && !responsable) return notify.error('Ingresa el responsable del tercero');
  if (props.verPrecios && (!precio || precio <= 0)) return notify.error('Ingresa un precio válido');

  guardando.value = true;
  try {
    const creado = await catalogoService.crear(endpoints[props.tipo], {
      descripcion,
      ...(props.verPrecios ? { precioBase: precio } : {}),
      ...(esTercero.value ? { responsable } : {}),
    });

    itemsLocal.value = [creado, ...itemsLocal.value.filter(i => i.id !== creado.id)];
    if (!estaSeleccionado(creado.id)) seleccionTemporales.value.push(creado);

    emit('creado', { tipo: props.tipo, item: creado });
    notify.success('Registrado', `Nuevo ${nombreTipo.value} en catálogo`);

    filtro.value = '';
    formNuevo.value = { descripcion: '', precioBase: '', responsable: '' };
    vista.value = 'seleccionar';
    await nextTick();
    inputRef.value?.focus();
  } catch {
    notify.error('No se pudo crear el ítem');
  } finally {
    guardando.value = false;
  }
};
</script>

<template>
  <div :class="['modal modal-bottom sm:modal-middle', { 'modal-open': isOpen }]">
    <div class="modal-box max-w-xl p-0 overflow-hidden border-t-8 border-lyer-green rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh]">

      <!-- Header -->
      <div class="p-4 sm:p-5 bg-slate-50 border-b flex justify-between items-center shrink-0 gap-2">
        <div class="min-w-0 flex items-center gap-2">
          <button
            v-if="vista === 'crear'"
            type="button"
            @click="volverSeleccion"
            class="btn btn-sm btn-circle btn-ghost text-slate-500 shrink-0"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <div class="min-w-0">
            <h3 class="font-black text-slate-800 uppercase italic tracking-tighter text-sm truncate">
              {{ vista === 'crear' ? `Nuevo ${nombreTipo}` : titulo }}
            </h3>
            <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              {{ vista === 'crear' ? (verPrecios ? 'Alta rápida' : 'Solo el nombre') : 'Busca o selecciona' }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button
            v-if="vista === 'seleccionar'"
            type="button"
            @click="abrirCrear()"
            class="btn btn-sm h-9 min-h-9 bg-lyer-green text-white border-none rounded-xl gap-1 px-3"
          >
            <Plus class="w-4 h-4" stroke-width="3" />
            <span class="text-[10px] font-black uppercase">Añadir</span>
          </button>
          <button type="button" @click="cerrar" class="btn btn-sm btn-circle btn-ghost text-slate-400">
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- SELECCIONAR -->
      <template v-if="vista === 'seleccionar'">
        <!-- Buscador + autocomplete -->
        <div class="p-3 sm:p-4 bg-white border-b shrink-0 relative z-20">
          <div class="relative">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref="inputRef"
              v-model="filtro"
              type="search"
              autocomplete="off"
              placeholder="Buscar..."
              class="input input-bordered w-full h-11 pl-10 pr-9 rounded-xl bg-slate-50 border-slate-200 focus:border-lyer-accent text-sm font-medium"
              @focus="mostrarSugerencias = true"
              @input="mostrarSugerencias = true"
              @blur="ocultarSugerencias"
            />
            <button
              v-if="filtro"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle text-slate-400"
              @mousedown.prevent="filtro = ''; inputRef?.focus()"
            >
              <X class="w-3.5 h-3.5" />
            </button>

            <!-- Autocomplete pegado a la barra -->
            <div
              v-if="mostrarSugerencias && sugerencias.length"
              class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-30"
            >
              <button
                v-for="item in sugerencias"
                :key="'sug-' + item.id"
                type="button"
                class="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-emerald-50 active:bg-emerald-50 border-b border-slate-50 last:border-0"
                @mousedown.prevent="elegirSugerencia(item)"
              >
                <Search class="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span class="text-xs font-bold text-slate-700 uppercase truncate flex-1">{{ item.descripcion }}</span>
                <span v-if="verPrecios && item.precioBase != null" class="text-[10px] font-black text-lyer-green shrink-0">S/ {{ parseFloat(item.precioBase).toFixed(2) }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Lista completa -->
        <div class="flex-1 overflow-y-auto min-h-0 p-3 space-y-2 bg-white">
          <button
            v-for="item in lista"
            :key="item.id"
            type="button"
            @click="toggleSeleccion(item)"
            :class="[
              'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors',
              estaSeleccionado(item.id)
                ? 'bg-emerald-50 border-lyer-accent'
                : 'bg-white border-slate-100 hover:border-slate-200'
            ]"
          >
            <div
              :class="[
                'w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center',
                estaSeleccionado(item.id) ? 'bg-lyer-green border-lyer-green text-white' : 'border-slate-300'
              ]"
            >
              <Check v-if="estaSeleccionado(item.id)" class="w-3 h-3" stroke-width="3" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-bold text-slate-700 text-xs uppercase truncate">{{ item.descripcion }}</p>
              <p v-if="item.responsable" class="text-[10px] font-bold text-slate-400 truncate">{{ item.responsable }}</p>
              <p v-if="verPrecios && item.precioBase != null" class="text-[10px] font-black text-lyer-green">S/ {{ parseFloat(item.precioBase).toFixed(2) }}</p>
            </div>
          </button>

          <div v-if="lista.length === 0" class="py-10 text-center space-y-3">
            <p class="text-slate-300 text-[10px] font-bold uppercase tracking-widest">
              {{ q ? `Sin resultados para “${filtro}”` : 'Catálogo vacío' }}
            </p>
            <button
              v-if="q"
              type="button"
              @click="abrirCrear(filtro.trim())"
              class="btn btn-sm bg-lyer-green text-white border-none rounded-xl gap-1"
            >
              <Plus class="w-4 h-4" /> Crear “{{ filtro.trim() }}”
            </button>
          </div>
        </div>

        <div
          v-if="seleccionTemporales.length"
          class="shrink-0 border-t bg-emerald-50/40 px-3 py-2.5"
        >
          <div class="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            <button
              v-for="item in seleccionTemporales"
              :key="'sel-' + item.id"
              type="button"
              @click="quitarSeleccionado(item.id)"
              class="inline-flex items-center gap-1 max-w-full bg-white border border-emerald-100 text-slate-700 text-[10px] font-bold uppercase px-2 py-1 rounded-lg"
            >
              <span class="truncate">{{ item.descripcion }}</span>
              <X class="w-3 h-3 opacity-40" />
            </button>
          </div>
        </div>

        <div class="p-3 sm:p-4 bg-slate-50 border-t flex items-center justify-between gap-3 shrink-0">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {{ seleccionTemporales.length }} sel.
          </span>
          <div class="flex gap-2">
            <button type="button" @click="cerrar" class="btn btn-ghost btn-sm font-bold text-slate-400 uppercase text-[10px]">
              Cancelar
            </button>
            <button type="button" @click="confirmar" class="btn btn-sm bg-lyer-green text-white border-none px-6 rounded-xl uppercase text-[10px] font-black">
              Confirmar
            </button>
          </div>
        </div>
      </template>

      <!-- CREAR -->
      <template v-else>
        <div class="p-5 space-y-4 bg-white flex-1 overflow-y-auto">
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text font-black text-slate-400 uppercase text-[10px]">Descripción</span>
            </label>
            <input
              ref="descInputRef"
              v-model="formNuevo.descripcion"
              type="text"
              :placeholder="esTercero ? 'Ej: Rectificado de motor' : 'Ej: Aceite 15W40'"
              class="input input-bordered w-full bg-slate-50 border-slate-200 rounded-xl font-bold text-sm"
              @keydown.enter.prevent="esTercero ? responsableRef?.focus() : (verPrecios ? precioRef?.focus() : guardarNuevo())"
            />
          </div>
          <div v-if="esTercero" class="form-control">
            <label class="label py-1">
              <span class="label-text font-black text-slate-400 uppercase text-[10px]">Responsable del tercero</span>
            </label>
            <input
              ref="responsableRef"
              v-model="formNuevo.responsable"
              type="text"
              placeholder="Empresa o persona"
              class="input input-bordered w-full bg-slate-50 border-slate-200 rounded-xl font-bold text-sm"
              @keydown.enter.prevent="verPrecios ? precioRef?.focus() : guardarNuevo()"
            />
          </div>
          <div v-if="verPrecios" class="form-control">
            <label class="label py-1">
              <span class="label-text font-black text-slate-400 uppercase text-[10px]">Precio base (S/)</span>
            </label>
            <input
              ref="precioRef"
              v-model="formNuevo.precioBase"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              class="input input-bordered w-full bg-slate-50 border-slate-200 rounded-xl font-black text-sm"
              @keydown.enter.prevent="guardarNuevo"
            />
          </div>
        </div>
        <div class="p-4 bg-slate-50 border-t flex gap-2 shrink-0">
          <button type="button" @click="volverSeleccion" class="btn btn-ghost btn-sm flex-1 font-bold text-slate-400 uppercase text-[10px]" :disabled="guardando">
            Volver
          </button>
          <button type="button" @click="guardarNuevo" class="btn btn-sm flex-[2] bg-lyer-green text-white border-none rounded-xl uppercase text-[10px] font-black gap-1" :disabled="guardando">
            <span v-if="guardando" class="loading loading-spinner loading-xs" />
            <Plus v-else class="w-4 h-4" />
            Guardar
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
